import mongoose from 'mongoose'

let memoryServer = null

export async function connectDB() {
  const uri = process.env.MONGO_URI

  if (uri) {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
    return
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server')
  memoryServer = await MongoMemoryServer.create()
  await mongoose.connect(memoryServer.getUri())
  console.log(
    'MONGO_URI not set — started an in-memory MongoDB instance. Data will not persist across restarts.',
  )
}

export async function disconnectDB() {
  await mongoose.disconnect()
  if (memoryServer) await memoryServer.stop()
}
