const request = require('supertest')
const app = require('../../app')
const { registerAndLogin } = require('../testUtils')

describe('❌ Todos API - Failure Scenarios', () => {
  let userToken, otherToken, todoId

  beforeEach(async () => {
    userToken = await registerAndLogin('owner@test.com')
    otherToken = await registerAndLogin('intruder@test.com')

    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Private Task',
        description: 'Owner only',
      })

    todoId = todoRes.body.data._id
  })

  it('should NOT create a todo without auth token', async () => {
    const res = await request(app).post('/api/v1/todos').send({
      title: 'Fail Task',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should NOT allow another user to delete a todo they do not own', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should NOT allow update of non-existent todo', async () => {
    const res = await request(app)
      .put('/api/v1/todos/64e7af9b9e0b2f0000000000') // random valid ID
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Does not exist' })

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should return 404 for invalid ID format', async () => {
    const res = await request(app)
      .get('/api/v1/todos/notanid')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(404) // or 400 depending on your handler
  })
})
