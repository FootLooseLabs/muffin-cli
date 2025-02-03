#!/usr/bin/env node
const { execSync } = require("child_process");

const args = process.argv.slice(2); // Remove "node" and script name
const command = args.shift(); // First argument is the command

const scriptMap = {
  "push-components": "./push-components.sh",
  "pull-components": "./pull-components.sh",
  "push-component": "./push-component.sh",
  "pull-component": "./pull-component.sh",
};

if (!scriptMap[command]) {
  console.error("❌ Unknown command:", command);
  console.log("Usage: epm <command> [arguments]");
  console.log("Available commands: push-components, pull-components, push-component, pull-component");
  process.exit(1);
}

const scriptPath = `${__dirname}/${scriptMap[command]}`;

try {
  execSync(`${scriptPath} ${args.join(" ")}`, { stdio: "inherit" });
} catch (error) {
  process.exit(1);
}