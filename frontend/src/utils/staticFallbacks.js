/**
 * Static Fallback Messages
 * Provides fallback messages when Gemini API is unavailable
 */

/**
 * Static congratulations messages for each badge
 */
export const BADGE_CONGRATULATIONS = {
  'daily_streak_7': [
    "Amazing! You've checked the AQI for 7 days straight! 🔥 Building this healthy habit shows real commitment to protecting your health.",
    "Congratulations on your 7-day streak! 🔥 You're developing a great habit of staying informed about air quality.",
    "Way to go! Seven consecutive days of AQI checks! 🔥 Your dedication to monitoring air quality is impressive!"
  ],
  'weekly_streak_4': [
    "Incredible! A full month of daily AQI checks! 👑 You're a true champion of air quality awareness.",
    "You've earned the Monthly Champion badge! 👑 28 days of consistent monitoring - that's dedication!",
    "Outstanding achievement! 👑 Four weeks of staying informed about air quality. You're setting a great example!"
  ],
  'report_contributor': [
    "Thank you for being a Helpful Citizen! 📝 Your 5 crowd reports help the entire community stay informed.",
    "Congratulations! 📝 You've contributed 5 valuable reports to help others understand local air quality.",
    "You're making a difference! 📝 Your crowd reports provide real-time insights for your community."
  ],
  'upvoter': [
    "Spreading Positive Vibes! 👍 Your 10 upvotes help highlight accurate and helpful air quality reports.",
    "Great job! 👍 You've upvoted 10 reports, helping the community identify valuable information.",
    "Thank you for your positive engagement! 👍 Your upvotes make the community stronger."
  ],
  'downvoter': [
    "Quality Keeper badge earned! 👎 Your 10 downvotes help maintain accurate air quality information.",
    "Excellent work! 👎 You're helping keep our community data reliable and trustworthy.",
    "Thank you for being a Quality Keeper! 👎 Your vigilance helps everyone get accurate information."
  ],
  'quiz_master': [
    "Quiz Master achieved! 🎓 You've completed 3 quizzes and expanded your air quality knowledge significantly.",
    "Congratulations, Quiz Master! 🎓 Your commitment to learning about air quality is commendable.",
    "You're now a Quiz Master! 🎓 Three quizzes completed - you're becoming an air quality expert!"
  ],
  'alert_responder': [
    "Alert Pro status unlocked! 📧 You've opened 5 email alerts, staying on top of air quality changes.",
    "Great job, Alert Pro! 📧 Your responsiveness to air quality alerts shows excellent health awareness.",
    "You're an Alert Pro! 📧 Opening 5 alerts means you're serious about protecting your health."
  ],
  'city_explorer': [
    "City Explorer badge earned! 🌍 You've checked AQI for 5 different cities - your curiosity is inspiring!",
    "Congratulations, City Explorer! 🌍 Exploring air quality across 5 cities shows great environmental awareness.",
    "You're a true City Explorer! 🌍 Checking multiple cities helps you understand air quality patterns."
  ]
};

/**
 * Get a random congratulations message for a badge
 * @param {string} badgeId - The badge identifier
 * @returns {string} Congratulations message
 */
