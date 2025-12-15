# Design Document

## Overview

This design document outlines the technical approach for migrating the Airyze AQI Monitor application from local PostgreSQL to Supabase. The migration involves replacing the `pg` (node-postgres) library with `@supabase/supabase-js`, converting all raw SQL queries to Supabase query builder syntax, and ensuring all existing functionality continues to work seamlessly.

The migration maintains the existing MVC architecture pattern where:
- Controllers handle HTTP requests and responses
- Services contain business logic and external API interactions
- Routes define API endpoints
- The database layer is abstracted through a single module

## Architecture

### Current Architecture (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  (React + Vite + Tailwind)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express)                        │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Routes  │→ │ Controllers  │→ │ Services                │ │
│  └─────────┘  └──────────────┘  └─────────────────────────┘ │
│                      │                      │                │
│                      ▼                      ▼                │
│              ┌──────────────┐      ┌───────────────────┐    │
│              │   db.js      │      │ External APIs     │    │
│              │ (pg Pool)    │      │ (OpenWeather)     │    │
│              └──────────────┘      └───────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Local PostgreSQL     │
         │   (users, aqi_data)    │
         └────────────────────────┘
```

### Target Architecture (Supabase)

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  (React + Vite + Tailwind)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST (unchanged)
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express)                        │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Routes  │→ │ Controllers  │→ │ Services                │ │
│  └─────────┘  └──────────────┘  └─────────────────────────┘ │
│                      │                      │                │
│                      ▼                      ▼                │
│              ┌──────────────┐      ┌───────────────────┐    │
│              │   db.js      │      │ External APIs     │    │
│              │ (Supabase)   │      │ (OpenWeather)     │    │
│              └──────────────┘      └───────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼ HTTPS
         ┌────────────────────────┐
         │   Supabase Cloud       │
         │   (PostgreSQL)         │
         │   (users, aqi_data)    │
         └────────────────────────┘
```

## Components and Interfaces

### 1. Database Module (backend/db.js)

**Current Implementation:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;
```

**New Implementation:**
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### 2. Auth Controller (backend/controllers/authControllers.js)

**Interface Changes:**

| Operation | Old (pg) | New (Supabase) |
|-----------|----------|----------------|
| Check user exists | `pool.query('SELECT * FROM users WHERE email = $1', [email])` | `supabase.from('users').select('*').eq('email', email).single()` |
| Insert user | `pool.query('INSERT INTO users (name, email, password, city) VALUES ($1, $2, $3, $4) RETURNING *', [...])` | `supabase.from('users').insert([{name, email, password, city}]).select().single()` |
| Get user by email | `pool.query('SELECT * FROM users WHERE email = $1', [email])` | `supabase.from('users').select('*').eq('email', email).single()` |

### 3. History Controller (backend/controllers/historyController.js)

**Interface Changes:**

| Operation | Old (pg) | New (Supabase) |
|-----------|----------|----------------|
| Get city history | `pool.query('SELECT * FROM aqi_data WHERE location_name = $1 ORDER BY timestamp DESC LIMIT 30', [city])` | `supabase.from('aqi_data').select('*').eq('location_name', city).order('timestamp', {ascending: false}).limit(30)` |
| Insert AQI data | `pool.query('INSERT INTO aqi_data (...) VALUES (...)', [...])` | `supabase.from('aqi_data').insert([{...}])` |

### 4. Alert Service (backend/services/alertService.js)

**Interface Changes:**

| Operation | Old (pg) | New (Supabase) |
|-----------|----------|----------------|
| Get all users | `pool.query('SELECT * FROM users')` | `supabase.from('users').select('*')` |
| Update last_aqi | `pool.query('UPDATE users SET last_aqi = $1 WHERE id = $2', [aqi, id])` | `supabase.from('users').update({last_aqi: aqi}).eq('id', id)` |

### 5. Environment Variables

**New Required Variables:**
```env
# Remove
DATABASE_URL=postgresql://...

# Add
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Data Models

