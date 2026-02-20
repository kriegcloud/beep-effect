export default {
  name: "hello-world-template",
  description: "A simple Hello World SDK template",

  // Define prompts for user input
  prompts: [
    {
      type: "input",
      name: "greeting",
      message: "What greeting would you like to use?",
      default: "Hello, World!",
    },
    {
      type: "input",
      name: "author",
      message: "Author name?",
      default: "SDK Generator",
    },
    {
      type: "input",
      name: "license",
      message: "License?",
      default: "MIT",
    },
  ],

  // Files to process as EJS templates
  templateFiles: ["**/*.ejs"],

  // Files to copy without processing
  staticFiles: ["_gitignore"],

  // Hooks for custom logic
  hooks: {
    beforeGenerate: "./scripts/pre-generate.js",
    afterGenerate: "./scripts/post-generate.js",
  },

  // Schema transformer
  transformers: {
    default: "./transformers/default.js",
  },
};
