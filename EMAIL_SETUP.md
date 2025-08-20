# Email Notifications Setup

This document explains how to configure email notifications for the physiotherapy booking system.

## Overview

The system sends email notifications for the following booking events:
- **New Booking Created**: Confirmation to user, notification to therapist, and admin record
- **Booking Confirmed**: Confirmation to user when therapist accepts booking
- **Booking Cancelled**: Notification to all parties when booking is cancelled
- **Booking Rescheduled**: Notification to all parties when booking is rescheduled

## Required Environment Variables

Add these variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"

# Admin Email for Notifications
ADMIN_EMAIL="admin@yourdomain.com"
```

## SMTP Configuration Examples

### Gmail Setup
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-gmail@gmail.com"
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" from Google Account settings
3. Use the app password instead of your regular password

### Outlook/Hotmail Setup
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@outlook.com"
```

### Custom SMTP Server
```env
SMTP_HOST="your-smtp-server.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-username"
SMTP_PASS="your-password"
SMTP_FROM="noreply@yourdomain.com"
```

## Email Templates

The system includes professionally designed HTML email templates for:

### User Confirmation Email
- Booking details (date, time, therapist, clinic)
- Status: Pending Confirmation
- Important notes and instructions
- Professional styling with Abaile branding

### Therapist Notification Email
- Complete booking details
- Patient information
- Action required (confirm/reject)
- Next steps for the therapist

### Admin Notification Email
- Booking summary for monitoring
- Patient and therapist details
- Financial information

### Cancellation/Reschedule Emails
- Updated booking information
- Reason for changes (if applicable)
- Professional communication

## Testing Email Configuration

To test your email configuration:

1. Make sure all SMTP environment variables are set correctly
2. Create a test booking through the application
3. Check the console logs for email sending results
4. Verify emails are received by all parties

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check SMTP_USER and SMTP_PASS
   - For Gmail, ensure you're using an App Password
   - Verify 2-factor authentication is enabled (Gmail)

2. **Connection Timeout**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall settings
   - Try different SMTP servers

3. **Emails Not Sending**
   - Check console logs for error messages
   - Verify ADMIN_EMAIL is set (optional)
   - Ensure all required environment variables are present

### Debug Mode

The system logs email sending results to the console. Look for:
- `Email sent successfully: [messageId]`
- `Email notification results: [results]`
- `Error sending email notifications: [error]`

## Security Considerations

1. **Environment Variables**: Never commit SMTP credentials to version control
2. **App Passwords**: Use app-specific passwords for Gmail
3. **Rate Limiting**: Be aware of SMTP provider rate limits
4. **Error Handling**: Email failures don't block booking operations

## Email Content

All emails include:
- Professional HTML formatting
- Responsive design
- Abaile branding
- Clear call-to-action buttons
- Contact information
- Booking reference numbers

The system ensures that email failures don't prevent booking operations from completing successfully.