export function getBadgeCongratulations(badgeId) {
  const messages = BADGE_CONGRATULATIONS[badgeId];
  if (!messages || messages.length === 0) {
    return "Congratulations on earning this badge! Your commitment to air quality awareness is making a difference.";
  }
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Static quiz feedback templates based on score ranges
 */
export const QUIZ_FEEDBACK_TEMPLATES = {
  perfect: [
    "Perfect score! You have excellent knowledge about air quality. Keep using this knowledge to protect your health!",
    "Outstanding! You aced this quiz! Your understanding of air quality will help you make informed decisions.",
    "100% correct! You're an air quality expert! Use this knowledge to stay safe and healthy."
  ],
  excellent: [
    "Excellent work! You scored {score}% and demonstrated strong understanding of air quality concepts.",
    "Great job! With {score}%, you clearly understand how to protect yourself from air pollution.",
    "Well done! Your {score}% score shows you're well-informed about air quality and health."
  ],
  good: [
    "Good effort! You scored {score}%. Review the questions you missed to strengthen your air quality knowledge.",
    "Nice work! {score}% is a solid score. Keep learning to better protect your health from air pollution.",
    "You're on the right track with {score}%! A bit more practice and you'll be an air quality expert."
  ],
  needsImprovement: [
    "You scored {score}%. Don't worry - air quality is complex! Review the explanations and try again.",
    "Keep learning! {score}% is a start. Understanding air quality takes time, so don't give up!",
    "You scored {score}%. Take time to review the material - your health is worth the effort!"
  ]
};

/**
 * Get quiz feedback based on score
 * @param {number} score - Score percentage (0-100)
 * @returns {string} Feedback message
 */
export function getQuizFeedback(score) {
  let category;
  if (score === 100) {
    category = 'perfect';
  } else if (score >= 80) {
    category = 'excellent';
  } else if (score >= 60) {
    category = 'good';
  } else {
    category = 'needsImprovement';
  }
  
  const templates = QUIZ_FEEDBACK_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{score}', score);
}

/**
 * Static motivational messages for badge progress
 */
export const BADGE_MOTIVATION_TEMPLATES = {
  justStarted: [
    "You're just getting started! Keep going to unlock the {badgeName} badge.",
    "Great start! You're {percent}% of the way to earning {badgeName}.",
    "Every journey begins with a single step. Keep it up to earn {badgeName}!"
  ],
  halfway: [
    "You're halfway there! Just {remaining} more to unlock {badgeName}.",
    "Great progress! You're {percent}% complete. Keep going to earn {badgeName}!",
    "You're doing great! {remaining} more and the {badgeName} badge is yours!"
  ],
  almostThere: [
    "So close! Just {remaining} more to earn {badgeName}!",
    "You're almost there! {remaining} more and you'll unlock {badgeName}!",
    "Final stretch! Only {remaining} more to get {badgeName}!"
  ]
};

/**
 * Get motivational message for badge progress
 * @param {Object} badge - Badge object with name and threshold
 * @param {number} currentProgress - Current progress value
 * @returns {string} Motivational message
 */
export function getBadgeMotivation(badge, currentProgress) {
  const remaining = badge.threshold - currentProgress;
  const percent = Math.round((currentProgress / badge.threshold) * 100);
  
  let category;
  if (percent < 40) {
    category = 'justStarted';
  } else if (percent < 80) {
    category = 'halfway';
  } else {
    category = 'almostThere';
  }
  
  const templates = BADGE_MOTIVATION_TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template
    .replace('{badgeName}', badge.name)
    .replace('{remaining}', remaining)
    .replace('{percent}', percent);
}

/**
 * Static quiz recommendations based on user profile
 */
export const QUIZ_RECOMMENDATIONS = {
  children: {
    quizId: 'kids_adventure',
    reason: "This fun, age-appropriate quiz will help you learn about air quality in an engaging way!"
  },
  asthma: {
    quizId: 'asthma_smart',
    reason: "Learn essential air quality knowledge to better manage your asthma and stay healthy."
  },
  seniors: {
    quizId: 'senior_safety',
    reason: "Discover important air quality safety tips tailored for older adults."
  },
  athletes: {
    quizId: 'athlete_quiz',
    reason: "Optimize your training by understanding how air quality affects athletic performance."
  },
  general: {
    quizId: 'general_knowledge',
    reason: "Test and expand your understanding of air quality and its health impacts."
  }
};

/**
 * Get quiz recommendation based on user profile
 * @param {Object} userProfile - User's health profile
 * @param {Array} completedQuizzes - Array of completed quiz IDs
 * @returns {Object} Recommendation with quizId and reason
 */
export function getQuizRecommendation(userProfile, completedQuizzes = []) {
  // Filter out completed quizzes
  const available = Object.entries(QUIZ_RECOMMENDATIONS)
    .filter(([_, rec]) => !completedQuizzes.includes(rec.quizId));
  
  if (available.length === 0) {
    return {
      quizId: 'general_knowledge',
      reason: "You've completed many quizzes! Try this one to refresh your knowledge."
    };
  }
  
  // Recommend based on profile
  if (userProfile) {
    const { age, healthConditions, activityLevel } = userProfile;
    
    if (healthConditions?.includes('asthma')) {
      const asthmaRec = available.find(([key]) => key === 'asthma');
      if (asthmaRec) return asthmaRec[1];
    }
    
    if (age && age >= 60) {
      const seniorRec = available.find(([key]) => key === 'seniors');
      if (seniorRec) return seniorRec[1];
    }
    
    if (age && age <= 12) {
      const kidsRec = available.find(([key]) => key === 'children');
      if (kidsRec) return kidsRec[1];
    }
    
    if (activityLevel === 'high' || activityLevel === 'athlete') {
      const athleteRec = available.find(([key]) => key === 'athletes');
      if (athleteRec) return athleteRec[1];
    }
  }
  
  // Default to first available or general
  const generalRec = available.find(([key]) => key === 'general');
  return generalRec ? generalRec[1] : available[0][1];
}

/**
 * Static badge collection summary messages
 */
export const BADGE_COLLECTION_SUMMARIES = {
  none: [
    "Your badge collection journey is just beginning! Start by checking the AQI daily to earn your first badge.",
    "Ready to start collecting badges? Check the AQI regularly and engage with the community!",
    "Every expert was once a beginner. Start earning badges by exploring the app's features!"
  ],
  few: [
    "You've earned {count} out of {total} badges - great start! Keep engaging to unlock more achievements.",
    "Nice progress! {count} badges earned so far. You're {percent}% of the way to collecting them all!",
    "You're building a solid collection with {count} badges! Keep up the momentum!"
  ],
  many: [
    "Impressive! You've earned {count} out of {total} badges ({percent}%). You're a dedicated air quality advocate!",
    "Outstanding collection! {count} badges earned. You're well on your way to becoming a master!",
    "You've collected {count} badges - that's {percent}% complete! Your commitment is inspiring!"
  ],
  complete: [
    "Incredible! You've earned all {total} badges! You're a true air quality champion!",
    "Perfect collection! All {total} badges earned. You've mastered every aspect of the app!",
    "Congratulations! Complete badge collection achieved! You're an inspiration to the community!"
  ]
};

/**
 * Get badge collection summary
 * @param {number} earnedCount - Number of badges earned
 * @param {number} totalCount - Total number of badges
 * @returns {string} Summary message
 */
export function getBadgeCollectionSummary(earnedCount, totalCount) {
  const percent = Math.round((earnedCount / totalCount) * 100);
  
  let category;
  if (earnedCount === 0) {
    category = 'none';
  } else if (earnedCount === totalCount) {
    category = 'complete';
  } else if (percent < 40) {
    category = 'few';
  } else {
    category = 'many';
  }
  
  const templates = BADGE_COLLECTION_SUMMARIES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template
    .replace('{count}', earnedCount)
    .replace('{total}', totalCount)
    .replace('{percent}', percent);
}

/**
 * Static quiz explanation enhancements
 */
export const QUIZ_EXPLANATION_TIPS = {
  general: [
    "Remember: Understanding air quality helps you make better decisions for your health.",
    "Pro tip: Check the AQI daily to stay informed about your local air quality.",
    "Keep learning! Every bit of air quality knowledge helps protect you and your loved ones."
  ],
  asthma: [
    "For asthma management: Always keep your rescue inhaler handy when AQI is elevated.",
    "Asthma tip: Plan outdoor activities when AQI is in the Good or Fair range.",
    "Remember: Your asthma action plan should include air quality considerations."
  ],
  seniors: [
    "Senior safety: Take extra precautions when AQI reaches Moderate levels or higher.",
    "Health tip: Monitor your symptoms closely when air quality declines.",
    "Remember: Staying indoors with an air purifier is best when AQI is poor."
  ],
  athletes: [
    "Training tip: Schedule intense workouts when AQI is Good or Fair.",
    "Performance note: Poor air quality can reduce your endurance by up to 15%.",
    "Remember: Indoor training is always an option when outdoor air quality is poor."
  ],
  children: [
    "Kid-friendly tip: Green AQI means it's great for outdoor play!",
    "Remember: If the air looks hazy, it's best to play inside.",
    "Fun fact: Trees and plants help clean the air naturally!"
  ]
};

/**
 * Get enhanced quiz explanation
 * @param {string} baseExplanation - The base explanation from the quiz
 * @param {string} audience - Target audience (children, asthma, seniors, athletes, general)
 * @returns {string} Enhanced explanation with tip
 */
export function getEnhancedQuizExplanation(baseExplanation, audience = 'general') {
  const tips = QUIZ_EXPLANATION_TIPS[audience] || QUIZ_EXPLANATION_TIPS.general;
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return `${baseExplanation}\n\n${tip}`;
}
