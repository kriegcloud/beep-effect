#!/usr/bin/env node

/**
 * gaia-ui CLI - A wrapper around shadcn CLI with the gaia-ui registry
 * 
 * Usage:
 *   npx @heygaia/ui add <component>
 *   npx @heygaia/ui add raised-button
 */

const { spawn } = require('child_process');

const REGISTRY_URL = 'https://ui.heygaia.io/r';

// Get all arguments after the script name
const args = process.argv.slice(2);

// If no arguments provided, show help
if (args.length === 0) {
  console.log(`
  \x1b[36mgaia-ui\x1b[0m - Beautiful AI components for your Next.js app

  \x1b[1mUsage:\x1b[0m
    npx @heygaia/ui add <component>
    npx @heygaia/ui init

  \x1b[1mCommands:\x1b[0m
    add <component>    Add a component to your project
    init               Initialize gaia-ui in your project
    diff <component>   Show diff of a component

  \x1b[1mExamples:\x1b[0m
    npx @heygaia/ui add raised-button
    npx @heygaia/ui add weather-card
    npx @heygaia/ui add composer

  \x1b[2mVisit https://ui.heygaia.io for full documentation\x1b[0m
`);
  process.exit(0);
}

// Transform component names to full URLs for the 'add' command
const transformedArgs = [...args];
const commandIndex = transformedArgs.findIndex(arg => arg === 'add');

if (commandIndex !== -1) {
  // Get all components after the 'add' command (skip flags)
  for (let i = commandIndex + 1; i < transformedArgs.length; i++) {
    const arg = transformedArgs[i];
    // Skip flags (options starting with -)
    if (arg.startsWith('-')) continue;
    
    // If it's not already a URL or path, convert to full registry URL
    if (!arg.startsWith('http') && !arg.includes('/')) {
      transformedArgs[i] = `${REGISTRY_URL}/${arg}.json`;
    }
  }
}

// Build the final arguments for shadcn
const finalArgs = ['shadcn@latest', ...transformedArgs];

// Spawn npx with the shadcn command
const child = spawn('npx', finalArgs, {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error(`\x1b[31mError:\x1b[0m ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});
