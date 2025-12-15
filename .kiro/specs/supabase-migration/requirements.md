# Requirements Document

## Introduction

This specification covers the migration of the Airyze AQI Monitor application from local PostgreSQL to Supabase. This is a foundational change that enables cloud-hosted database capabilities while maintaining the existing MVC architecture and all current functionality. The migration preserves the custom authentication system (bcrypt) while leveraging Supabase's database infrastructure.

## Glossary

- **Supabase**: An open-source Firebase alternative providing PostgreSQL database, authentication, and real-time subscriptions
- **Supabase Client**: JavaScript library (@supabase/supabase-js) for interacting with Supabase services
- **SUPABASE_URL**: Environment variable containing the Supabase project URL
- **SUPABASE_ANON_KEY**: Environment variable containing the Supabase anonymous/public API key
- **Query Builder**: Supabase's chainable method syntax for database operations (e.g., .from().select().eq())
- **AQI_System**: The Airyze AQI Monitor backend application
- **Users_Table**: Database table storing user account information
- **AQI_Data_Table**: Database table storing historical air quality measurements

## Requirements

### Requirement 1

**User Story:** As a developer, I want to migrate the database connection to Supabase so that data is hosted reliably in the cloud without requiring local PostgreSQL setup.

#### Acceptance Criteria

1. WHEN the AQI_System server starts THEN the AQI_System SHALL establish a connection to Supabase using SUPABASE_URL and SUPABASE_ANON_KEY environment variables
2. WHEN the Supabase connection is established THEN the AQI_System SHALL log a success message confirming database connectivity
3. IF the Supabase connection fails THEN the AQI_System SHALL log an error message with connection details and terminate gracefully
4. WHEN the AQI_System initializes THEN the AQI_System SHALL verify that required tables (users, aqi_data) exist in Supabase

### Requirement 2

**User Story:** As a developer, I want all database queries converted to Supabase query builder syntax so that the application uses Supabase methods consistently.

#### Acceptance Criteria

1. WHEN a database operation is performed THEN the AQI_System SHALL use Supabase query builder methods instead of raw SQL queries
2. WHEN converting SELECT queries THEN the AQI_System SHALL use supabase.from(table).select() syntax
3. WHEN converting INSERT queries THEN the AQI_System SHALL use supabase.from(table).insert() syntax
4. WHEN converting UPDATE queries THEN the AQI_System SHALL use supabase.from(table).update().eq() syntax
5. WHEN converting DELETE queries THEN the AQI_System SHALL use supabase.from(table).delete().eq() syntax

### Requirement 3

**User Story:** As a user, I want to register and login with my credentials so that my account works seamlessly after the database migration.

#### Acceptance Criteria

1. WHEN a user submits the signup form THEN the AQI_System SHALL insert user data into the Supabase users table with hashed password
2. WHEN a user submits valid login credentials THEN the AQI_System SHALL retrieve the user record from Supabase and verify the password hash
3. IF a user attempts to register with an existing email THEN the AQI_System SHALL return an error indicating the email is already registered
4. WHEN user authentication succeeds THEN the AQI_System SHALL return user data excluding the password field

### Requirement 4

**User Story:** As a user, I want to view historical AQI data so that analytics features continue working after migration.

#### Acceptance Criteria

1. WHEN a user requests historical AQI data for a city THEN the AQI_System SHALL retrieve records from the Supabase aqi_data table
2. WHEN fetching historical data THEN the AQI_System SHALL order results by timestamp in descending order
3. WHEN storing new AQI measurements THEN the AQI_System SHALL insert records into the Supabase aqi_data table with all pollutant components
4. WHEN querying AQI history THEN the AQI_System SHALL support filtering by location_name parameter

### Requirement 5

**User Story:** As a developer, I want the database schema preserved in Supabase so that data integrity is maintained during and after migration.

#### Acceptance Criteria

1. WHEN creating the users table in Supabase THEN the AQI_System SHALL define columns: id (serial pk), name (varchar), email (varchar unique), password (varchar), city (varchar), last_aqi (integer), created_at (timestamp)
2. WHEN creating the aqi_data table in Supabase THEN the AQI_System SHALL define columns: id (serial pk), location_name (varchar), lat (decimal), lon (decimal), aqi (integer), co/no/no2/o3/so2/pm2_5/pm10/nh3 (decimal), timestamp (timestamp not null), created_at (timestamp)
3. WHEN the AQI_System performs database operations THEN the AQI_System SHALL maintain referential integrity and data type consistency

### Requirement 6

**User Story:** As a developer, I want email alert functionality to work with Supabase so that scheduled jobs continue operating correctly.

#### Acceptance Criteria

1. WHEN the daily alert cron job runs THEN the AQI_System SHALL query all users from Supabase with their city preferences
2. WHEN the change detection job runs THEN the AQI_System SHALL compare current AQI with last_aqi stored in Supabase
3. WHEN an alert is sent THEN the AQI_System SHALL update the user's last_aqi field in Supabase
4. WHEN fetching users for alerts THEN the AQI_System SHALL retrieve email, city, and last_aqi fields from Supabase

### Requirement 7

**User Story:** As a developer, I want proper error handling for all Supabase operations so that failures are logged and handled gracefully.

#### Acceptance Criteria

1. WHEN a Supabase query fails THEN the AQI_System SHALL catch the error and log relevant details
2. WHEN a Supabase operation returns an error THEN the AQI_System SHALL return an appropriate HTTP status code to the client
3. IF a database constraint violation occurs THEN the AQI_System SHALL return a user-friendly error message
4. WHEN handling Supabase responses THEN the AQI_System SHALL check for both data and error properties in the response