### Users Table Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  last_aqi INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);
```

### AQI Data Table Schema

```sql
CREATE TABLE aqi_data (
  id SERIAL PRIMARY KEY,
  location_name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  aqi INTEGER,
  co DECIMAL(10, 2),
  no DECIMAL(10, 2),
  no2 DECIMAL(10, 2),
  o3 DECIMAL(10, 2),
  so2 DECIMAL(10, 2),
  pm2_5 DECIMAL(10, 2),
  pm10 DECIMAL(10, 2),
  nh3 DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for location queries
CREATE INDEX idx_aqi_data_location ON aqi_data(location_name);
-- Index for timestamp ordering
CREATE INDEX idx_aqi_data_timestamp ON aqi_data(timestamp DESC);
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified. After reflection to eliminate redundancy, the consolidated properties are:

### Property 1: Supabase Client Initialization
*For any* valid SUPABASE_URL and SUPABASE_ANON_KEY combination, creating a Supabase client should succeed and return a valid client object capable of making queries.
**Validates: Requirements 1.1**

### Property 2: User Signup Round-Trip
*For any* valid user data (name, email, password, city), after signup the user should be retrievable from the database with matching name, email, and city fields, and the stored password hash should verify against the original password.
**Validates: Requirements 3.1, 3.2**

### Property 3: Authentication Response Sanitization
*For any* successful authentication operation (signup or login), the returned user object should contain id, name, email, and city fields but should never contain the password field.
**Validates: Requirements 3.4**

### Property 4: AQI Data Round-Trip
*For any* valid AQI measurement data (location_name, lat, lon, aqi, pollutant components, timestamp), after insertion the data should be retrievable with all fields matching the original values.
**Validates: Requirements 4.1, 4.3, 5.3**

### Property 5: AQI History Ordering
*For any* set of AQI records for a city, when retrieved via the history endpoint, the records should be ordered by timestamp in descending order (most recent first).
**Validates: Requirements 4.2**

### Property 6: AQI History Filtering
*For any* set of AQI records across multiple cities, querying by a specific location_name should return only records matching that location_name.
**Validates: Requirements 4.4**

### Property 7: User Alert Data Retrieval
*For any* user with city and last_aqi fields set, querying users for alerts should return objects containing email, city, and last_aqi fields.
**Validates: Requirements 6.1, 6.4**

### Property 8: Last AQI Update Round-Trip
*For any* user and any valid AQI value, after updating the user's last_aqi field, querying that user should return the updated last_aqi value.
**Validates: Requirements 6.3**

### Property 9: Supabase Response Handling
*For any* Supabase query response, the system should correctly distinguish between success (data present, no error) and failure (error present) states and handle each appropriately.
**Validates: Requirements 7.4**

## Error Handling

### Supabase Error Response Structure

Supabase returns errors in a consistent format:
```javascript
const { data, error } = await supabase.from('table').select();

if (error) {
  // error.message - Human-readable error message
  // error.code - PostgreSQL error code (e.g., '23505' for unique violation)
  // error.details - Additional error details
  // error.hint - Suggestion for fixing the error
}
```

### Error Handling Strategy

1. **Connection Errors**: Log and exit on startup if credentials are invalid
2. **Query Errors**: Catch, log, and return appropriate HTTP status codes
3. **Constraint Violations**: Map to user-friendly messages (e.g., duplicate email)
4. **Network Errors**: Retry with exponential backoff for transient failures

### HTTP Status Code Mapping

| Supabase Error | HTTP Status | User Message |
|----------------|-------------|--------------|
| Unique violation (23505) | 409 Conflict | "Email already registered" |
| Not found | 404 Not Found | "Resource not found" |
| Invalid input | 400 Bad Request | "Invalid input data" |
| Auth error | 401 Unauthorized | "Invalid credentials" |
| Server error | 500 Internal Server Error | "Server error, please try again" |

### Error Handling Pattern

```javascript
async function handleSupabaseOperation(operation) {
  try {
    const { data, error } = await operation;
    
    if (error) {
      console.error('Supabase error:', error.message);
      
      // Map error codes to HTTP responses
      if (error.code === '23505') {
        return { status: 409, error: 'Resource already exists' };
      }
      
      return { status: 500, error: error.message };
    }
    
    return { status: 200, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { status: 500, error: 'Internal server error' };
  }
}
```

## Testing Strategy

### Dual Testing Approach

This migration requires both unit tests and property-based tests to ensure correctness:

1. **Unit Tests**: Verify specific examples and edge cases
2. **Property-Based Tests**: Verify universal properties across generated inputs

### Property-Based Testing Library

**Library**: [fast-check](https://github.com/dubzzz/fast-check) for JavaScript/Node.js

**Configuration**: Each property test should run a minimum of 100 iterations.

### Test Categories

#### 1. Database Connection Tests (Unit)
- Test successful connection with valid credentials
- Test failure handling with invalid credentials
- Test connection retry logic

#### 2. User Operations Tests (Property-Based)
- **Property 2**: User signup round-trip
- **Property 3**: Authentication response sanitization
- Edge case: Duplicate email handling

#### 3. AQI Data Operations Tests (Property-Based)
- **Property 4**: AQI data round-trip
- **Property 5**: AQI history ordering
- **Property 6**: AQI history filtering

#### 4. Alert Service Tests (Property-Based)
- **Property 7**: User alert data retrieval
- **Property 8**: Last AQI update round-trip

#### 5. Error Handling Tests (Unit)
- Test error response mapping
- Test constraint violation handling
- Test network error recovery

### Test File Structure

```
backend/
├── __tests__/
│   ├── db.test.js              # Connection tests
│   ├── auth.test.js            # Auth controller tests
│   ├── auth.property.test.js   # Auth property tests
│   ├── history.test.js         # History controller tests
│   ├── history.property.test.js # History property tests
│   └── alerts.property.test.js  # Alert service property tests
```

### Property Test Format

Each property-based test must be tagged with the property it implements:

```javascript
/**
 * Feature: supabase-migration, Property 2: User Signup Round-Trip
 * Validates: Requirements 3.1, 3.2
 */
test('user signup round-trip preserves data', () => {
  fc.assert(
    fc.property(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 255 }),
        email: fc.emailAddress(),
        password: fc.string({ minLength: 8 }),
        city: fc.string({ minLength: 1, maxLength: 255 })
      }),
      async (userData) => {
        // Signup user
        const signupResult = await signup(userData);
        
        // Retrieve user
        const user = await getUserByEmail(userData.email);
        
        // Verify data matches
        expect(user.name).toBe(userData.name);
        expect(user.email).toBe(userData.email);
        expect(user.city).toBe(userData.city);
        
        // Verify password hash
        const passwordValid = await bcrypt.compare(userData.password, user.password);
        expect(passwordValid).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Test Requirements

- Tests should use a separate Supabase project or test schema
- Each test should clean up created data after execution
- Tests should be idempotent and runnable in any order
