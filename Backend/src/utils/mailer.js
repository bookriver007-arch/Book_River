import nodemailer from 'nodemailer'

/**
 * Email bhejne ka chhota helper (Gmail SMTP).
 * .env me SMTP_USER + SMTP_PASS (Gmail App Password) ho to real email jata hai,
 * warna app "demo code" mode me chalti hai (code screen par).
 */
const env = process.env

export const mailConfig = () => {
  const user = String(env.SMTP_USER || '').trim()
  const pass = String(env.SMTP_PASS || '').replace(/\s+/g, '') // Gmail app password me spaces chalte hain

  return {
    host: String(env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: Number(env.SMTP_PORT || 465),
    secure: String(env.SMTP_SECURE ?? 'true').toLowerCase() !== 'false',
    user,
    pass,
    from: String(env.MAIL_FROM || '').trim() || (user ? `Book River <${user}>` : ''),
  }
}

/** SMTP set hai ya nahi */
export const isMailConfigured = () => {
  const config = mailConfig()
  return Boolean(config.user && config.pass)
}

let transporter = null

const getTransporter = () => {
  if (transporter) return transporter
  const config = mailConfig()
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  })
  return transporter
}

/** ek email bhejo */
export const sendMail = async ({ to, subject, html, text }) => {
  if (!isMailConfigured()) throw new Error('SMTP is not configured')

  const config = mailConfig()
  return getTransporter().sendMail({
    from: config.from,
    to,
    subject,
    text: text || '',
    html,
  })
}

/** email ko mask karo — "hafiz@gmail.com" → "h***z@gmail.com" */
export const maskEmail = (value) => {
  const email = String(value || '')
  const at = email.indexOf('@')
  if (at < 1) return email

  const name = email.slice(0, at)
  const domain = email.slice(at)
  if (name.length <= 2) return `${name[0] || '*'}***${domain}`

  return `${name[0]}***${name[name.length - 1]}${domain}`
}

/** reset code wali email (Book River branding) */
export const resetCodeEmail = ({ code, name, minutes = 10 }) => {
  const safeName = String(name || 'Reader').slice(0, 40)

  const html = `
  <div style="margin:0;padding:24px 12px;background:#eef4fd;font-family:'Segoe UI',Roboto,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto">
      <tr>
        <td style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px -24px rgba(20,50,100,.45)">
          <div style="background:linear-gradient(120deg,#173f7a,#2c5698 55%,#c9962f);padding:22px 26px">
            <p style="margin:0;font-size:13px;letter-spacing:.28em;text-transform:uppercase;color:#e8d9a8">Book River</p>
            <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#ffffff">Password reset code</p>
          </div>

          <div style="padding:26px">
            <p style="margin:0 0 10px;font-size:15px;color:#22344f">Hi ${safeName},</p>
            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4a5b73">
              Aap ne apna Book River password reset karne ke liye kaha hai. Neeche wala code
              <strong>${minutes} minute</strong> tak chalta hai.
            </p>

            <div style="text-align:center;margin:0 0 18px">
              <span style="display:inline-block;padding:14px 22px;border-radius:14px;background:#f2f7ff;border:1px dashed #b9cdee;font-size:30px;font-weight:800;letter-spacing:.34em;color:#173f7a">
                ${code}
              </span>
            </div>

            <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#4a5b73">
              Ye code login page ke <strong>Authentication</strong> page par daalein, phir naya password set karein.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#8794a8">
              Agar aap ne reset nahi maanga to is email ko ignore kar dein — aap ka password waisa hi rahega.
            </p>
          </div>

          <div style="padding:16px 26px 22px;border-top:1px solid #e7eef8">
            <p style="margin:0;font-size:11px;color:#98a5b8">Book River · Kids Book Villa · Pakistan</p>
          </div>
        </td>
      </tr>
    </table>
  </div>`

  const text = `Book River password reset code: ${code}\n\nYe code ${minutes} minute tak chalta hai.\nLogin page ke Authentication page par daalein, phir naya password set karein.`

  return { html, text }
}
