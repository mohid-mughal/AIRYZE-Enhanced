const { getPersonalizedRecommendations } = require('./controllers/personalizationController');

async function test() {
  const req = {
    body: {
      healthProfile: {
        age_group: '19_40',
        health_conditions: ['asthma'],
        activity_level: 'light_exercise',
        primary_city: 'Karachi'
      },
      aqiData: { aqi: 4, pm25: 45, pm10: 60 }
    }
  };
  
  const res = {
    status: function(code) {
      console.log('Status called with:', code);
      return this;
    },
    json: function(data) {
      console.log('JSON called with:', JSON.stringify(data, null, 2));
      return this;
    }
  };

  try {
    await getPersonalizedRecommendations(req, res);
    console.log('Success!');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
