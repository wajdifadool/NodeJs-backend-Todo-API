const request = require('supertest')

const app = require('../app') // NOT server.js
const mongoose = require('mongoose')
const User = require('../models/User')

describe('Auth API', () => {
  afterEach(async () => {
    await User.deleteMany() // Clean up users after each test
  })

  it('should register a user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
  })

  it('should login a user', async () => {
    // First, register
    await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    // Then login
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
  })

  it('should get current user (GET /me)', async () => {
    // Register
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Tester',
      email: 'me@test.com',
      password: 'pass1234',
    })

    const token = reg.body.token

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.email).toBe('me@test.com')
  })

  // =================================================
  // ===========      Fail Scenarios      ============
  // =================================================
  it('should fail to register with missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'fail@example.com', // Missing name + password
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBeDefined()
  })

  it('should fail to register duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'User One',
      email: 'dupe@example.com',
      password: '123456',
    })

    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'User Two',
      email: 'dupe@example.com',
      password: '654321',
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch('Email already registered')
  })

  it('should fail to login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send({
      name: 'Login Test',
      email: 'wrongpass@example.com',
      password: 'correctpass',
    })

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'wrongpass',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/invalid/i)
  })

  it('should fail to access /me with no token', async () => {
    const res = await request(app).get('/api/v1/auth/me')

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/not authorized/i)
  })
})
