/**
 * Quiz Content and Utilities
 * Defines all quiz content and helper functions for the Badges & Quizzes feature
 */

export const QUIZ_DEFINITIONS = [
  {
    id: 'kids_adventure',
    title: "Kids' Air Adventure",
    description: 'Learn about air quality in a fun way!',
    audience: 'children',
    difficulty: 'easy',
    icon: '🎈',
    questions: [
      {
        id: 1,
        question: 'What is AQI?',
        options: [
          'Air Quality Index - tells us how clean the air is',
          'A type of weather',
          'A kind of cloud',
          'The temperature outside'
        ],
        correctIndex: 0,
        explanation: 'AQI stands for Air Quality Index. It tells us if the air is clean and safe to breathe!',
        tip: 'When AQI is low (green), it means the air is super clean and great for playing outside!'
      },
      {
        id: 2,
        question: 'What color means the air is GOOD and safe?',
        options: [
          'Green',
          'Red',
          'Yellow',
          'Purple'
        ],
        correctIndex: 0,
        explanation: 'Green means the air quality is good and it\'s safe to play outside!',
        tip: 'Green means GO play outside!'
      },
      {
        id: 3,
        question: 'When should you NOT play outside?',
        options: [
          'When AQI is red (5)',
          'When it\'s sunny',
          'When it\'s cloudy',
          'In the morning'
        ],
        correctIndex: 0,
        explanation: 'When AQI is red (level 5), the air is very poor and it\'s best to stay inside.',
        tip: 'Red AQI means stay inside!'
      },
      {
        id: 4,
        question: 'What can help clean the air indoors?',
        options: [
          'Air purifier',
          'Opening all windows',
          'Turning on TV',
          'Playing music'
        ],
        correctIndex: 0,
        explanation: 'Air purifiers have special filters that clean the air inside your home!',
        tip: 'Air purifiers filter bad stuff!'
      },
      {
        id: 5,
        question: 'PM2.5 is...',
        options: [
          'Tiny particles in air',
          'A type of game',
          'A TV channel',
          'A snack'
        ],
        correctIndex: 0,
        explanation: 'PM2.5 are super tiny dust particles in the air that can be harmful to breathe.',
        tip: 'PM2.5 are super tiny dust particles!'
      },
      {
        id: 6,
        question: 'What should you do when AQI is yellow (3)?',
        options: [
          'Play less outside',
          'Play more outside',
          'Eat more candy',
          'Watch more TV'
        ],
        correctIndex: 0,
        explanation: 'Yellow AQI means moderate air quality - it\'s okay to play outside but take it easy!',
        tip: 'Yellow means be careful outside!'
      },
      {
        id: 7,
        question: 'Who should be extra careful about air quality?',
        options: [
          'Kids with asthma',
          'Only adults',
          'Only teachers',
          'Only doctors'
        ],
        correctIndex: 0,
        explanation: 'Kids with asthma or breathing problems need to be extra careful about air quality.',
        tip: 'Kids with asthma need clean air!'
      },
      {
        id: 8,
        question: 'What makes air dirty?',
        options: [
          'Car smoke and factories',
          'Rain',
          'Wind',
          'Sunshine'
        ],
        correctIndex: 0,
        explanation: 'Smoke from cars, trucks, and factories releases pollution that makes the air dirty.',
        tip: 'Smoke from cars pollutes air!'
      }
    ]
  },
  {
    id: 'asthma_smart',
    title: 'Asthma-Smart Quiz',
    description: 'Essential air quality knowledge for asthma management',
    audience: 'asthma_patients',
    difficulty: 'medium',
    icon: '🫁',
    questions: [
      {
        id: 1,
        question: 'At what AQI level should people with asthma start limiting outdoor activities?',
        options: [
          'AQI 3 (Moderate)',
          'AQI 1 (Good)',
          'AQI 5 (Very Poor)',
          'Never'
        ],
        correctIndex: 0,
        explanation: 'People with asthma should start being cautious at AQI level 3 (Moderate) and limit strenuous outdoor activities.',
        tip: 'Start being cautious at AQI 3!'
      },
      {
        id: 2,
        question: 'Which pollutant is most dangerous for asthma patients?',
        options: [
          'PM2.5',
          'Water vapor',
          'Oxygen',
          'Nitrogen'
        ],
        correctIndex: 0,
        explanation: 'PM2.5 particles are small enough to penetrate deep into the lungs and can trigger asthma attacks.',
        tip: 'PM2.5 can trigger asthma attacks!'
      },
      {
        id: 3,
        question: 'What should you ALWAYS carry when AQI is high?',
        options: [
          'Rescue inhaler',
          'Umbrella',
          'Sunglasses',
          'Water bottle'
        ],
        correctIndex: 0,
        explanation: 'Your rescue inhaler is essential when air quality is poor, as symptoms can develop quickly.',
        tip: 'Keep your rescue inhaler handy!'
      },
      {
        id: 4,
        question: 'Best time to exercise outdoors when you have asthma?',
        options: [
          'When AQI is 1-2 (Good/Fair)',
          'Anytime',
          'When AQI is 5',
          'At night only'
        ],
        correctIndex: 0,
        explanation: 'Exercise outdoors only when AQI is 1-2 (Good/Fair) to minimize exposure to pollutants.',
        tip: 'Exercise when air is cleanest!'
      },
      {
        id: 5,
        question: 'What type of mask is best for asthma patients in poor AQI?',
        options: [
          'N95 mask',
          'Cloth mask',
          'Surgical mask',
          'No mask needed'
        ],
        correctIndex: 0,
        explanation: 'N95 masks filter out at least 95% of airborne particles, including PM2.5.',
        tip: 'N95 filters small particles!'
      },
      {
        id: 6,
        question: 'Indoor air quality tip for asthma patients?',
        options: [
          'Use air purifier with HEPA filter',
          'Open all windows',
          'Use incense',
          'Smoke indoors'
        ],
        correctIndex: 0,
        explanation: 'HEPA filters remove 99.97% of particles, including allergens and pollutants.',
        tip: 'HEPA filters remove allergens!'
      },
      {
        id: 7,
        question: 'Warning signs to stop outdoor activity?',
        options: [
          'Wheezing or chest tightness',
          'Feeling energetic',
          'Mild sweating',
          'Normal breathing'
        ],
        correctIndex: 0,
        explanation: 'Wheezing, chest tightness, or difficulty breathing are signs to stop activity immediately.',
        tip: 'Stop if breathing becomes difficult!'
      },
      {
        id: 8,
        question: 'How does ozone (O3) affect asthma?',
        options: [
          'Irritates airways',
          'Helps breathing',
          'No effect',
          'Cures asthma'
        ],
        correctIndex: 0,
        explanation: 'Ground-level ozone irritates the airways and can trigger asthma symptoms.',
        tip: 'Ozone can trigger symptoms!'
      },
      {
        id: 9,
        question: 'Best indoor activity when AQI is 4-5?',
        options: [
          'Yoga or light stretching',
          'Running in place',
          'Heavy lifting',
          'Intense cardio'
        ],
        correctIndex: 0,
        explanation: 'Gentle exercises like yoga minimize breathing rate while keeping you active.',
        tip: 'Gentle exercise is safer indoors!'
      },
      {
        id: 10,
        question: 'When should you consult a doctor?',
        options: [
          'If symptoms worsen despite precautions',
          'Only once a year',
          'Never',
          'Only in emergencies'
        ],
        correctIndex: 0,
        explanation: 'If your asthma symptoms worsen despite taking precautions, consult your doctor for treatment adjustment.',
        tip: 'Regular check-ups are important!'
      }
    ]
  },
  {
    id: 'senior_safety',
    title: 'Senior Citizen Safety Quiz',
    description: 'Air quality safety for older adults',
    audience: 'seniors',
    difficulty: 'medium',
    icon: '👴👵',
    questions: [
      {
        id: 1,
        question: 'At what AQI should seniors limit outdoor activities?',
        options: [
          'AQI 3 (Moderate) or higher',
          'AQI 5 only',
          'Never limit',
          'AQI 1'
        ],
        correctIndex: 0,
        explanation: 'Seniors are more sensitive to air pollution and should limit outdoor activities at AQI 3 or higher.',
        tip: 'Seniors are more sensitive to pollution!'
      },
      {
        id: 2,
        question: 'Best time for morning walks when AQI is moderate?',
        options: [
          'Early morning (6-7 AM)',
          'Noon',
          'Evening rush hour',
          'Late night'
        ],
        correctIndex: 0,
        explanation: 'Air quality is usually better early in the morning before traffic increases.',
        tip: 'Air is usually cleaner early morning!'
      },
      {
        id: 3,
        question: 'What should seniors monitor when AQI is high?',
        options: [
          'Heart rate and breathing',
          'Only temperature',
          'Only blood pressure',
          'Nothing special'
        ],
        correctIndex: 0,
        explanation: 'Poor air quality can affect heart rate and breathing, especially in seniors with existing conditions.',
        tip: 'Watch for unusual symptoms!'
      },
      {
        id: 4,
        question: 'Indoor air quality for seniors with heart conditions?',
        options: [
          'Keep windows closed, use purifier',
          'Open all windows',
          'Use fans only',
          'No special care needed'
        ],
        correctIndex: 0,
        explanation: 'When outdoor AQI is poor, keep windows closed and use an air purifier to protect indoor air quality.',
        tip: 'Protect indoor air quality!'
      },
      {
        id: 5,
        question: 'Medication reminder when AQI is poor?',
        options: [
          'Take prescribed medications on time',
          'Skip medications',
          'Double the dose',
          'Take only if symptoms appear'
        ],
        correctIndex: 0,
        explanation: 'Consistent medication adherence is crucial, especially when air quality is poor.',
        tip: 'Stay consistent with medications!'
      },
      {
        id: 6,
        question: 'Safe indoor exercises for seniors?',
        options: [
          'Chair yoga, stretching, walking indoors',
          'Heavy weightlifting',
          'Running',
          'Jumping'
        ],
        correctIndex: 0,
        explanation: 'Gentle, low-impact exercises like chair yoga and stretching are safe and beneficial for seniors.',
        tip: 'Gentle movement is best!'
      },
      {
        id: 7,
        question: 'Hydration importance in poor air quality?',
        options: [
          'Drink more water to help body cope',
          'Drink less water',
          'Only drink coffee',
          'No change needed'
        ],
        correctIndex: 0,
        explanation: 'Staying well-hydrated helps your body cope with the stress of poor air quality.',
        tip: 'Stay well hydrated!'
      },
      {
        id: 8,
        question: 'When to seek medical attention?',
        options: [
          'Chest pain, severe shortness of breath',
          'Mild tiredness',
          'Normal breathing',
          'After exercise'
        ],
        correctIndex: 0,
        explanation: 'Chest pain or severe shortness of breath are serious symptoms requiring immediate medical attention.',
        tip: 'Don\'t ignore serious symptoms!'
      },
      {
        id: 9,
        question: 'Best way to stay informed about AQI?',
        options: [
          'Check app daily, set up alerts',
          'Guess by looking outside',
          'Ask neighbors',
          'Check once a month'
        ],
        correctIndex: 0,
        explanation: 'Daily monitoring and alerts help you plan activities and take precautions when needed.',
        tip: 'Daily monitoring helps planning!'
      }
    ]
  },
  {
    id: 'athlete_quiz',
    title: 'Outdoor Athlete Quiz',
    description: 'Optimize your training with air quality awareness',
    audience: 'athletes',
    difficulty: 'medium',
    icon: '🏃‍♂️',
    questions: [
      {
        id: 1,
        question: 'Best AQI level for intense outdoor training?',
        options: [
          'AQI 1-2 (Good/Fair)',
          'AQI 4-5',
          'Any AQI',
          'AQI 3'
        ],
        correctIndex: 0,
        explanation: 'Intense training increases breathing rate, so train hard only when air quality is good or fair.',
        tip: 'Train hard when air is clean!'
      },
      {
        id: 2,
        question: 'How does poor AQI affect athletic performance?',
        options: [
          'Reduces oxygen intake, decreases endurance',
          'Improves performance',
          'No effect',
          'Increases speed'
        ],
        correctIndex: 0,
        explanation: 'Pollutants reduce oxygen delivery to muscles, decreasing endurance and performance.',
        tip: 'Pollution limits oxygen delivery!'
      },
      {
        id: 3,
        question: 'What to do if AQI is 3 (Moderate) on race day?',
        options: [
          'Reduce intensity, take breaks',
          'Push harder',
          'Cancel race',
          'Ignore it'
        ],
        correctIndex: 0,
        explanation: 'Adjust your effort level and take breaks to minimize exposure during moderate AQI.',
        tip: 'Adjust effort to conditions!'
      },
      {
        id: 4,
        question: 'Best alternative when AQI is 4-5?',
        options: [
          'Indoor gym workout',
          'Outdoor sprint training',
          'Long outdoor run',
          'Outdoor cycling'
        ],
        correctIndex: 0,
        explanation: 'Move your training indoors when AQI is poor to avoid breathing polluted air.',
        tip: 'Move training indoors!'
      },
      {
        id: 5,
        question: 'Breathing technique in moderate AQI?',
        options: [
          'Breathe through nose, slower pace',
          'Mouth breathing only',
          'Hyperventilate',
          'Hold breath'
        ],
        correctIndex: 0,
        explanation: 'Nose breathing filters some particles, and a slower pace reduces total pollutant intake.',
        tip: 'Nose filters some particles!'
      },
      {
        id: 6,
        question: 'Recovery after training in poor AQI?',
        options: [
          'Extra rest, hydration, monitor symptoms',
          'Train harder next day',
          'No special care',
          'Immediate intense workout'
        ],
        correctIndex: 0,
        explanation: 'Your body needs extra recovery time after exposure to polluted air during exercise.',
        tip: 'Body needs more recovery time!'
      },
      {
        id: 7,
        question: 'Pre-workout check for athletes?',
        options: [
          'Check AQI, adjust plan accordingly',
          'Only check weather',
          'No checks needed',
          'Only check temperature'
        ],
        correctIndex: 0,
        explanation: 'Always check AQI before training and adjust your workout plan based on air quality.',
        tip: 'Plan workouts around air quality!'
      },
      {
        id: 8,
        question: 'Nutrition tip for training in moderate AQI?',
        options: [
          'Antioxidant-rich foods (berries, greens)',
          'Fast food',
          'Skip meals',
          'Only protein'
        ],
        correctIndex: 0,
        explanation: 'Antioxidants help your body fight the oxidative stress caused by air pollution.',
        tip: 'Antioxidants help fight pollution!'
      },
      {
        id: 9,
        question: 'Warning signs to stop outdoor workout?',
        options: [
          'Unusual fatigue, chest tightness, dizziness',
          'Normal sweating',
          'Mild tiredness',
          'Increased heart rate'
        ],
        correctIndex: 0,
        explanation: 'Unusual symptoms like chest tightness or dizziness mean you should stop immediately.',
        tip: 'Listen to your body!'
      },
      {
        id: 10,
        question: 'Long-term training strategy?',
        options: [
          'Mix indoor/outdoor based on AQI',
          'Always train outdoors',
          'Never train outdoors',
          'Ignore AQI'
        ],
        correctIndex: 0,
        explanation: 'A flexible approach that adapts to air quality helps maintain consistent training.',
        tip: 'Flexibility is key to consistency!'
      }
    ]
  },
  {
    id: 'general_knowledge',
    title: 'General Knowledge Quiz',
    description: 'Test your air quality knowledge',
    audience: 'general',
    difficulty: 'medium',
    icon: '🧠',
    questions: [
      {
        id: 1,
        question: 'What does AQI measure?',
        options: [
          'Air pollution levels',
          'Temperature',
          'Humidity',
          'Wind speed'
        ],
        correctIndex: 0,
        explanation: 'AQI (Air Quality Index) measures the level of air pollution and its health effects.',
        tip: 'AQI shows how polluted the air is!'
      },
      {
        id: 2,
        question: 'AQI scale used in this app?',
        options: [
          '1-5 (US EPA standard)',
          '0-100',
          '0-500',
          '1-10'
        ],
        correctIndex: 0,
        explanation: 'This app uses a simplified 1-5 scale based on the US EPA standard for easy understanding.',
        tip: 'We use 1-5 scale for simplicity!'
      },
      {
        id: 3,
        question: 'What does PM2.5 mean?',
        options: [
          'Particles smaller than 2.5 micrometers',
          'Pollution at 2:5 PM',
          'A type of gas',
          'Temperature measure'
        ],
        correctIndex: 0,
        explanation: 'PM2.5 refers to particulate matter smaller than 2.5 micrometers in diameter.',
        tip: 'PM2.5 are tiny particles!'
      },
      {
        id: 4,
        question: 'Main sources of air pollution in cities?',
        options: [
          'Vehicle emissions, factories, construction',
          'Trees',
          'Rain',
          'Wind'
        ],
        correctIndex: 0,
        explanation: 'Urban air pollution mainly comes from vehicles, industrial facilities, and construction activities.',
        tip: 'Human activities cause most pollution!'
      },
      {
        id: 5,
        question: 'What is ozone (O3)?',
        options: [
          'A pollutant at ground level',
          'Always good for health',
          'A type of oxygen',
          'Water vapor'
        ],
        correctIndex: 0,
        explanation: 'While ozone in the upper atmosphere protects us, ground-level ozone is a harmful pollutant.',
        tip: 'Ground-level ozone is harmful!'
      },
      {
        id: 6,
        question: 'Best way to reduce personal pollution exposure?',
        options: [
          'Check AQI daily, adjust activities',
          'Ignore air quality',
          'Always stay indoors',
          'Move to another city'
        ],
        correctIndex: 0,
        explanation: 'Daily AQI monitoring and activity adjustment is the most practical way to reduce exposure.',
        tip: 'Awareness and adaptation help!'
      },
      {
        id: 7,
        question: 'What does NO2 (Nitrogen Dioxide) come from?',
        options: [
          'Vehicle exhaust, power plants',
          'Plants',
          'Ocean',
          'Mountains'
        ],
        correctIndex: 0,
        explanation: 'NO2 is primarily produced by combustion processes in vehicles and power plants.',
        tip: 'NO2 mainly from combustion!'
      },
      {
        id: 8,
        question: 'How does weather affect AQI?',
        options: [
          'Wind disperses, rain cleans pollutants',
          'No effect',
          'Always makes it worse',
          'Only temperature matters'
        ],
        correctIndex: 0,
        explanation: 'Wind can disperse pollutants and rain can wash them out, improving air quality.',
        tip: 'Weather can help or trap pollution!'
      },
      {
        id: 9,
        question: 'Who is most vulnerable to air pollution?',
        options: [
          'Children, elderly, people with health conditions',
          'Only adults',
          'Only men',
          'Only women'
        ],
        correctIndex: 0,
        explanation: 'Children, elderly, and those with respiratory or heart conditions are most vulnerable.',
        tip: 'Some groups need extra protection!'
      },
      {
        id: 10,
        question: 'Long-term exposure to poor AQI can cause?',
        options: [
          'Respiratory diseases, heart problems',
          'Better health',
          'No effects',
          'Improved immunity'
        ],
        correctIndex: 0,
        explanation: 'Chronic exposure to air pollution increases risk of respiratory and cardiovascular diseases.',
        tip: 'Chronic exposure is serious!'
      }
    ]
  }
];

