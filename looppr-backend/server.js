import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    const app = createApp()
    app.listen(PORT, () => console.log(`Looppr API listening on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })
