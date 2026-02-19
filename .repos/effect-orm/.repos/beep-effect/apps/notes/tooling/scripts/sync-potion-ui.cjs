const fs = require("fs-extra");
const path = require("node:path");

// Path configuration
const source = path.resolve(__dirname, "../../", "src/registry/ui");
const target = path.resolve(__dirname, "../", "../", "../", "../", "../", "plate-pro/apps/web/src/registry/ui");

// Configuration
const config = {
  // Files to ignore
  ignoreFiles: [
    // Full filename match
    // 'ai-chat-editor.tsx',
    // Suffix matching
    // '*.test.ts',
    // '*.spec.tsx',
    // Prefix matching
    // ignore uploadthing
    // 'media-placeholder-popover.tsx',
    // 'comment-*',
  ],

  // Replacement rules
  replaceRules: [
    {
      name: "hooks path replacement",
      pattern: /@\/hooks\//g,
      replacement: "@beep/notes/registry/hooks/",
    },
    {
      name: "lib path replacement",
      pattern: /@\/lib\//g,
      replacement: "@beep/notes/registry/lib/",
    },
    // {
    //   name: 'editor comments path replacement',
    //   pattern: /\.\.\/editor\/comments\/src/g,
    //   replacement: '@udecode/plate-comments/react',
    // },
    // Example: Add more replacement rules
    // {
    //     name: 'components path replacement',
    //     pattern: /@\/components\//g,
    //     replacement: '@beep/notes/registry/components/'
    // }
  ],
};

// Execute replacements
applyReplacements(source, target)
  .then(() => {
    console.info("Operation completed successfully");
  })
  .catch((error) => {
    console.error("Operation failed:", error);
    process.exit(1);
  });

function shouldIgnoreFile(filename) {
  return config.ignoreFiles.some((pattern) => {
    // Convert wildcard to regex pattern
    const regexPattern = pattern.replaceAll(".", String.raw`\.`).replaceAll("*", ".*");

    return new RegExp(`^${regexPattern}$`).test(filename);
  });
}

async function applyReplacements(sourcePath, targetPath) {
  try {
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source directory does not exist: ${sourcePath}`);
    }

    await fs.ensureDir(targetPath);
    const files = await fs.readdir(sourcePath);

    for (const file of files) {
      // Check if file should be ignored
      if (shouldIgnoreFile(file)) {
        console.info(`Skipping ignored file: ${file}`);

        continue;
      }

      const sourceFilePath = path.join(sourcePath, file);
      const targetFilePath = path.join(targetPath, file);

      const stats = await fs.stat(sourceFilePath);

      if (!stats.isFile()) continue;

      await fs.copy(sourceFilePath, targetFilePath, { overwrite: true });

      // Read file content
      let content = await fs.readFile(targetFilePath, "utf8");
      const originalContent = content;

      // Apply all replacement rules
      let hasChanges = false;
      config.replaceRules.forEach((rule) => {
        const newContent = content.replace(rule.pattern, rule.replacement);

        if (newContent !== content) {
          hasChanges = true;
          content = newContent;
          console.info(`\nFile ${file} applied rule "${rule.name}":`);
          console.info(`  Replace: ${rule.pattern} -> ${rule.replacement}`);
        }
      });

      // Save file if changes were made
      if (hasChanges) {
        await fs.writeFile(targetFilePath, content, "utf8");
        console.info(`  Updated file: ${file}`);
      }
    }

    console.info("\nAll files processed!");
  } catch (error) {
    console.error("An error occurred:", error);

    throw error;
  }
}
