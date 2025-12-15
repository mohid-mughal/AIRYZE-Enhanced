-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  last_aqi INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create aqi_data table
CREATE TABLE IF NOT EXISTS aqi_data (
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

-- Create index for location_name lookups
CREATE INDEX IF NOT EXISTS idx_aqi_data_location ON aqi_data(location_name);

-- Create index for timestamp ordering
CREATE INDEX IF NOT EXISTS idx_aqi_data_timestamp ON aqi_data(timestamp DESC);
