# AI Service Tests

This directory contains both **unit tests** and **integration tests** for the AI Service.

## Test Files

- **`ai.service.spec.ts`** - Unit tests with mocked dependencies (fast, no external dependencies)
- **`ai.service.integration.spec.ts`** - Integration tests with real API calls (slow, requires API key and internet)

## Running Tests

### Run All Tests
```bash
cd apps/worker
pnpm test
```

### Run Only Unit Tests
```bash
cd apps/worker
pnpm test:unit
```

### Run Only Integration Tests
```bash
cd apps/worker
pnpm test:integration
```

### Run Tests in Watch Mode
```bash
cd apps/worker
pnpm test:watch
```

### Run Tests with Coverage
```bash
cd apps/worker
pnpm test:cov
```

## Integration Tests

### Prerequisites

Integration tests require:

1. **GROQ_API_KEY environment variable**
   
   You can set it in multiple ways:
   
   **Option 1: Environment variable (terminal)**
   ```bash
   export GROQ_API_KEY=your_api_key_here
   ```
   
   **Option 2: .env file (recommended)**
   
   Create a `.env` file in `apps/worker/` directory:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```
   
   Jest will automatically load this file when running tests.
   
   **Option 3: Project root .env**
   
   Create a `.env` file in the project root directory. Jest will check here if no worker-level `.env` exists.

2. **Active internet connection** - Tests make real HTTP requests

3. **API credits** - Tests consume Groq API credits (minimal usage)

### What Integration Tests Cover

The integration tests verify real-world scenarios:

#### ✅ Real API Functionality
- Generating summaries with actual Groq API calls
- Fetching content from real URLs
- Processing various article formats
- Handling multiple consecutive requests

#### ✅ Error Handling
- Invalid URLs
- Slow/timeout scenarios
- Rate limiting behavior
- Network failures

#### ✅ Quality Assurance
- Summary quality and length constraints
- Different summaries for different content
- Proper model configuration
- Service initialization

### Test Behavior

**With API Key Set:**
- All integration tests will run
- Tests make real API calls
- May take 30-90 seconds depending on network

**Without API Key:**
- Integration tests are automatically skipped
- No errors are thrown
- Warning message is displayed
- Unit tests continue to run normally

### Expected Duration

- **Unit tests**: < 5 seconds
- **Integration tests**: 30-90 seconds (due to API calls and network latency)

### Cost Considerations

Integration tests make ~10-15 API calls to Groq per full test run. With Groq's pricing model, this typically costs less than $0.01 per test run.

## Test Strategy

### Unit Tests (`ai.service.spec.ts`)
- Run on every commit/PR
- Part of CI/CD pipeline
- Mock all external dependencies
- Focus on logic and edge cases
- Fast feedback loop

### Integration Tests (`ai.service.integration.spec.ts`)
- Run before releases
- Can be part of CI/CD (with API key in secrets)
- Use real services
- Verify actual functionality
- Catch integration issues

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit
  
  integration-tests:
    runs-on: ubuntu-latest
    # Only run on main branch or release branches
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:integration
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
```

## Troubleshooting

### Integration Tests Failing

**Problem:** Tests timeout or fail
- **Solution:** Check internet connection
- **Solution:** Verify GROQ_API_KEY is valid
- **Solution:** Check Groq API status
- **Solution:** Increase timeout values if on slow connection

**Problem:** Rate limiting errors
- **Solution:** Tests include delays between requests
- **Solution:** Reduce parallel execution
- **Solution:** Wait a few minutes and retry

**Problem:** Tests skipped
- **Solution:** Ensure GROQ_API_KEY environment variable is set
- **Solution:** Check that the variable is exported in your shell

### Unit Tests Failing

**Problem:** Mock-related errors
- **Solution:** Clear Jest cache: `pnpm jest --clearCache`
- **Solution:** Ensure all dependencies are installed
- **Solution:** Check that mocks match actual API interfaces

## Best Practices

1. **Run unit tests frequently** during development
2. **Run integration tests** before committing major changes
3. **Don't commit** with failing unit tests
4. **Monitor API usage** if running integration tests frequently
5. **Keep API keys secure** - never commit them to version control

## Adding New Tests

### Adding Unit Tests
```typescript
it('should handle new scenario', () => {
  // Mock dependencies
  mockGroqInstance.chat.completions.create.mockResolvedValue({...});
  
  // Test logic
  const result = await service.generateSummary(article);
  
  // Assertions
  expect(result).toBe('expected value');
});
```

### Adding Integration Tests
```typescript
skipIfNoApiKey()('should test new scenario', async () => {
  // Use real data
  const article = {...};
  
  // Call real service
  const result = await service.generateSummary(article);
  
  // Assert real behavior
  expect(result).toBeDefined();
}, 30000); // timeout in ms
```

## Resources

- [Groq API Documentation](https://console.groq.com/docs)
- [Jest Testing Framework](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
