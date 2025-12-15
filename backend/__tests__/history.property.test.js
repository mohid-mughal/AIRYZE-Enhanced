/**
 * History Property Tests
 * 
 * Property-based tests for AQI history operations.
 * Uses fast-check for generating random test data.
 */

const fc = require('fast-check');
require('dotenv').config();

// Import Supabase client and history controller
const supabase = require('../db');
const { getHistoryForCity, insertAQIData } = require('../controllers/historyController');

// Increase Jest timeout for network operations
jest.setTimeout(60000);

// Track created test records for cleanup
const createdRecordIds = [];

// Cleanup function to remove test records after tests
async function cleanupTestRecords() {
  if (createdRecordIds.length > 0) {
    await supabase.from('aqi_data').delete().in('id', createdRecordIds);
    createdRecordIds.length = 0;
  }
}

// Generate unique location name to avoid conflicts
function generateUniqueLocation() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TestCity_${timestamp}_${random}`;
}

/**
 * Feature: supabase-migration, Property 4: AQI Data Round-Trip
 * Validates: Requirements 4.1, 4.3, 5.3
 * 
 * Property: For any valid AQI measurement data (location_name, lat, lon, aqi,
 * pollutant components, timestamp), after insertion the data should be
 * retrievable with all fields matching the original values.
 */
describe('Property 4: AQI Data Round-Trip', () => {
  afterAll(async () => {
    await cleanupTestRecords();
  });

  test('AQI data round-trip preserves all fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid AQI data
        fc.record({
          lat: fc.double({ min: -90, max: 90, noNaN: true }),
          lon: fc.double({ min: -180, max: 180, noNaN: true }),
          aqi: fc.integer({ min: 1, max: 5 }),
          co: fc.double({ min: 0, max: 5000, noNaN: true }),
          no: fc.double({ min: 0, max: 50, noNaN: true }),
          no2: fc.double({ min: 0, max: 200, noNaN: true }),
          o3: fc.double({ min: 0, max: 200, noNaN: true }),
          so2: fc.double({ min: 0, max: 100, noNaN: true }),
          pm2_5: fc.double({ min: 0, max: 500, noNaN: true }),
          pm10: fc.double({ min: 0, max: 600, noNaN: true }),
          nh3: fc.double({ min: 0, max: 200, noNaN: true })
        }),
        async (aqiData) => {
          // Generate unique location for each test run
          const location_name = generateUniqueLocation();
          
          // Create timestamp (current time)
          const timestamp = new Date().toISOString();

          // Prepare complete AQI data
          const completeAqiData = {
            location_name,
            lat: aqiData.lat,
            lon: aqiData.lon,
            aqi: aqiData.aqi,
            co: aqiData.co,
            no: aqiData.no,
            no2: aqiData.no2,
            o3: aqiData.o3,
            so2: aqiData.so2,
            pm2_5: aqiData.pm2_5,
            pm10: aqiData.pm10,
            nh3: aqiData.nh3,
            timestamp
          };

          // Insert AQI data
          const insertedRecord = await insertAQIData(completeAqiData);
          expect(insertedRecord).toBeDefined();
          expect(insertedRecord.id).toBeDefined();
          
          // Track for cleanup
          createdRecordIds.push(insertedRecord.id);

          // Retrieve the record
          const { data: retrievedRecords, error } = await supabase
            .from('aqi_data')
            .select('*')
            .eq('id', insertedRecord.id)
            .single();

          // Verify retrieval succeeded
          expect(error).toBeNull();
          expect(retrievedRecords).toBeDefined();

          // Verify all fields match (with tolerance for floating point)
          expect(retrievedRecords.location_name).toBe(location_name);
          expect(retrievedRecords.aqi).toBe(aqiData.aqi);
          
          // For floating point values, use closeTo matcher
          expect(retrievedRecords.lat).toBeCloseTo(aqiData.lat, 6);
          expect(retrievedRecords.lon).toBeCloseTo(aqiData.lon, 6);
          expect(retrievedRecords.co).toBeCloseTo(aqiData.co, 2);
          expect(retrievedRecords.no).toBeCloseTo(aqiData.no, 2);
          expect(retrievedRecords.no2).toBeCloseTo(aqiData.no2, 2);
          expect(retrievedRecords.o3).toBeCloseTo(aqiData.o3, 2);
          expect(retrievedRecords.so2).toBeCloseTo(aqiData.so2, 2);
          expect(retrievedRecords.pm2_5).toBeCloseTo(aqiData.pm2_5, 2);
          expect(retrievedRecords.pm10).toBeCloseTo(aqiData.pm10, 2);
          expect(retrievedRecords.nh3).toBeCloseTo(aqiData.nh3, 2);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});


/**
 * Feature: supabase-migration, Property 5: AQI History Ordering
 * Validates: Requirements 4.2
 * 
 * Property: For any set of AQI records for a city, when retrieved via
 * the history endpoint, the records should be ordered by timestamp in
 * descending order (most recent first).
 */
describe('Property 5: AQI History Ordering', () => {
  afterAll(async () => {
    await cleanupTestRecords();
  });

  test('AQI history is ordered by timestamp descending', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of timestamps (at least 3 records)
        fc.array(
          fc.record({
            aqi: fc.integer({ min: 1, max: 5 }),
            // Generate timestamps with different offsets
            timestampOffset: fc.integer({ min: 0, max: 86400000 }) // 0 to 24 hours in ms
          }),
          { minLength: 3, maxLength: 5 }
        ),
        async (records) => {
          // Generate unique location for this test
          const location_name = generateUniqueLocation();
          const baseTime = Date.now();

          // Insert all records with different timestamps
          const insertedIds = [];
          for (const record of records) {
            const timestamp = new Date(baseTime - record.timestampOffset).toISOString();
            
            const aqiData = {
              location_name,
              lat: 24.8607,
              lon: 67.0011,
              aqi: record.aqi,
              co: 100.0,
              no: 1.0,
              no2: 10.0,
              o3: 50.0,
              so2: 5.0,
              pm2_5: 25.0,
              pm10: 40.0,
              nh3: 2.0,
              timestamp
            };

            const inserted = await insertAQIData(aqiData);
            insertedIds.push(inserted.id);
          }

          // Track for cleanup
          createdRecordIds.push(...insertedIds);

          // Retrieve history using the controller function
          const history = await getHistoryForCity(location_name);

          // Verify we got records back
          expect(history).toBeDefined();
          expect(history.length).toBeGreaterThan(0);

          // Verify ordering: each timestamp should be >= the next one (descending)
          for (let i = 0; i < history.length - 1; i++) {
            const currentTimestamp = new Date(history[i].timestamp).getTime();
            const nextTimestamp = new Date(history[i + 1].timestamp).getTime();
            
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  }, 180000);
});

/**
 * Feature: supabase-migration, Property 6: AQI History Filtering
 * Validates: Requirements 4.4
 * 
 * Property: For any set of AQI records across multiple cities, querying
 * by a specific location_name should return only records matching that
 * location_name.
 */
describe('Property 6: AQI History Filtering', () => {
  afterAll(async () => {
    await cleanupTestRecords();
  });

  test('AQI history filtering returns only matching city records', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate data for multiple cities
        fc.array(
          fc.record({
            aqi: fc.integer({ min: 1, max: 5 })
          }),
          { minLength: 2, maxLength: 4 }
        ),
        async (cityRecords) => {
          // Generate unique location names for each city
          const cities = cityRecords.map(() => generateUniqueLocation());
          const targetCity = cities[0]; // We'll query for the first city
          const timestamp = new Date().toISOString();

          // Insert records for all cities
          const insertedIds = [];
          for (let i = 0; i < cities.length; i++) {
            const aqiData = {
              location_name: cities[i],
              lat: 24.8607 + i, // Different coordinates for each city
              lon: 67.0011 + i,
              aqi: cityRecords[i].aqi,
              co: 100.0,
              no: 1.0,
              no2: 10.0,
              o3: 50.0,
              so2: 5.0,
              pm2_5: 25.0,
              pm10: 40.0,
              nh3: 2.0,
              timestamp
            };

            const inserted = await insertAQIData(aqiData);
            insertedIds.push(inserted.id);
          }

          // Track for cleanup
          createdRecordIds.push(...insertedIds);

          // Retrieve history for the target city
          const history = await getHistoryForCity(targetCity);

          // Verify we got records back
          expect(history).toBeDefined();
          expect(history.length).toBeGreaterThan(0);

          // Verify all returned records match the target city
          for (const record of history) {
            expect(record.location_name).toBe(targetCity);
          }

          // Verify we don't get records from other cities
          const otherCities = cities.slice(1);
          for (const record of history) {
            for (const otherCity of otherCities) {
              expect(record.location_name).not.toBe(otherCity);
            }
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  }, 180000);
});
