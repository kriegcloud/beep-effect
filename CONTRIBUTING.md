# Contributing

The team welcomes contributions!  To make code changes to one of the Conjure repos:

- Fork the repo and make a branch
- Write your code (ideally with tests) and make sure the CircleCI build passes
- Open a PR (optionally linking to a github issue)

## Local Development

### Prerequisites: 

- Node 8+ (On macOS: `brew install node`)
- Yarn package manager 1.6+ (On macOS: `brew install yarn`)

### One-time setup for development

1. Fork the repo and run `yarn` to install dependencies.
1. Install [VSCode](https://code.visualstudio.com/), recommended extensions: [TSLint](https://github.com/Microsoft/vscode-tslint), [Auto Import](https://github.com/soates/Auto-Import)

### Development tips

- Use `yarn lint-fix` to reformat and fix any lint errors using TSLint.
- User `yarn verify` to lint and test
- Use `yarn build` to quickly lint, compile and test the package.
- When modifying the generated code run `RECREATE=true yarn test` to automatically regenerate the test cases
