import fs from "fs-extra";
import path from "path";

export default async function postGenerate(context, outputPath) {
  const { projectName, answers, options } = context;

  console.log(`✨ Finalizing ${projectName}`);

  // Don't create files in dry-run mode
  if (options?.dryRun) {
    console.log("📝 Dry-run mode: skipping file creation");
    return;
  }

  // Create additional directories
  await fs.ensureDir(path.join(outputPath, "dist"));
  await fs.ensureDir(path.join(outputPath, "tests"));

  // Create a simple test file
  const testContent = `
import { HelloWorld } from '../src/helloWorld';

describe('HelloWorld', () => {
  it('should greet correctly', () => {
    const hw = new HelloWorld();
    expect(hw.greet('SDK')).toBe('${answers.greeting}, SDK!');
  });
  
  it('should accept custom greeting', () => {
    const hw = new HelloWorld('Hi');
    expect(hw.greet('World')).toBe('Hi, World!');
  });
  
  it('should return schema info', () => {
    const hw = new HelloWorld();
    const schemaInfo = hw.getSchemaInfo();
    expect(schemaInfo).toBeDefined();
  });
});
`;

  await fs.writeFile(
    path.join(outputPath, "tests", "helloWorld.test.ts"),
    testContent.trim(),
  );

  // Create TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      declaration: true,
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "tests"],
  };

  await fs.writeJSON(
    path.join(outputPath, "tsconfig.json"),
    tsConfig,
    { spaces: 2 },
  );

  // Create Jest config
  const jestConfig = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    testMatch: ["**/*.test.ts"],
    collectCoverageFrom: [
      "src/**/*.ts",
      "!src/**/*.d.ts",
    ],
  };

  await fs.writeJSON(
    path.join(outputPath, "jest.config.json"),
    jestConfig,
    { spaces: 2 },
  );

  // Create ESLint config
  const eslintConfig = {
    parser: "@typescript-eslint/parser",
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  };

  await fs.writeJSON(
    path.join(outputPath, ".eslintrc.json"),
    eslintConfig,
    { spaces: 2 },
  );

  console.log("📦 Package structure created successfully!");
  console.log("📝 TypeScript configuration added");
  console.log("🧪 Test file created");
  console.log("✅ ESLint configuration added");
}
