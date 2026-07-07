import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

describe('smoke', () => {
  it('health check responds', async () => {
    const app = createApp()
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
