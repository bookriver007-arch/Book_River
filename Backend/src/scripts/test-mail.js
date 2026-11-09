import dotenv from 'dotenv'

dotenv.config()

const { isMailConfigured, mailConfig, sendMail } = await import('../utils/mailer.js')

/**
 * Email setting test — chalao:
 *   npm run mail:test -- youraddress@gmail.com
 */
const to = String(process.argv[2] || '').trim()

if (!to) {
  console.log('Usage: npm run mail:test -- youraddress@gmail.com')
  process.exit(1)
}

if (!isMailConfigured()) {
  console.log('SMTP set nahi hai — Backend/.env me SMTP_USER + SMTP_PASS uncomment karke daalo.')
  process.exit(1)
}

const config = mailConfig()
console.log(`SMTP: ${config.host}:${config.port} (secure: ${config.secure})`)
console.log(`From: ${config.from}`)
console.log(`To  : ${to}`)

try {
  const info = await sendMail({
    to,
    subject: 'Book River — email test ✅',
    html: '<p style="font-family:sans-serif">Ye test email hai. Aap ka SMTP setup <strong>theek chal raha hai</strong> — ab forgot password ka code bhi inbox me aayega.</p>',
    text: 'Book River email test — SMTP setup works.',
  })

  console.log('BHEJ DIYA ✅', info.messageId || '')
  console.log('Ab login page par Forgot password try karo — code inbox me aayega.')
} catch (error) {
  console.log('FAIL ❌', error.message)

  if (/invalid login|535|Username and Password not accepted/i.test(error.message)) {
    console.log('\nGmail ka jawab: username/password accept nahi hua.')
    console.log('1) Gmail par 2-Step Verification ON honi chahiye')
    console.log('2) Normal password nahi — 16-character APP PASSWORD chahiye')
    console.log('3) https://myaccount.google.com/apppasswords se banao, spaces hata kar daalo')
  }
  process.exit(1)
}
