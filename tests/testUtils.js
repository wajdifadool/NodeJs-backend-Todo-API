const request = require('supertest')
const app = require('../app')

exports.registerAndLogin = async (email, password = 'pass1234') => {
  await request(app).post('/api/v1/auth/register').send({
    name: 'Test',
    email,
    password,
  })
  const login = await request(app).post('/api/v1/auth/login').send({
    email,
    password,
  })
  return login.body.token
}
