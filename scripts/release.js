#!/usr/bin/env node

/**
 * @recallnet/external-mcp release script
 *
 * This script automates the release process by:
 * 1. Validating the working directory is clean
 * 2. Running tests to ensure quality
 * 3. Updating the version (patch, minor, or major)
 * 4. Generating changelog entries
 * 5. Creating a release commit
 * 6. Creating a git tag
 * 7. Publishing to npm
 *
 * Usage:
 *   node scripts/release.js [patch|minor|major]
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import readline from "readline";

// Configuration
const PACKAGE_JSON_PATH = path.resolve(process.cwd(), "package.json");
const CHANGELOG_PATH = path.resolve(process.cwd(), "CHANGELOG.md");
const DEFAULT_VERSION_INCREMENT = "patch";
const VALID_VERSION_INCREMENTS = ["patch", "minor", "major"];

/**
 * Executes a shell command and returns the output
 * @param {string} command The command to execute
 * @param {boolean} silent Whether to suppress output to console
 * @returns {string} The command output
 */
function execCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: "utf-8" });
    if (!silent) console.log(output);
    return output.trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.stdout?.toString() || error.message);
    process.exit(1);
  }
}

/**
 * Reads the package.json file
 * @returns {Object} The parsed package.json content
 */
function readPackageJson() {
  try {
    const content = readFileSync(PACKAGE_JSON_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading package.json:", error.message);
    process.exit(1);
  }
}

/**
 * Writes content to the package.json file
 * @param {Object} content The content to write
 */
function writePackageJson(content) {
  try {
    writeFileSync(
      PACKAGE_JSON_PATH,
      JSON.stringify(content, null, 2) + "\n",
      "utf-8",
    );
  } catch (error) {
    console.error("Error writing package.json:", error.message);
    process.exit(1);
  }
}

/**
 * Creates or updates the changelog
 * @param {string} version The new version
 * @param {string} changes The changes to add
 */
function updateChangelog(version, changes) {
  try {
    let content = "";

    if (existsSync(CHANGELOG_PATH)) {
      content = readFileSync(CHANGELOG_PATH, "utf-8");
    } else {
      content =
        "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n";
    }

    const today = new Date().toISOString().split("T")[0];
    const newEntry = `## [${version}] - ${today}\n\n${changes}\n\n`;

    // Insert after the header
    const lines = content.split("\n");
    let headerEndIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("## [")) {
        headerEndIndex = i;
        break;
      }
    }

    if (headerEndIndex === -1) {
      // No existing entries, add after the intro paragraph
      const parts = content.split("\n\n");
      if (parts.length >= 2) {
        content =
          parts[0] +
          "\n\n" +
          parts[1] +
          "\n\n" +
          newEntry +
          parts.slice(2).join("\n\n");
      } else {
        content += newEntry;
      }
    } else {
      lines.splice(headerEndIndex, 0, newEntry);
      content = lines.join("\n");
    }

    writeFileSync(CHANGELOG_PATH, content, "utf-8");
    console.log(`Updated changelog with ${version} entry`);
  } catch (error) {
    console.error("Error updating changelog:", error.message);
    process.exit(1);
  }
}

/**
 * Gets the changes since the last tag
 * @returns {string} The formatted changes
 */
function getChangesSinceLastTag() {
  try {
    // Get the last tag
    let lastTag = "";
    try {
      lastTag = execCommand("git describe --tags --abbrev=0", true);
    } catch (error) {
      // No tags yet, use all commits
      console.log("No previous tags found, using all commits");
    }

    // Get commits since the last tag (or all commits if no tag)
    const commitRange = lastTag ? `${lastTag}..HEAD` : "";
    const commits = execCommand(
      `git log ${commitRange} --pretty=format:"%s (%h)" --no-merges`,
      true,
    )
      .split("\n")
      .filter(Boolean);

    if (commits.length === 0) {
      console.error("No changes since the last tag");
      process.exit(1);
    }

    // Group commits by type
    const types = {
      Features: [],
      "Bug Fixes": [],
      Documentation: [],
      Tests: [],
      "Build System": [],
      Other: [],
    };

    for (const commit of commits) {
      const lowerCommit = commit.toLowerCase();
      if (lowerCommit.startsWith("feat") || lowerCommit.includes("feature")) {
        types["Features"].push(commit);
      } else if (lowerCommit.startsWith("fix") || lowerCommit.includes("bug")) {
        types["Bug Fixes"].push(commit);
      } else if (
        lowerCommit.startsWith("docs") ||
        lowerCommit.includes("documentation")
      ) {
        types["Documentation"].push(commit);
      } else if (lowerCommit.startsWith("test")) {
        types["Tests"].push(commit);
      } else if (
        lowerCommit.startsWith("build") ||
        lowerCommit.startsWith("ci")
      ) {
        types["Build System"].push(commit);
      } else {
        types["Other"].push(commit);
      }
    }

    // Format the changes
    let changes = "";
    for (const [type, typeCommits] of Object.entries(types)) {
      if (typeCommits.length > 0) {
        changes += `### ${type}\n\n`;
        for (const commit of typeCommits) {
          changes += `- ${commit}\n`;
        }
        changes += "\n";
      }
    }

    return changes.trim();
  } catch (error) {
    console.error("Error getting changes:", error.message);
    process.exit(1);
  }
}

