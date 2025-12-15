const geminiService = require('../services/geminiService');
const { getStaticBadgeCongrats, getStaticQuizFeedback } = require('../services/staticFallbacks');

/**
 * Generate badge congratulations message
 */
async function generateBadgeCongrats(req, res) {
  try {
    const { badge, userProfile, progress } = req.body;

    if (!badge || !badge.id) {
      return res.status(400).json({ error: 'Badge information is required' });
    }

    // Try Gemini first
    const message = await geminiService.generateBadgeCongratulations(
      badge,
      userProfile,
      progress
    );

    if (message) {
      return res.json({ message });
    }

    // Fallback to static message
    const fallbackMessage = getStaticBadgeCongrats(badge.id);
    res.json({ message: fallbackMessage });
  } catch (error) {
    console.error('Error generating badge congratulations:', error);
    
    // Return fallback on error
    const fallbackMessage = getStaticBadgeCongrats(req.body.badge?.id);
    res.json({ message: fallbackMessage });
  }
}

/**
 * Generate quiz feedback
 */
async function generateQuizFeedback(req, res) {
  try {
    const { quiz, score, incorrectQuestions, userProfile, currentAqi } = req.body;

    if (!quiz || typeof score !== 'number') {
      return res.status(400).json({ error: 'Quiz and score are required' });
    }

    // Try Gemini first
    const feedback = await geminiService.generateQuizFeedback(
      quiz,
      score,
      incorrectQuestions || [],
      userProfile,
      currentAqi || 3
    );

    if (feedback) {
      return res.json({ feedback });
    }

    // Fallback to static feedback
    const fallbackFeedback = getStaticQuizFeedback(score);
    res.json({ feedback: fallbackFeedback });
  } catch (error) {
    console.error('Error generating quiz feedback:', error);
    
    // Return fallback on error
    const fallbackFeedback = getStaticQuizFeedback(req.body.score);
    res.json({ feedback: fallbackFeedback });
  }
}

/**
 * Generate quiz explanation
 */
async function generateQuizExplanation(req, res) {
  try {
    const { question, userProfile, wasCorrect } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Try Gemini first
    const explanation = await geminiService.generateQuizExplanation(
      question,
      userProfile
    );

    if (explanation) {
      return res.json({ explanation });
    }

    // Fallback to basic explanation
    res.json({ explanation: question.explanation || 'Review the correct answer above.' });
  } catch (error) {
    console.error('Error generating quiz explanation:', error);
    
    // Return basic explanation on error
    res.json({ 
      explanation: req.body.question?.explanation || 'Review the correct answer above.' 
    });
  }
}

/**
 * Generate quiz recommendation
 */
async function generateQuizRecommendation(req, res) {
  try {
    const { userProfile, completedQuizzes, currentAqi } = req.body;

    // Try Gemini first
    const recommendation = await geminiService.generateQuizRecommendation(
      userProfile,
      completedQuizzes || [],
      currentAqi || 3
    );

    if (recommendation) {
      return res.json({ recommendation });
    }

    // Fallback to simple recommendation
    const fallbackQuizId = getFallbackRecommendation(userProfile, completedQuizzes);
    res.json({ 
      recommendation: {
        quizId: fallbackQuizId,
        reason: 'This quiz matches your profile and interests.'
      }
    });
  } catch (error) {
    console.error('Error generating quiz recommendation:', error);
    
    // Return fallback on error
    const fallbackQuizId = getFallbackRecommendation(req.body.userProfile, req.body.completedQuizzes);
    res.json({ 
      recommendation: {
        quizId: fallbackQuizId,
        reason: 'This quiz matches your profile and interests.'
      }
    });
  }
}

/**
 * Generate badge motivation message
 */
async function generateBadgeMotivation(req, res) {
  try {
    const { badge, currentProgress, userProfile } = req.body;

    if (!badge || typeof currentProgress !== 'number') {
      return res.status(400).json({ error: 'Badge and progress are required' });
    }

    // Try Gemini first
    const motivation = await geminiService.generateBadgeMotivation(
      badge,
      currentProgress,
      userProfile
    );

    if (motivation) {
      return res.json({ motivation });
    }

    // Fallback to simple motivation
    const remaining = badge.threshold - currentProgress;
    res.json({ 
      motivation: `You're almost there! Just ${remaining} more to earn the ${badge.name} badge!`
    });
  } catch (error) {
    console.error('Error generating badge motivation:', error);
    
    // Return fallback on error
    const remaining = req.body.badge?.threshold - req.body.currentProgress;
    res.json({ 
      motivation: `You're almost there! Just ${remaining} more to earn the ${req.body.badge?.name} badge!`
    });
  }
}

/**
 * Generate badge collection summary
 */
async function generateBadgeCollectionSummary(req, res) {
  try {
    const { earnedBadges, totalBadges, userProfile } = req.body;

    if (!Array.isArray(earnedBadges) || typeof totalBadges !== 'number') {
      return res.status(400).json({ error: 'Badge collection data is required' });
    }

    // Try Gemini first
    const summary = await geminiService.generateBadgeCollectionSummary(
      earnedBadges,
      totalBadges,
      userProfile
    );

    if (summary) {
      return res.json({ summary });
    }

    // Fallback to simple summary
    const percentage = Math.round((earnedBadges.length / totalBadges) * 100);
    res.json({ 
      summary: `You've earned ${earnedBadges.length} out of ${totalBadges} badges (${percentage}%). Keep up the great work!`
    });
  } catch (error) {
    console.error('Error generating badge collection summary:', error);
    
    // Return fallback on error
    const earnedCount = req.body.earnedBadges?.length || 0;
    const total = req.body.totalBadges || 8;
    const percentage = Math.round((earnedCount / total) * 100);
    res.json({ 
      summary: `You've earned ${earnedCount} out of ${total} badges (${percentage}%). Keep up the great work!`
    });
  }
}

/**
 * Helper function to get fallback quiz recommendation
 */
function getFallbackRecommendation(userProfile, completedQuizzes = []) {
  const allQuizzes = ['kids_adventure', 'asthma_smart', 'senior_safety', 'athlete_quiz', 'general_knowledge'];
  const available = allQuizzes.filter(id => !completedQuizzes.includes(id));

  if (available.length === 0) {
    return 'general_knowledge'; // Default if all completed
  }

  // Simple recommendation based on profile
  if (userProfile?.health_conditions?.includes('asthma') && available.includes('asthma_smart')) {
    return 'asthma_smart';
  }

  if (userProfile?.age_group === 'senior' && available.includes('senior_safety')) {
    return 'senior_safety';
  }

  if (userProfile?.age_group === 'child' && available.includes('kids_adventure')) {
    return 'kids_adventure';
  }

  if (userProfile?.activity_level === 'high' && available.includes('athlete_quiz')) {
    return 'athlete_quiz';
  }

  return available[0];
}

module.exports = {
  generateBadgeCongrats,
  generateQuizFeedback,
  generateQuizExplanation,
  generateQuizRecommendation,
  generateBadgeMotivation,
  generateBadgeCollectionSummary
};
