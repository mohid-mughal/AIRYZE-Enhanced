/**
 * Email Service
 * 
 * Handles sending email alerts using Nodemailer
 */

const nodemailer = require('nodemailer');
const { getAQICategory, getHealthRecommendations } = require('./aqiHelper');

/**
 * Convert markdown text to HTML for emails
 * Supports: **bold**, *italic*, `code`, lists, line breaks
 */
function markdownToHtml(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">$1</code>')
    // Numbered lists: 1. item (convert to HTML list items)
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
    // Bullet lists: - item or * item
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin: 10px 0;">')
    .replace(/\n/g, '<br>');
}

// Check if mock mode is enabled
const isMockMode = process.env.EMAIL_MOCK_MODE === 'true';

// Create transporter with dynamic secure setting based on port
const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
const transporter = isMockMode ? null : nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: emailPort,
  secure: emailPort === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 15000, // 15 seconds timeout
  greetingTimeout: 15000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

/**
 * Send AQI alert email to user with personalization
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} city - City name
 * @param {number} aqi - Current AQI value
 * @param {string} alertType - Type of alert ('daily', 'change', or 'instant')
 * @param {Object} healthProfile - User's health profile (optional)
 * @param {Object} aqiData - Full AQI data with components (optional)
 * @param {number} userId - User ID for tracking (optional)
 * @returns {Promise<void>}
 */
