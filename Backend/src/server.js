import app from './app.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Book River API running on http://localhost:${PORT}`)
})
