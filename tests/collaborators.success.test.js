const request = require('supertest')
const app = require('../app')
const User = require('../models/User')
const Todo = require('../models/Todo')

// Utility: create user and return { token, user }
const createUser = async (userDetails) => {
  const res = await request(app).post('/api/v1/auth/register').send(userDetails)
  return { token: res.body.token, user: res.body }
}

describe('Collaborators - Success Scenarios', () => {
  let owner, collab, tokenOwner, tokenCollab, todo

  beforeEach(async () => {
    // Create owner
    const ownerRes = await createUser({
      name: 'Owner',
      email: 'owner@example.com',
      password: 'password123',
    })
    tokenOwner = ownerRes.token
    owner = await User.findOne({ email: 'owner@example.com' })

    // Create collaborator
    const collabRes = await createUser({
      name: 'Collab',
      email: 'collab@example.com',
      password: 'password123',
    })
    tokenCollab = collabRes.token
    collab = await User.findOne({ email: 'collab@example.com' })

    // Create a todo as owner
    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ title: 'Test Todo', description: 'with collabs' })

    todo = todoRes.body.data
  })

  it('should add a collaborator to a todo', async () => {
    const res = await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.collaborators).toContain(collab._id.toString())
  })

  it('should remove a collaborator from a todo', async () => {
    // Add first
    await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id })

    // Then remove
    const res = await request(app)
      .delete(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.collaborators).not.toContain(collab._id.toString())
  })
})
