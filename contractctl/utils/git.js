import fs from "fs";
import { execSync } from "child_process";
import path from "path";

/**
 * Get the diff stats (lines added/removed, files changed) for uncommitted changes
 * in the given repo directory.
 * @param {string} repoPath - Path to the git repository
 * @returns {{ added: number, removed: number, filesChanged: string[] }}
 */
export function getDiffStats(repoPath) {
  const cwd = path.resolve(repoPath);
  ensureGitRepo(cwd);

  const output = execSync("git diff --numstat", { encoding: "utf8", cwd });
  const lines = output.trim().split("\n").filter(Boolean);

  let added = 0;
  let removed = 0;
  const filesChanged = [];

  for (const line of lines) {
    const [addStr, removeStr, file] = line.split(/\s+/);
    const a = parseInt(addStr, 10) || 0;
    const r = parseInt(removeStr, 10) || 0;
    added += a;
    removed += r;
    if (file) filesChanged.push(file);
  }

  return { added, removed, filesChanged };
}

/**
 * Get the list of changed files (including untracked) in the repo.
 * @param {string} repoPath
 * @returns {string[]}
 */
export function getChangedFiles(repoPath) {
  const cwd = path.resolve(repoPath);
  ensureGitRepo(cwd);

  const output = execSync("git status --porcelain", { encoding: "utf8", cwd });
  const files = output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
  return [...new Set(files)];
}

/**
 * Check if package.json (or equivalent) was modified and parse dependency delta.
 * @param {string} repoPath
 * @returns {{ added: string[], removed: string[] }}
 */
export function getDependencyChanges(repoPath) {
  const cwd = path.resolve(repoPath);
  const files = getChangedFiles(cwd);
  const hasPkg = files.some((f) => f === "package.json" || f.endsWith("/package.json"));

  if (!hasPkg) return { added: [], removed: [] };

  try {
    let before = "{}";
    try {
      before = execSync("git show HEAD:package.json", { encoding: "utf8", cwd });
    } catch {
      // No HEAD or file didn't exist
    }
    const afterRaw = fs.readFileSync(path.join(cwd, "package.json"), "utf8");
    const beforePkg = parseJsonSafe(before || "{}");
    const afterPkg = parseJsonSafe(afterRaw);

    const beforeDeps = new Set(Object.keys(beforePkg.dependencies || {}));
    const afterDeps = new Set(Object.keys(afterPkg.dependencies || {}));

    const added = [...afterDeps].filter((d) => !beforeDeps.has(d));
    const removed = [...beforeDeps].filter((d) => !afterDeps.has(d));

    return { added, removed };
  } catch {
    return { added: [], removed: [] };
  }
}

function parseJsonSafe(str) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

function ensureGitRepo(cwd) {
  try {
    execSync("git rev-parse --git-dir", { encoding: "utf8", cwd });
  } catch {
    throw new Error(`Not a git repository: ${cwd}`);
  }
}
