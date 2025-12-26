#!/usr/bin/env node

/**
 * Script to prepare boilerplate for production use
 * Removes example files and dependencies from the project
 *
 * NOTE: Code references (imports, providers) should be removed manually
 * to avoid breaking the application. This script only handles files and dependencies.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'boilerplate-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const rootDir = path.join(__dirname, '..');
const gitignorePath = path.join(rootDir, '.gitignore');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read current .gitignore
let gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Add example files to .gitignore if not already present
const gitignoreEntries = config.exampleFiles.map((file) => {
  // Ensure proper path format
  const normalizedPath = file.startsWith('/') ? file.slice(1) : file;
  return normalizedPath;
});

let updatedGitignore = gitignoreContent;
const separator = '\n# Boilerplate example files (added by prepare:production)\n';
const boilerplateSection = separator + gitignoreEntries.join('\n') + '\n';

if (!gitignoreContent.includes('# Boilerplate example files')) {
  updatedGitignore += boilerplateSection;
  fs.writeFileSync(gitignorePath, updatedGitignore, 'utf-8');
}

// Remove example dependencies from package.json
let hasChanges = false;

// Remove from dependencies
config.exampleDependencies.dependencies.forEach((dep) => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    hasChanges = true;
  }
});

// Remove from devDependencies
config.exampleDependencies.devDependencies.forEach((dep) => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep];
    hasChanges = true;
  }
});

if (hasChanges) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
}

// Show manual steps for code cleanup
if (config.codeReferencesToRemove) {
  Object.entries(config.codeReferencesToRemove).forEach(([filePath, references]) => {
    references.forEach((ref) => {
      if (ref.import) {
        console.log(`      - Remove import: ${ref.import}`);
      }
    });
  });
}
