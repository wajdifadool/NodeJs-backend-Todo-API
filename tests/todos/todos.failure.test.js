const request = require('supertest')
const app = require('../../app')
const { registerAndLogin } = require('../testUtils')

describe('❌ Todos API - Failure Scenarios', () => {
  let userToken, otherToken, todoId, collabToken

  beforeEach(async () => {
    // Owner creates a todo
    userToken = await registerAndLogin('owner@test.com')
    otherToken = await registerAndLogin('intruder@test.com')
    collabToken = await registerAndLogin('collab@test.com')

    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Private Task',
        description: 'Owner only',
      })

    todoId = todoRes.body.data._id

    // Add collab user as a collaborator
    const collabUserRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${collabToken}`)

    await request(app)
      .post(`/api/v1/todos/${todoId}/collaborators`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ collaboratorId: collabUserRes.body.data._id })
  })

  // 🔒 No token
  it('should NOT create a todo without auth token', async () => {
    const res = await request(app).post('/api/v1/todos').send({
      title: 'Fail Task',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.success).toBe(false)
  })

  // 🔒 Unauthorized delete
  it('should NOT allow another user to delete a todo they do not own', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${otherToken}`)

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  // 🆔 Todo does not exist
  it('should NOT allow update of non-existent todo', async () => {
    const res = await request(app)
      .put('/api/v1/todos/64e7af9b9e0b2f0000000000') // valid MongoID but not found
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Does not exist' })

    expect(res.statusCode).toBe(404)
    expect(res.body.success).toBe(false)
  })

  // ❌ Invalid ID format
  it('should return 404 for invalid ID format', async () => {
    const res = await request(app)
      .get('/api/v1/todos/notanid')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.statusCode).toBe(404) // or 400 depending on implementation
  })

  // 🔒 Collaborator CANNOT update the todo
  it('should NOT allow collaborator to update the todo', async () => {
    const res = await request(app)
      .put(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${collabToken}`)
      .send({ title: 'Malicious edit' })

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  // 🔒 Collaborator CANNOT delete the todo
  it('should NOT allow collaborator to delete the todo', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${collabToken}`)

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  // 🔒 Collaborator CANNOT add another collaborator
  it('should NOT allow collaborator to add another collaborator', async () => {
    const thirdToken = await registerAndLogin('third@test.com')

    const thirdUserRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${thirdToken}`)

    const res = await request(app)
      .post(`/api/v1/todos/${todoId}/collaborators`)
      .set('Authorization', `Bearer ${collabToken}`)
      .send({ collaboratorId: thirdUserRes.body.data._id })

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })
})