/**
 * Get a quiz by its ID
 * @param {string} quizId - The unique identifier of the quiz
 * @returns {Object|null} The quiz object or null if not found
 */
export const getQuizById = (quizId) => {
  return QUIZ_DEFINITIONS.find(quiz => quiz.id === quizId) || null;
};

/**
 * Calculate the score for a completed quiz
 * @param {Array} answers - Array of answer objects with {questionId, selectedIndex, isCorrect}
 * @param {Object} quiz - The quiz object
 * @returns {Object} Score object with {correct, total, percentage}
 */
export const calculateScore = (answers, quiz) => {
  if (!answers || !quiz || !quiz.questions) {
    return { correct: 0, total: 0, percentage: 0 };
  }

  const correct = answers.filter(answer => answer.isCorrect).length;
  const total = quiz.questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    correct,
    total,
    percentage
  };
};

/**
 * Get personalized quiz recommendation based on user profile
 * @param {Object} userProfile - User's health profile with age, conditions, activity level
 * @returns {Object|null} Recommended quiz object or null
 */
export const getQuizRecommendation = (userProfile) => {
  if (!userProfile) {
    return QUIZ_DEFINITIONS.find(quiz => quiz.id === 'general_knowledge');
  }

  const { age, healthConditions, activityLevel } = userProfile;

  // Recommend based on health conditions
  if (healthConditions && healthConditions.includes('asthma')) {
    return getQuizById('asthma_smart');
  }

  // Recommend based on age
  if (age && age >= 60) {
    return getQuizById('senior_safety');
  }

  if (age && age <= 12) {
    return getQuizById('kids_adventure');
  }

  // Recommend based on activity level
  if (activityLevel && (activityLevel === 'high' || activityLevel === 'athlete')) {
    return getQuizById('athlete_quiz');
  }

  // Default to general knowledge
  return getQuizById('general_knowledge');
};
