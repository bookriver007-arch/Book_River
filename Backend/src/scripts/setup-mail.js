import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

/**
 * Gmail SMTP setup — ek hi command:
 *   npm run mail:setup
 * (ya bina prompt: npm run mail:setup -- your@gmail.com appPassword16)
 *
 * Ye Backend/.env me SMTP_USER / SMTP_PASS set karta hai, phir ek test email bhejta hai.
 */
const envPath = path.join(process.cwd(), '.env')

const ask = async (question, fallback = '') => {
  if (fallback) return fallback
  const rl = readline.createInterface({ input: stdin, output: stdout })
  const answer = await rl.question(question)
  rl.close()
  return String(answer || '').trim()
}

const main = async () => {
  console.log('\n=== Book River — Gmail email setup ===\n')
  console.log('App Password banane ka tareeqa:')
  console.log('  1) Gmail -> 2-Step Verification ON karo')
  console.log('  2) https://myaccount.google.com/apppasswords -> "Book River" -> Create')
  console.log('  3) 16-character password copy karo (spaces chalte hain)\n')

  const email = (await ask('Gmail address: ', process.argv[2])).toLowerCase()
  const rawPass = await ask('App password (16 characters): ', process.argv[3])
  const pass = rawPass.replace(/\s+/g, '')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('\nEmail theek nahi lag raha. Dobara chalao.')
    process.exit(1)
  }
  if (pass.length < 16) {
    console.error(
      `\nApp password ${pass.length} characters ka hai — Google ka app password exactly 16 ka hota hai.`,
    )
    console.error('Normal Gmail password se kaam nahi chalega. Dobara banao aur phir chalao.')
    process.exit(1)
  }

  const block = [
    'SMTP_HOST=smtp.gmail.com',
    'SMTP_PORT=465',
    'SMTP_SECURE=true',
    `SMTP_USER=${email}`,
    `SMTP_PASS=${pass}`,
    `MAIL_FROM=Book River <${email}>`,
  ]

  let src = fs.readFileSync(envPath, 'utf8')

  /* purani (commented) SMTP lines hata do, phir naya block lagao */
  src = src
    .split('\n')
    .filter(
      (line) =>
        !/^\s*#?\s*(SMTP_HOST|SMTP_PORT|SMTP_SECURE|SMTP_USER|SMTP_PASS|MAIL_FROM)=/.test(line) &&
        !/Email \(Gmail SMTP/i.test(line) &&
        !/forgot password ka REAL code/i.test(line) &&
        !/App Password banao/i.test(line) &&
        !/uncomment karke apna email/i.test(line) &&
        !/demo code” mode/i.test(line),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()

  src = `${src}\n\n# ===== Email (Gmail SMTP — real reset codes) =====\n${block.join('\n')}\n`
  fs.writeFileSync(envPath, src, 'utf8')

  console.log('\n.env update ho gaya ✅  (SMTP_USER + SMTP_PASS set)')

  /* ab test email bhejo */
  process.env.SMTP_USER = email
  process.env.SMTP_PASS = pass
  process.env.MAIL_FROM = `Book River <${email}>`

  const { sendMail } = await import('../utils/mailer.js')

  try {
    await sendMail({
      to: email,
      subject: 'Book River — email setup test ✅',
      html: '<p style="font-family:sans-serif">Mubarak ho! Aap ka email setup chal raha hai. Ab forgot password ka code bhi inbox me aayega.</p>',
      text: 'Book River email setup works.',
    })
    console.log(`Test email bhej diya → ${email} (inbox/spam dekho) ✅`)
    console.log('\nAb backend restart karo (nodemon band hai to): npm run dev')
    console.log('Uske baad Forgot password → code REAL inbox me aayega.\n')
  } catch (error) {
    console.error(`\nEmail nahi gaya ❌ — ${error.message}`)
    console.error('Gmail aksar "Invalid login" deta hai jab normal password use ho.')
    console.error('App password dobara banao: https://myaccount.google.com/apppasswords\n')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('SETUP FAILED:', error.message)
  process.exit(1)
})
