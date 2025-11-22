/**
 * Semantic Release Configuration
 * Automates versioning, changelog generation, and GitHub releases
 *
 * Version bumping rules:
 * - feat: → MINOR version bump (1.0.0 → 1.1.0)
 * - fix: → PATCH version bump (1.0.0 → 1.0.1)
 * - BREAKING CHANGE: → MAJOR version bump (1.0.0 → 2.0.0)
 *
 * Commit message format (Angular convention):
 * type(scope): subject
 *
 * Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
 */

module.exports = {
  // Branches that trigger releases
  branches: [
    { name: 'main', prerelease: false },
    { name: 'develop', prerelease: 'rc' },
  ],

  // Plugins for semantic-release
  plugins: [
    // Analyze commits to determine version bump
    '@semantic-release/commit-analyzer',

    // Generate release notes from commits
    '@semantic-release/release-notes-generator',

    // Update CHANGELOG.md
    '@semantic-release/changelog',

    // Update package.json version and publish to npm
    [
      '@semantic-release/npm',
      {
        pkgRoot: '.',
        tarballDir: 'dist',
      },
    ],

    // Update git with version changes
    [
      '@semantic-release/git',
      {
        // Files to update with version
        assets: ['CHANGELOG.md', 'package.json', 'packages/*/package.json', 'apps/*/package.json'],
        // Commit message format
        message: 'chore(release): <%= nextRelease.version %> [skip ci]\n\n<%= nextRelease.notes %>',
      },
    ],

    // Create GitHub release
    '@semantic-release/github',
  ],

  // Use Angular commit convention for version determination
  preset: 'angular',

  // Additional configuration
  dryRun: false,
  debug: false,
};