async function sendAQIAlert(email, name, city, aqi, alertType = 'daily', healthProfile = null, aqiData = null, userId = null) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const error = new Error('Email service is not configured. Please contact the administrator.');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    const category = getAQICategory(aqi);
    let recommendations = getHealthRecommendations(aqi);
    let personalizedMessage = null;
    let healthSpecificAdvice = [];

    // Prepare AQI data object
    const fullAqiData = aqiData || { aqi, components: {} };

    // Try to get personalized content if health profile exists
    if (healthProfile) {
      try {
        const { generatePersonalizedRecommendations, generateEmailContent } = require('./geminiService');
        const { getRuleBasedRecommendations, healthAdviceRules, elderlyAdvice } = require('./personalizationHelper');
        
        // Try to get Gemini-generated personalized message
        try {
          const user = { name, city, health_profile: healthProfile };
          personalizedMessage = await generateEmailContent(user, fullAqiData, alertType);
        } catch (geminiError) {
          console.log('Gemini email content generation failed, using structured approach:', geminiError.message);
        }

        // Get personalized recommendations
        const personalizedRecs = await generatePersonalizedRecommendations(healthProfile, fullAqiData);
        
        if (personalizedRecs && personalizedRecs.length > 0) {
          recommendations = personalizedRecs;
        } else {
          // Fallback to rule-based recommendations
          recommendations = getRuleBasedRecommendations(healthProfile, aqi);
        }

        // Generate health-specific advice sections
        healthSpecificAdvice = generateHealthSpecificAdvice(healthProfile, aqi, healthAdviceRules, elderlyAdvice);

      } catch (error) {
        console.error('Error getting personalized content:', error.message);
        // Continue with default recommendations
        const { getRuleBasedRecommendations } = require('./personalizationHelper');
        recommendations = getRuleBasedRecommendations(healthProfile, aqi);
      }
    }

    const subject = alertType === 'daily' 
      ? `Daily AQI Report for ${city}` 
      : alertType === 'instant'
      ? `Your AQI Report for ${city}`
      : `AQI Alert: Air Quality Changed in ${city}`;

    // Build personalized greeting and context
    let personalNote = '';
    let greetingMessage = '';
    
    if (personalizedMessage) {
      // Use Gemini-generated message with markdown converted to HTML
      greetingMessage = `<p style="line-height: 1.8;">${markdownToHtml(personalizedMessage)}</p>`;
    } else if (healthProfile && healthProfile.health_conditions) {
      // Build custom greeting based on health profile
      const conditions = healthProfile.health_conditions.filter(c => c !== 'none');
      if (conditions.length > 0 && aqi >= 3) {
        personalNote = buildPersonalNote(conditions, healthProfile.age_group, aqi);
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .aqi-badge { 
            display: inline-block; 
            padding: 10px 20px; 
            border-radius: 5px; 
            font-size: 24px; 
            font-weight: bold; 
            color: white;
            background-color: ${category.color};
          }
          .personal-note {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
            border-radius: 4px;
          }
          .health-section {
            background-color: #e3f2fd;
            padding: 15px;
            border-left: 4px solid #2196F3;
            margin: 15px 0;
            border-radius: 4px;
          }
          .health-section h4 {
            margin-top: 0;
            color: #1976D2;
          }
          .recommendations { margin-top: 20px; }
          .recommendations li { margin: 10px 0; padding: 5px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌬️ Airyze AQI Monitor</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            ${greetingMessage || `<p>Here's your air quality update for <strong>${city}</strong>:</p>`}
            
            <div style="text-align: center; margin: 20px 0;">
              <div class="aqi-badge">AQI: ${aqi}</div>
              <p style="font-size: 18px; margin-top: 10px;">
                <strong>${category.level}</strong> - ${category.description}
              </p>
            </div>

            ${personalNote}

            ${healthSpecificAdvice.length > 0 ? generateHealthAdviceHTML(healthSpecificAdvice) : ''}

            <div class="recommendations">
              <h3>${healthProfile ? '🎯 Personalized Recommendations:' : '💡 Health Recommendations:'}</h3>
              <ul>
                ${recommendations.slice(0, 6).map(rec => `<li>${markdownToHtml(rec)}</li>`).join('')}
              </ul>
            </div>

            <p style="margin-top: 20px; font-weight: 500;">
              Stay safe and monitor air quality regularly!
            </p>

            ${userId ? `
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <a href="http://localhost:5000/auth/track-alert/${userId}" 
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Dashboard
              </a>
              <p style="font-size: 11px; color: #999; margin-top: 10px;">
                Click above to track your engagement and earn badges!
              </p>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated alert from Airyze AQI Monitor</p>
            <p>Built with ❤️ for cleaner air and healthier lives</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    };

    // Mock mode: just log the email instead of sending
    if (isMockMode) {
      console.log('\n=== MOCK EMAIL (not actually sent) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`From: ${mailOptions.from}`);
      console.log('Content preview:', htmlContent.substring(0, 200) + '...');
      console.log('=====================================\n');
      return;
    }

    console.log(`\n--- Sending email via SMTP ---`);
    console.log(`From: ${mailOptions.from}`);
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✓ Email sent successfully!`);
    console.log(`Message ID: ${result.messageId}`);
    console.log(`Response: ${result.response}`);
    console.log(`--- End email send ---\n`);

  } catch (error) {
    console.error('Email send error:', error.message);
    
    // Provide more user-friendly error messages
    if (error.code === 'EMAIL_NOT_CONFIGURED') {
      throw error;
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      const networkError = new Error('Unable to connect to email server. Please check your network connection or firewall settings.');
      networkError.code = 'EMAIL_NETWORK_ERROR';
      throw networkError;
    } else if (error.code === 'EAUTH') {
      const authError = new Error('Email authentication failed. Please check email credentials.');
      authError.code = 'EMAIL_AUTH_ERROR';
      throw authError;
    } else {
      const genericError = new Error('Failed to send email. Please try again later.');
      genericError.code = 'EMAIL_SEND_ERROR';
      throw genericError;
    }
  }
}

/**
 * Build personalized note based on health conditions
 * @param {Array} conditions - Array of health conditions
 * @param {string} ageGroup - User's age group
 * @param {number} aqi - Current AQI level
 * @returns {string} HTML for personal note
 */
function buildPersonalNote(conditions, ageGroup, aqi) {
  let messages = [];
  
  if (conditions.includes('asthma')) {
    messages.push('Given your asthma, please take extra precautions today.');
  }
  if (conditions.includes('heart_issues')) {
    messages.push('With your heart condition, it\'s important to avoid strenuous activities.');
  }
  if (conditions.includes('young_children')) {
    messages.push('Keep children indoors today to protect their developing lungs.');
  }
  if (conditions.includes('pregnant')) {
    messages.push('As an expectant mother, please minimize outdoor exposure.');
  }
  if (conditions.includes('allergies')) {
    messages.push('Your allergies may be aggravated by current air quality.');
  }
  if (ageGroup === '60_plus') {
    messages.push('Please take it easy and avoid outdoor activities.');
  }

  if (messages.length === 0) return '';

  return `<div class="personal-note">
    <strong>⚠️ Personal Health Alert:</strong><br>
    ${messages.join(' ')}
  </div>`;
}

/**
 * Generate health-specific advice sections
 * @param {Object} healthProfile - User's health profile
 * @param {number} aqi - Current AQI level
 * @param {Object} healthAdviceRules - Health advice rules
 * @param {Object} elderlyAdvice - Elderly-specific advice
 * @returns {Array} Array of health advice objects
 */
function generateHealthSpecificAdvice(healthProfile, aqi, healthAdviceRules, elderlyAdvice) {
  const adviceSections = [];
  
  if (aqi < 2) return adviceSections; // No special advice needed for good air quality

  const conditions = healthProfile.health_conditions || [];
  
  // Add condition-specific advice
  for (const condition of conditions) {
    if (condition === 'none') continue;
    
    const conditionAdvice = healthAdviceRules[condition];
    if (conditionAdvice && conditionAdvice[aqi]) {
      const conditionName = condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      adviceSections.push({
        title: `For your ${conditionName}:`,
        advice: conditionAdvice[aqi]
      });
    }
  }

  // Add elderly-specific advice
  if (healthProfile.age_group === '60_plus' && elderlyAdvice[aqi]) {
    adviceSections.push({
      title: 'Age-Specific Guidance:',
      advice: elderlyAdvice[aqi]
    });
  }

  return adviceSections;
}

/**
 * Generate HTML for health advice sections
 * @param {Array} healthAdvice - Array of health advice objects
 * @returns {string} HTML string
 */
function generateHealthAdviceHTML(healthAdvice) {
  return healthAdvice.map(section => `
    <div class="health-section">
      <h4>${section.title}</h4>
      <ul style="margin: 5px 0; padding-left: 20px;">
        ${section.advice.map(item => `<li>${markdownToHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>} True if email is configured and working
 */
async function verifyEmailConfig() {
  try {
    if (isMockMode) {
      console.log('Email service is in MOCK MODE - emails will be logged, not sent');
      return true;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured');
      return false;
    }

    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email verification failed:', error.message);
    return false;
  }
}

module.exports = {
  sendAQIAlert,
  verifyEmailConfig
};
