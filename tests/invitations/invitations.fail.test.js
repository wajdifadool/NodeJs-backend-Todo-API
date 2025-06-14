const request = require('supertest')
const app = require('../../app')
const { registerAndLogin } = require('../testUtils')
const crypto = require('crypto')
const mongoose = require('mongoose')

const Invitation = require('../../models/Invitation')

describe('❌ Invitations API - Failure Scenarios', () => {
  let ownerToken, userBToken, userCToken, todoId, rawToken

  beforeEach(async () => {
    ownerToken = await registerAndLogin('owner@example.com')
    userBToken = await registerAndLogin('userb@example.com')
    userCToken = await registerAndLogin('userc@example.com')

    const todo = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Buy Milk',
        description: 'Almond if possible',
        priority: 'high',
        dueDate: new Date(),
      })

    expect(todo.statusCode).toBe(201)
    expect(todo.body.success).toBe(true)
    expect(todo.body.data.title).toBe('Buy Milk')

    todoId = todo.body.data._id
  })

  it('1. Self Invite Attempt (Owner invites themselves)', async () => {
    const res = await request(app)
      .post(`/api/v1/todos/${todoId}/invitations/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ inviteeEmail: 'owner@example.com' })

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/cannot invite yourself/i)
  })

  it('2. Unauthorized Accept Attempt (User C tries User B invite)', async () => {
    const res1 = await request(app)
      .post(`/api/v1/todos/${todoId}/invitations/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ inviteeEmail: 'userb@example.com' })

    rawToken = res1.body.invitationUrl.split('token=')[1]

    const res2 = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept?token=${rawToken}`)
      .set('Authorization', `Bearer ${userCToken}`)
    // .send({ token: rawToken })

    expect(res2.statusCode).toBe(400)
    expect(res2.body.error).toMatch(/Invite expired or invalid/i)
  })

  it('3. Missing Token on Accept', async () => {
    const res = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept`)

      .set('Authorization', `Bearer ${userBToken}`)
    // .send({})

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/token is required/i)
  })

  it('4. Owner Trying to Accept Their Own Invitation', async () => {
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    await Invitation.create({
      todo: todoId,
      inviter: new mongoose.Types.ObjectId(),
      inviteeEmail: 'owner@example.com',
      token: hashedToken,
    })

    const res = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept?token=${token}`)
      .set('Authorization', `Bearer ${ownerToken}`)
    // .send({ token })

    expect(res.statusCode).toBe(409)
    expect(res.body.error).toMatch(/onwer cant be added as colab/i)
  })

  it('5. Expired Token', async () => {
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Manually insert an expired invitation
    await Invitation.create({
      todo: todoId,
      inviter: new mongoose.Types.ObjectId(),
      inviteeEmail: 'userb@example.com',
      token: hashedToken,
      expiresAt: new Date(Date.now() - 1000), // already expired
    })

    const res = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept?token=${token}`)
      .set('Authorization', `Bearer ${userBToken}`)

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/Invite expired or invalid/i)
  })
})
