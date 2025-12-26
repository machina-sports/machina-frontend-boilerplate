#!/usr/bin/env node

/**
 * Script to restore boilerplate to development mode
 * Restores example files and dependencies
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
if (fs.existsSync(gitignorePath)) {
  let gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');

  // Remove boilerplate section
  const separator = '\n# Boilerplate example files (added by prepare:production)\n';
  const boilerplateStart = gitignoreContent.indexOf(separator);

  if (boilerplateStart !== -1) {
    const beforeSection = gitignoreContent.substring(0, boilerplateStart);
    const afterSection = gitignoreContent.substring(boilerplateStart);
    const nextSectionStart = afterSection.indexOf('\n#');

    let updatedGitignore = beforeSection;
    if (nextSectionStart !== -1 && nextSectionStart < afterSection.length) {
      // Find the end of the boilerplate section (before next section or end of file)
      const sectionEnd = afterSection.indexOf('\n', nextSectionStart);
      if (sectionEnd !== -1) {
        updatedGitignore += afterSection.substring(sectionEnd);
      }
    } else {
      // No next section, remove everything after separator including trailing newline
      const sectionEnd = afterSection.indexOf('\n\n');
      if (sectionEnd !== -1) {
        updatedGitignore += afterSection.substring(sectionEnd + 1);
      }
    }

    fs.writeFileSync(gitignorePath, updatedGitignore, 'utf-8');
  }
}

// Restore dependencies in package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
let hasChanges = false;

// Restore dependencies (with versions from original)
const originalDeps = {
  'react-markdown': '^10.1.0',
  'react-syntax-highlighter': '^16.1.0',
};

const originalDevDeps = {
  '@types/react-syntax-highlighter': '^15.5.13',
};

// Add back dependencies
config.exampleDependencies.dependencies.forEach((dep) => {
  if (!packageJson.dependencies[dep]) {
    packageJson.dependencies[dep] = originalDeps[dep] || 'latest';
    hasChanges = true;
  }
});

// Add back devDependencies
config.exampleDependencies.devDependencies.forEach((dep) => {
  if (!packageJson.devDependencies[dep]) {
    packageJson.devDependencies[dep] = originalDevDeps[dep] || 'latest';
    hasChanges = true;
  }
});

if (hasChanges) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
}
