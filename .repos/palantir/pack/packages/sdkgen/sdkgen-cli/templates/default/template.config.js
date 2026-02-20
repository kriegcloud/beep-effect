export default {
  name: "default-template",
  description: "Default SDK template",

  prompts: [
    {
      type: "input",
      name: "description",
      message: "Project description?",
      default: "SDK generated with sdkgen",
    },
    {
      type: "input",
      name: "author",
      message: "Author name?",
      default: "",
    },
  ],

  templateFiles: ["**/*.ejs"],
  staticFiles: ["_gitignore"],
};
