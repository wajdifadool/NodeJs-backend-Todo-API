const request = require('supertest')
const app = require('../app')
const User = require('../models/User')
const Todo = require('../models/Todo')

const createUser = async (userDetails) => {
  const res = await request(app).post('/api/v1/auth/register').send(userDetails)
  return { token: res.body.token, user: res.body }
}

describe('Collaborators - Failure Scenarios', () => {
  let owner, collab, stranger, tokenOwner, tokenCollab, tokenStranger, todo

  beforeEach(async () => {
    // Create users
    const ownerRes = await createUser({
      name: 'Owner',
      email: 'owner2@example.com',
      password: 'password123',
    })
    tokenOwner = ownerRes.token
    owner = await User.findOne({ email: 'owner2@example.com' })

    const collabRes = await createUser({
      name: 'Collab',
      email: 'collab2@example.com',
      password: 'password123',
    })
    tokenCollab = collabRes.token
    collab = await User.findOne({ email: 'collab2@example.com' })

    const strangerRes = await createUser({
      name: 'Stranger',
      email: 'stranger@example.com',
      password: 'password123',
    })
    tokenStranger = strangerRes.token
    stranger = await User.findOne({ email: 'stranger@example.com' })

    // Owner creates todo
    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ title: 'Protected Todo', description: 'For testing' })

    todo = todoRes.body.data
  })

  it('should not allow adding yourself as collaborator', async () => {
    const res = await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: owner._id })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should not add non-existing user as collaborator', async () => {
    const fakeId = '665f1c447cb2fa1ee5bca9a9'

    const res = await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: fakeId })

    expect(res.statusCode).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('should not add same collaborator twice', async () => {
    // First add
    await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id })

    // Try to add again
    const res = await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should not remove a non-existent collaborator', async () => {
    const res = await request(app)
      .delete(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id }) // never added

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should not allow non-owner to add collaborator', async () => {
    const res = await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenStranger}`)
      .send({ collaboratorId: collab._id })

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should not allow non-owner to remove collaborator', async () => {
    // Add collab first by owner
    await request(app)
      .post(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ collaboratorId: collab._id })

    // Try to remove as someone else
    const res = await request(app)
      .delete(`/api/v1/todos/${todo._id}/collaborators`)
      .set('Authorization', `Bearer ${tokenStranger}`)
      .send({ collaboratorId: collab._id })

    expect(res.statusCode).toBe(403)
    expect(res.body.success).toBe(false)
  })
})
