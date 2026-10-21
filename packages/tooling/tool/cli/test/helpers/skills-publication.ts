// The content the skills crash writer publishes; tests assert against the same values.
export const intendedFile = '[skills]\ninclude_instructions = true\nfuture_key = "kept"\n';
export const intendedTree = [
  { path: "SKILL.md", text: "---\nname: crash\ndescription: Published.\n---\n" },
  { path: "references/notes.md", text: "notes\n" },
] as const;
