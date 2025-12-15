/**
 * Quiz Scoring Utilities
 * Functions for calculating and presenting quiz scores
 */

/**
 * Calculate percentage score from correct answers
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} Percentage score (0-100)
 */
export const calculatePercentage = (correct, total) => {
  if (!total || total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
};

/**
 * Determine if the score meets the passing grade
 * @param {number} percentage - Score as percentage (0-100)
 * @param {number} passingThreshold - Minimum percentage to pass (default: 70)
 * @returns {boolean} True if score meets or exceeds passing threshold
 */
export const getPassingGrade = (percentage, passingThreshold = 70) => {
  return percentage >= passingThreshold;
};

/**
 * Generate a comprehensive score summary with performance feedback
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @param {Object} options - Optional configuration
 * @param {number} options.passingThreshold - Passing percentage (default: 70)
 * @returns {Object} Score summary with detailed feedback
 */
export const generateScoreSummary = (correct, total, options = {}) => {
  const { passingThreshold = 70 } = options;
  
  const percentage = calculatePercentage(correct, total);
  const passed = getPassingGrade(percentage, passingThreshold);
  
  // Determine performance level
  let performanceLevel = '';
  let performanceMessage = '';
  let performanceEmoji = '';
  
  if (percentage >= 90) {
    performanceLevel = 'excellent';
    performanceMessage = 'Outstanding! You have excellent knowledge of air quality!';
    performanceEmoji = '🌟';
  } else if (percentage >= 80) {
    performanceLevel = 'great';
    performanceMessage = 'Great job! You have a strong understanding of air quality!';
    performanceEmoji = '🎉';
  } else if (percentage >= 70) {
    performanceLevel = 'good';
    performanceMessage = 'Good work! You have a solid grasp of the basics!';
    performanceEmoji = '👍';
  } else if (percentage >= 60) {
    performanceLevel = 'fair';
    performanceMessage = 'Not bad! Review the explanations to improve your knowledge.';
    performanceEmoji = '📚';
  } else {
    performanceLevel = 'needs_improvement';
    performanceMessage = 'Keep learning! Review the material and try again.';
    performanceEmoji = '💪';
  }
  
  return {
    correct,
    total,
    percentage,
    passed,
    performanceLevel,
    performanceMessage,
    performanceEmoji,
    scoreDisplay: `${correct}/${total}`,
    percentageDisplay: `${percentage}%`
  };
};

/**
 * Get performance badge based on score
 * @param {number} percentage - Score as percentage (0-100)
 * @returns {Object} Badge object with name and icon
 */
export const getPerformanceBadge = (percentage) => {
  if (percentage === 100) {
    return { name: 'Perfect Score', icon: '💯', color: 'gold' };
  } else if (percentage >= 90) {
    return { name: 'Expert', icon: '🏆', color: 'gold' };
  } else if (percentage >= 80) {
    return { name: 'Proficient', icon: '⭐', color: 'silver' };
  } else if (percentage >= 70) {
    return { name: 'Competent', icon: '✓', color: 'bronze' };
  } else if (percentage >= 60) {
    return { name: 'Learner', icon: '📖', color: 'gray' };
  } else {
    return { name: 'Beginner', icon: '🌱', color: 'gray' };
  }
};

/**
 * Calculate improvement suggestions based on incorrect answers
 * @param {Array} answers - Array of answer objects with {questionId, selectedIndex, isCorrect}
 * @param {Object} quiz - The quiz object
 * @returns {Array} Array of improvement suggestions
 */
export const getImprovementSuggestions = (answers, quiz) => {
  if (!answers || !quiz || !quiz.questions) {
    return [];
  }
  
  const incorrectAnswers = answers.filter(answer => !answer.isCorrect);
  const suggestions = [];
  
  // Group incorrect answers by topic/category if available
  incorrectAnswers.forEach(answer => {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    if (question && question.tip) {
      suggestions.push({
        questionId: answer.questionId,
        question: question.question,
        tip: question.tip,
        explanation: question.explanation
      });
    }
  });
  
  return suggestions;
};

/**
 * Format score for display in various contexts
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @param {string} format - Display format ('fraction', 'percentage', 'both')
 * @returns {string} Formatted score string
 */
export const formatScore = (correct, total, format = 'both') => {
  const percentage = calculatePercentage(correct, total);
  
  switch (format) {
    case 'fraction':
      return `${correct}/${total}`;
    case 'percentage':
      return `${percentage}%`;
    case 'both':
    default:
      return `${correct}/${total} (${percentage}%)`;
  }
};
