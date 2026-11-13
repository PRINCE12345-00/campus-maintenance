import nodemailer from 'nodemailer'
import twilio from 'twilio'

export const isEmailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

const emailTransport = isEmailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

const smsClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export async function sendEmailNotification({ to, subject, text, html }) {
  if (!to) {
    return { sent: false, mode: 'skipped', reason: 'No email provided' }
  }

  if (!emailTransport) {
    console.log(`[Email dry-run] To: ${to}\nSubject: ${subject}\n${text}`)
    return { sent: false, mode: 'dry-run' }
  }

  try {
    await emailTransport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    })
    return { sent: true, mode: 'email' }
  } catch (error) {
    console.error('Email send failed:', error.code || 'UNKNOWN', error.message)
    return { sent: false, mode: 'failed', reason: error.message, code: error.code || null }
  }
}

export async function sendSmsNotification({ to, message }) {
  if (!to) {
    return { sent: false, mode: 'skipped', reason: 'No phone number provided' }
  }

  if (!smsClient) {
    console.log(`[SMS dry-run] To: ${to}\nMessage: ${message}`)
    return { sent: false, mode: 'dry-run' }
  }

  try {
    await smsClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    return { sent: true, mode: 'sms' }
  } catch (error) {
    console.error('SMS send failed:', error.code || 'UNKNOWN', error.message)
    return { sent: false, mode: 'failed', reason: error.message, code: error.code || null }
  }
}

export async function notifyStudent({ student, type, title, message }) {
  const email = student?.email || student?.studentEmail
  const phone = student?.phone || student?.studentPhone

  const results = {
    email: { sent: false, mode: 'skipped' },
    sms: { sent: false, mode: 'skipped' },
  }

  if (email) {
    results.email = await sendEmailNotification({
      to: email,
      subject: `${title} | Smart Campus Portal`,
      text: `${message}\n\nType: ${type}`,
      html: `<p>${message}</p><p><strong>Type:</strong> ${type}</p>`,
    })
  } else {
    results.email = { sent: false, mode: 'skipped', reason: 'No student email found' }
  }

  if (phone) {
    results.sms = await sendSmsNotification({
      to: phone,
      message: `${title}: ${message}`,
    })
  }

  return results
}
