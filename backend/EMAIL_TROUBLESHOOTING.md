# Email Service Troubleshooting

## Current Issue
The email service is experiencing connection timeouts when trying to reach Gmail's SMTP server.

**Error:** `connect ETIMEDOUT 74.125.206.108:587`

## Possible Causes

1. **Firewall/Antivirus Blocking**: Your firewall or antivirus software may be blocking outgoing connections on port 587
2. **Network Restrictions**: Your ISP or network administrator may be blocking SMTP ports
3. **VPN/Proxy Issues**: If you're using a VPN or proxy, it might be interfering with SMTP connections

## Solutions

### Option 1: Try Port 465 (SSL)
Update your `.env` file:
```
EMAIL_PORT=465
```
And the code will need to use `secure: true` for port 465.

### Option 2: Check Firewall Settings
- Windows Firewall: Allow outgoing connections on ports 587 and 465
- Antivirus: Add exception for Node.js to access SMTP ports

### Option 3: Use Alternative Email Service
Consider using services like:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap, reliable)

### Option 4: Test with Different Network
Try running the application on a different network (mobile hotspot, different WiFi) to rule out network restrictions.

## Testing Email Configuration

Run the test script:
```bash
cd backend
node test-email.js
```

## Quick Fix for Development
For development purposes, you can:
1. Disable email alerts temporarily
2. Use a mock email service
3. Log emails to console instead of sending them
