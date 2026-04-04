# Test Suite

Systematic testing of the Effect-NLP library functionality.

## Test Structure

```
test/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for service interactions  
├── e2e/           # End-to-end tests for full workflows
└── fixtures/      # Test data and fixtures
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration  
npm run test:e2e

# Run with coverage
npm run coverage
```

## Test Categories

### Unit Tests
- Core.ts Schema.Class validation
- DocumentProcessor service implementation
- Individual utility functions
- Error handling

### Integration Tests
- DocumentProcessorLive service layer
- wink-nlp + compromise.js integration
- Schema validation pipelines
- Effect service dependencies

### End-to-End Tests
- Full document processing workflows
- Real-world text analysis scenarios
- Performance benchmarks
- API compatibility

## Test Fixtures

Standard test texts covering:
- Financial/business content
- Academic/research papers  
- News articles
- Social media posts
- Technical documentation
- Multi-language samples

## Test Standards

All tests follow Effect testing patterns:
- Use `Effect.runPromise` for async operations
- Test both success and failure cases
- Validate Schema compliance
- Check service layer isolation
- Measure performance characteristics