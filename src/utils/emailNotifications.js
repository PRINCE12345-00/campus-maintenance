export function getEmailDeliveryMessage(notificationResults) {
  const email = notificationResults?.email

  if (email?.sent) return 'Student email notification sent.'
  if (email?.mode === 'dry-run') return 'Student email was not sent: SMTP is not configured.'
  if (email?.reason) return `Student email was not sent: ${email.reason}`
  if (email?.mode === 'skipped') return `Student email was skipped: ${email.reason || 'no recipient email was found.'}`
  return 'Email delivery status is unavailable.'
}
