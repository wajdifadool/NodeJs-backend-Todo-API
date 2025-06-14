const request = require('supertest')
const app = require('../../app')
const { registerAndLogin } = require('../testUtils')
const Invitation = require('../../models/Invitation')

describe('✅ Invitations API - Success Scenarios', () => {
  let ownerToken, userBToken, todoId, rawToken

  beforeEach(async () => {
    // log in 2 users , owner and userb , get thier tokens and save the todo id

    ownerToken = await registerAndLogin('owner@example.com')
    userBToken = await registerAndLogin('userb@example.com')

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

  // 1. Valid Invite and Accept by Correct User
  // Flow: owner invites User B → User B accepts
  // Expected: ✅ Success – User B becomes collaborator
  it('1. Valid Invite & Accept by Intended User + Access Todo', async () => {
    // Send invitation to User B
    const res1 = await request(app)
      .post(`/api/v1/todos/${todoId}/invitations/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ inviteeEmail: 'userb@example.com' })

    expect(res1.statusCode).toBe(200)
    expect(res1.body.message).toBe('Invitation sent')

    rawToken = res1.body.invitationUrl.split('token=')[1]

    // Accept invite as User B
    const res2 = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept?token=${rawToken}`)
      .set('Authorization', `Bearer ${userBToken}`)
    // .send({ token: rawToken }) // we dont send data in the body !

    expect(res2.statusCode).toBe(200)
    expect(res2.body.message).toBe('Invitation accepted')

    // Access Todo
    const resTodo = await request(app)
      .get(`/api/v1/todos/${todoId}`)
      .set('Authorization', `Bearer ${userBToken}`)

    expect(resTodo.statusCode).toBe(200)
    expect(resTodo.body.data._id).toBe(todoId)
  })

  // TODO: move to tests.invitatio,.failualre
  it('2. Reuse of Accepted Token should be rejected', async () => {
    const res1 = await request(app)
      .post(`/api/v1/todos/${todoId}/invitations/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ inviteeEmail: 'userb@example.com' })

    expect(res1.statusCode).toBe(200)
    expect(res1.body.message).toBe('Invitation sent')

    rawToken = res1.body.invitationUrl.split('token=')[1]

    // Accept invite as User B
    const res2 = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept?token=${rawToken}`)
      .set('Authorization', `Bearer ${userBToken}`)
    // .send({ token: rawToken }) // we dont send data in the body !

    expect(res2.statusCode).toBe(200)
    expect(res2.body.message).toBe('Invitation accepted')

    // Accept invite as User B
    const res3 = await request(app)
      .put(`/api/v1/todos/${todoId}/invitations/accept?token=${rawToken}`)
      .set('Authorization', `Bearer ${userBToken}`)
    // .send({ token: rawToken })

    expect(res3.statusCode).toBe(400)
    expect(res3.body.error).toMatch(/Invite expired or invalid/i)
  })
})
