// Wires up husky and points git at .husky/ from the monorepo root.
// Idempotent and non-blocking: never fails install if git/husky aren't usable.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:path';
import path from 'node:path';

const run = (cmd, opts = {}) =>
    execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();

try {
    run('npx --no-install husky');
} catch {
    // husky binary missing or already configured; ignore.
}

try {
    const repoRoot = run('git rev-parse --show-toplevel');
    const huskyDir = path.resolve(process.cwd(), '.husky');
    const rel = path.relative(repoRoot, huskyDir).replace(/\\/g, '/');
    run(`git config core.hooksPath "${rel}"`, { cwd: repoRoot });
} catch {
    // Not a git checkout (e.g. CI tarball install) — skip silently.
}
