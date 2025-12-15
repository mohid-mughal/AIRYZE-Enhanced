# Test Suite Documentation

This directory contains property-based tests for the Supabase migration using the `fast-check` library.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with verbose output
VERBOSE_TESTS=1 npm test

# Run tests with coverage
npm test -- --coverage

# Run a specific test file
npm test -- auth.property.test.js

# Run tests in watch mode (for development)
npm test -- --watch
```

## Test Structure

### Property-Based Tests

Property-based tests verify that certain properties hold true across a wide range of randomly generated inputs. Each test runs 100 iterations by default.

Test files follow the naming convention: `*.property.test.js`

### Test Utilities

The `testUtils.js` file provides helper functions for:

- **createTestClient()**: Create a Supabase client for testing
- **generateUniqueEmail()**: Generate unique email addresses for test users
- **generateUniqueLocation()**: Generate unique location names for test data
- **UserCleanup**: Class for tracking and cleaning up test users
- **AQIDataCleanup**: Class for tracking and cleaning up test AQI records
- **verifyConnection()**: Verify Supabase connection is working
- **wait()**: Utility for adding delays when needed

### Example Usage

```javascript
const { 
  generateUniqueEmail, 
  UserCleanup 
} = require('./testUtils');
const supabase = require('../db');

describe('My Test Suite', () => {
  const userCleanup = new UserCleanup(supabase);

  afterAll(async () => {
    await userCleanup.cleanup();
  });

  test('my test', async () => {
    const email = generateUniqueEmail();
    userCleanup.track(email);
    
    // ... test code ...
  });
});
```

## Test Configuration

### Jest Configuration

The `jest.config.js` file configures:
- Test environment (Node.js)
- Test file patterns
- Setup files
- Coverage collection
- Timeout settings (30 seconds default)

### Setup File

The `setup.js` file runs before all tests and:
- Loads environment variables from `.env`
- Verifies required environment variables are present
- Sets default timeouts
- Configures console output (suppressed unless `VERBOSE_TESTS=1`)

## Environment Variables

Tests require the following environment variables in your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Test Categories

### 1. Database Connection Tests
- `db.property.test.js` - Tests Supabase client initialization

### 2. Authentication Tests
- `auth.property.test.js` - Tests user signup, login, and response sanitization

### 3. History Tests
- `history.property.test.js` - Tests AQI data operations, ordering, and filtering

### 4. Alert Tests
- `alerts.property.test.js` - Tests user alert data retrieval and updates

### 5. Error Handling Tests
- `supabaseErrors.property.test.js` - Tests error response handling

## Writing New Tests

When writing new property-based tests:

1. **Import required utilities**:
   ```javascript
   const fc = require('fast-check');
   const { generateUniqueEmail, UserCleanup } = require('./testUtils');
   ```

2. **Set up cleanup**:
   ```javascript
   const cleanup = new UserCleanup(supabase);
   afterAll(async () => await cleanup.cleanup());
   ```

3. **Write the property test**:
   ```javascript
   test('my property', async () => {
     await fc.assert(
       fc.asyncProperty(
         fc.record({ /* generators */ }),
         async (data) => {
           // Test logic
           expect(result).toBe(expected);
           return true;
         }
       ),
       { numRuns: 100 }
     );
   });
   ```

4. **Tag with property information**:
   ```javascript
   /**
    * Feature: supabase-migration, Property X: Property Name
    * Validates: Requirements X.Y
    */
   ```

## Troubleshooting

### Tests Timeout
- Increase timeout in individual tests: `test('name', async () => {...}, 60000)`
- Or increase global timeout in `jest.config.js`

### Connection Errors
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is accessible
- Ensure tables exist in Supabase

### Cleanup Issues
- Tests should clean up their own data
- Use cleanup utilities to track created records
- Check `afterAll` hooks are properly configured

### Random Test Failures
- Property-based tests use random data
- If a test fails, fast-check will show the failing input
- Use that input to create a specific unit test for the edge case

## Best Practices

1. **Always clean up test data** - Use cleanup utilities in `afterAll` hooks
2. **Use unique identifiers** - Use `generateUniqueEmail()` and `generateUniqueLocation()`
3. **Run enough iterations** - Default 100 runs, increase for critical properties
4. **Test real functionality** - Avoid mocks, test against actual Supabase
5. **Document properties** - Add comments explaining what property is being tested
6. **Handle async properly** - Use `fc.asyncProperty` for async tests
7. **Set appropriate timeouts** - Property tests need longer timeouts than unit tests