/**
 * Creates an interactive readline interface
 * @returns {Promise<readline.Interface>} The readline interface
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Asks a question and waits for user input
 * @param {readline.Interface} rl The readline interface
 * @param {string} question The question to ask
 * @returns {Promise<string>} The user's answer
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${question} `, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Get the version increment type from command line args or use default
    const versionIncrement = process.argv[2] || DEFAULT_VERSION_INCREMENT;

    if (!VALID_VERSION_INCREMENTS.includes(versionIncrement)) {
      console.error(`Invalid version increment: ${versionIncrement}`);
      console.error(
        `Valid options are: ${VALID_VERSION_INCREMENTS.join(", ")}`,
      );
      process.exit(1);
    }

    // Check if the working directory is clean
    const status = execCommand("git status --porcelain", true);
    if (status) {
      console.error(
        "Working directory is not clean. Please commit or stash changes before releasing.",
      );
      process.exit(1);
    }

    // Run tests, linting, and build to ensure quality
    console.log("Running quality checks...");
    execCommand("npm run format");
    execCommand("npm run lint");
    execCommand("npm test");
    execCommand("npm run build");

    // Update the version
    const packageJson = readPackageJson();
    const currentVersion = packageJson.version;
    console.log(`Current version: ${currentVersion}`);

    // Calculate the new version
    let newVersion;

    // Use npm version to calculate the new version
    newVersion = execCommand(
      `npm --no-git-tag-version version ${versionIncrement}`,
      true,
    );
    newVersion = newVersion.replace("v", "");

    console.log(`New version: ${newVersion}`);

    // Generate the changelog entry
    const changes = getChangesSinceLastTag();
    console.log("\nChanges since last tag:");
    console.log(changes);

    // Confirm with the user
    const rl = createReadlineInterface();
    const confirmation = await askQuestion(
      rl,
      `\nReady to release version ${newVersion}? (y/n):`,
    );

    if (confirmation.toLowerCase() !== "y") {
      console.log("Release canceled");
      // Revert the version change in package.json
      execCommand(`npm --no-git-tag-version version ${currentVersion}`, true);
      rl.close();
      process.exit(0);
    }

    // Update the changelog
    updateChangelog(newVersion, changes);

    // Commit the changes
    console.log("Creating release commit...");
    execCommand("git add package.json package-lock.json CHANGELOG.md");
    execCommand(`git commit -m "Release v${newVersion}"`);

    // Create a tag
    console.log("Creating git tag...");
    execCommand(`git tag -a v${newVersion} -m "Version ${newVersion}"`);

    // Ask if we should push to remote
    const shouldPush = await askQuestion(
      rl,
      "Push changes and tags to remote? (y/n):",
    );

    if (shouldPush.toLowerCase() === "y") {
      console.log("Pushing to remote...");
      execCommand("git push");
      execCommand("git push --tags");
    }

    // Ask if we should publish to npm
    const shouldPublish = await askQuestion(rl, "Publish to npm? (y/n):");

    if (shouldPublish.toLowerCase() === "y") {
      console.log("Publishing to npm...");
      execCommand("npm publish");
    }

    console.log(`\nRelease v${newVersion} completed successfully!`);
    rl.close();
  } catch (error) {
    console.error("Error in release process:", error.message);
    process.exit(1);
  }
}

main();
