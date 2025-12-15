# Implementation Plan

- [x] 1. Set up Supabase project and dependencies





  - [x] 1.1 Install @supabase/supabase-js package in backend


    - Run `npm install @supabase/supabase-js` in backend directory
    - Verify package is added to package.json
    - _Requirements: 1.1_

  - [x] 1.2 Create Supabase tables via SQL migration

    - Create users table with id, name, email (unique), password, city, last_aqi, created_at
    - Create aqi_data table with id, location_name, lat, lon, aqi, pollutant columns, timestamp, created_at
    - Add indexes for email and location_name lookups
    - _Requirements: 5.1, 5.2_

  - [x] 1.3 Update environment configuration

    - Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.example
    - Document required environment variables in README
    - _Requirements: 1.1_

- [x] 2. Implement Supabase database module






  - [x] 2.1 Replace backend/db.js with Supabase client

    - Import createClient from @supabase/supabase-js
    - Create and export Supabase client instance
    - Add validation for required environment variables
    - Add connection verification on module load
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Write property test for Supabase client initialization

    - **Property 1: Supabase Client Initialization**
    - **Validates: Requirements 1.1**
    - Test that valid credentials create a working client
    - _Requirements: 1.1_

- [x] 3. Migrate authentication controllers





  - [x] 3.1 Refactor signup function in authControllers.js


    - Replace pool.query with supabase.from('users').insert()
    - Use .select().single() to return created user
    - Handle unique constraint errors for duplicate emails
    - Exclude password from returned user object
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 3.2 Refactor login function in authControllers.js


    - Replace pool.query with supabase.from('users').select().eq('email', email).single()
    - Maintain bcrypt password verification
    - Exclude password from returned user object
    - _Requirements: 3.2, 3.4_
  - [x] 3.3 Write property test for user signup round-trip


    - **Property 2: User Signup Round-Trip**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random valid user data and verify round-trip
    - _Requirements: 3.1, 3.2_
  - [x] 3.4 Write property test for authentication response sanitization


    - **Property 3: Authentication Response Sanitization**
    - **Validates: Requirements 3.4**
    - Verify password field is never returned
    - _Requirements: 3.4_

- [x] 4. Checkpoint - Verify authentication works







  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Migrate history controller





  - [x] 5.1 Refactor getHistoryForCity function in historyController.js


    - Replace pool.query with supabase.from('aqi_data').select()
    - Add .eq('location_name', city) for filtering
    - Add .order('timestamp', {ascending: false}) for ordering
    - Add .limit(30) for pagination
    - _Requirements: 4.1, 4.2, 4.4_
  - [x] 5.2 Refactor insertAQIData function in historyController.js


    - Replace pool.query INSERT with supabase.from('aqi_data').insert()
    - Include all pollutant components in insert
    - _Requirements: 4.3_
  - [x] 5.3 Write property test for AQI data round-trip


    - **Property 4: AQI Data Round-Trip**
    - **Validates: Requirements 4.1, 4.3, 5.3**
    - Generate random AQI data and verify all fields preserved
    - _Requirements: 4.1, 4.3, 5.3_
  - [x] 5.4 Write property test for AQI history ordering


    - **Property 5: AQI History Ordering**
    - **Validates: Requirements 4.2**
    - Insert records with various timestamps, verify descending order
    - _Requirements: 4.2_
  - [x] 5.5 Write property test for AQI history filtering


    - **Property 6: AQI History Filtering**
    - **Validates: Requirements 4.4**
    - Insert records for multiple cities, verify filtering works
    - _Requirements: 4.4_


- [x] 6. Checkpoint - Verify history operations work




  - Ensure all tests pass, ask the user if questions arise.


- [x] 7. Migrate alert service




  - [x] 7.1 Refactor getAllUsers function in alertService.js




    - Replace pool.query with supabase.from('users').select('id, email, city, last_aqi')
    - Ensure all required fields for alerts are retrieved
    - _Requirements: 6.1, 6.4_
  - [x] 7.2 Refactor updateLastAQI function in alertService.js

    - Replace pool.query UPDATE with supabase.from('users').update({last_aqi}).eq('id', userId)
    - _Requirements: 6.3_
  - [x] 7.3 Write property test for user alert data retrieval


    - **Property 7: User Alert Data Retrieval**
    - **Validates: Requirements 6.1, 6.4**
    - Verify users query returns email, city, last_aqi fields
    - _Requirements: 6.1, 6.4_
  - [x] 7.4 Write property test for last AQI update round-trip

    - **Property 8: Last AQI Update Round-Trip**
    - **Validates: Requirements 6.3**
    - Update last_aqi and verify retrieval returns new value
    - _Requirements: 6.3_





- [x] 8. Implement error handling utilities



  - [x] 8.1 Create error handling helper module


    - Create backend/utils/supabaseErrors.js
    - Map Supabase error codes to HTTP status codes
    - Create user-friendly error messages
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 8.2 Update controllers to use error handling utilities

    - Apply error handling pattern to authControllers.js
    - Apply error handling pattern to historyController.js
    - Apply error handling pattern to alertService.js
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 8.3 Write property test for Supabase response handling

    - **Property 9: Supabase Response Handling**
    - **Validates: Requirements 7.4**
    - Test both success and error response handling
    - _Requirements: 7.4_


- [x] 9. Update remaining services and controllers



  - [x] 9.1 Migrate majorCitiesController.js if it uses database


    - Review and update any database queries to Supabase syntax
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 9.2 Migrate aqiController.js if it uses database


    - Review and update any database queries to Supabase syntax
    - _Requirements: 2.1, 2.2, 2.3_


- [x] 10. Install test dependencies and configure testing





  - [x] 10.1 Install fast-check and testing dependencies

    - Run `npm install --save-dev fast-check jest` in backend
    - Configure Jest for backend testing
    - _Requirements: Testing Strategy_
  - [x] 10.2 Create test utilities and setup


    - Create test helper for Supabase test client
    - Create cleanup utilities for test data
    - _Requirements: Testing Strategy_


- [x] 11. Final Checkpoint - Complete integration testing




  - Ensure all tests pass, ask the user if questions arise.


- [x] 12. Clean up and documentation




  - [x] 12.1 Remove pg package dependency


    - Run `npm uninstall pg` in backend
    - Remove any remaining pg imports
    - _Requirements: 1.1_
  - [x] 12.2 Update documentation


    - Update README.md with Supabase setup instructions
    - Update API.md if any response formats changed
    - Update SETUP.md with new environment variables
    - _Requirements: 1.1_
