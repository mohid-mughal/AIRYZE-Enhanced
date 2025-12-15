/**
 * Static Fallback Messages
 * Used when Gemini API is unavailable or fails
 */

/**
 * Get static badge congratulations message
 */
function getStaticBadgeCongrats(badgeId) {
  const messages = {
    'daily_streak_7': 'Amazing! You\'ve checked AQI for 7 days straight! Keep up this healthy habit! 🔥',
    'weekly_streak_4': 'Incredible dedication! A full month of AQI monitoring shows real commitment to your health! 👑',
    'report_contributor': 'Thank you for contributing to the community! Your reports help everyone stay informed! 📝',
    'upvoter': 'Your positive engagement makes our community better! Keep spreading good vibes! 👍',
    'downvoter': 'Thanks for keeping our data quality high! Your vigilance is appreciated! 👎',
    'quiz_master': 'Congratulations! You\'re now an air quality expert! Your knowledge will keep you safe! 🎓',
    'alert_responder': 'You\'re staying on top of air quality changes! Great job being proactive! 📧',
    'city_explorer': 'You\'re a true explorer! Understanding air quality across cities is valuable! 🌍'
  };

  return messages[badgeId] || 'Congratulations on earning this badge! Keep up the great work!';
}

/**
 * Get static quiz feedback based on score
 */
function getStaticQuizFeedback(score) {
  if (score === 100) {
    return "Perfect score! You have excellent knowledge of air quality. Keep using this knowledge to protect your health!";
  } else if (score >= 80) {
    return "Great job! You have a strong understanding of air quality. Review the questions you missed to become an expert!";
  } else if (score >= 60) {
    return "Good effort! You're on the right track. Review the explanations to strengthen your knowledge.";
  } else {
    return "Thanks for taking the quiz! Review the explanations carefully and try again to improve your score.";
  }
}

/**
 * Get static quiz recommendation
 */
function getStaticQuizRecommendation(userProfile, completedQuizzes = []) {
  const allQuizzes = ['kids_adventure', 'asthma_smart', 'senior_safety', 'athlete_quiz', 'general_knowledge'];
  const available = allQuizzes.filter(id => !completedQuizzes.includes(id));

  if (available.length === 0) {
    return {
      quizId: 'general_knowledge',
      reason: 'Refresh your knowledge with this comprehensive quiz!'
    };
  }

  // Simple recommendation based on profile
  if (userProfile?.health_conditions?.includes('asthma') && available.includes('asthma_smart')) {
    return {
      quizId: 'asthma_smart',
      reason: 'This quiz is tailored for managing asthma with air quality awareness.'
    };
  }

  if (userProfile?.age_group === 'senior' && available.includes('senior_safety')) {
    return {
      quizId: 'senior_safety',
      reason: 'Learn important air quality safety tips for seniors.'
    };
  }

  if (userProfile?.age_group === 'child' && available.includes('kids_adventure')) {
    return {
      quizId: 'kids_adventure',
      reason: 'A fun way to learn about air quality!'
    };
  }

  if (userProfile?.activity_level === 'high' && available.includes('athlete_quiz')) {
    return {
      quizId: 'athlete_quiz',
      reason: 'Optimize your training with air quality knowledge.'
    };
  }

  return {
    quizId: available[0],
    reason: 'This quiz matches your profile and interests.'
  };
}

/**
 * Get static badge motivation message
 */
function getStaticBadgeMotivation(badge, currentProgress) {
  const remaining = badge.threshold - currentProgress;
  const percentage = Math.round((currentProgress / badge.threshold) * 100);

  if (percentage >= 80) {
    return `You're almost there! Just ${remaining} more to earn the ${badge.name} badge! 🎯`;
  } else if (percentage >= 50) {
    return `Halfway there! ${remaining} more to go for the ${badge.name} badge! Keep it up! 💪`;
  } else {
    return `Great start! ${remaining} more to earn the ${badge.name} badge! You can do it! 🌟`;
  }
}

/**
 * Get static badge collection summary
 */
function getStaticBadgeCollectionSummary(earnedBadges, totalBadges) {
  const earnedCount = earnedBadges.length;
  const percentage = Math.round((earnedCount / totalBadges) * 100);

  if (earnedCount === totalBadges) {
    return `Amazing! You've earned all ${totalBadges} badges! You're a true air quality champion! 🏆`;
  } else if (percentage >= 75) {
    return `Impressive! You've earned ${earnedCount} out of ${totalBadges} badges (${percentage}%). Just a few more to go! 🌟`;
  } else if (percentage >= 50) {
    return `Great progress! You've earned ${earnedCount} out of ${totalBadges} badges (${percentage}%). Keep up the momentum! 💪`;
  } else if (earnedCount > 0) {
    return `Good start! You've earned ${earnedCount} out of ${totalBadges} badges (${percentage}%). Keep engaging to earn more! 🎯`;
  } else {
    return `Start your badge collection journey! There are ${totalBadges} badges waiting to be earned! 🚀`;
  }
}

module.exports = {
  getStaticBadgeCongrats,
  getStaticQuizFeedback,
  getStaticQuizRecommendation,
  getStaticBadgeMotivation,
  getStaticBadgeCollectionSummary
};
