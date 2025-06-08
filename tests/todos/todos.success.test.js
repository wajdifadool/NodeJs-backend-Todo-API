const request = require('supertest')
const app = require('../../app')
const { registerAndLogin } = require('../testUtils')

describe('✅ Todos API - Success Scenarios Testing', () => {
  let token

  // Register and login as the OWNER user (User A) before each test
  beforeEach(async () => {
    token = await registerAndLogin('user@example.com')
  })

  // 1. User A creates a todo
  it('should create a new todo', async () => {
    const res = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Buy Milk',
        description: 'Almond if possible',
        priority: 'high',
        dueDate: new Date(),
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Buy Milk')
  })

  // 2. User A fetches their todos (owner view)
  it('should fetch all todos for logged-in user', async () => {
    await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Read Book',
        description: 'Backend Patterns',
      })

    const res = await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(1)
  })

  // 3. User A updates their own todo
  it('should update a todo', async () => {
    const todo = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write tests' })

    const res = await request(app)
      .put(`/api/v1/todos/${todo.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('done')
  })

  // 4. User A deletes a todo
  it('should delete a todo', async () => {
    const todo = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Temporary task' })

    const res = await request(app)
      .delete(`/api/v1/todos/${todo.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })

  // 5. User A adds User B as a collaborator
  it('owner can add a collaborator to a todo', async () => {
    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Shared Task' })

    const collabToken = await registerAndLogin('collab@example.com')

    const collabUserRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${collabToken}`)

    const addRes = await request(app)
      .post(`/api/v1/todos/${todoRes.body.data._id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ collaboratorId: collabUserRes.body.data._id })

    expect(addRes.statusCode).toBe(200)
    expect(addRes.body.success).toBe(true)
    expect(addRes.body.data.collaborators).toContain(
      collabUserRes.body.data._id
    )
  })

  // 6. User B (collaborator) logs in and can fetch the shared todo
  it('collaborator can fetch a shared todo', async () => {
    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Shared by owner' })

    const collabToken = await registerAndLogin('viewer@example.com')

    const collabUserRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${collabToken}`)

    await request(app)
      .post(`/api/v1/todos/${todoRes.body.data._id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ collaboratorId: collabUserRes.body.data._id })

    const res = await request(app)
      .get('/api/v1/todos')
      .set('Authorization', `Bearer ${collabToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.some((t) => t._id === todoRes.body.data._id)).toBe(
      true
    )
  })

  // 7. User B (collaborator) adds a subtask to the shared todo
  it('collaborator can add a subtask to a shared todo', async () => {
    const todoRes = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Shared Task with Subtask' })

    const collabToken = await registerAndLogin('collabuser@example.com')

    const collabUserRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${collabToken}`)

    await request(app)
      .post(`/api/v1/todos/${todoRes.body.data._id}/collaborators`)
      .set('Authorization', `Bearer ${token}`)
      .send({ collaboratorId: collabUserRes.body.data._id })

    const subtaskRes = await request(app)
      .post(`/api/v1/todos/${todoRes.body.data._id}/subtasks`)
      .set('Authorization', `Bearer ${collabToken}`)
      .send({ subtaskTitle: 'Subtask from collaborator' })

    expect(subtaskRes.statusCode).toBe(201)
    expect(subtaskRes.body.success).toBe(true)
    expect(subtaskRes.body.data.title).toBe('Subtask from collaborator')
  })

  // ✅ BONUS: You can later add a negative test suite to confirm:
  // - Collaborator can't update the todo (PUT)
  // - Collaborator can't delete the todo
  // - Collaborator can't add other collaborators
})
