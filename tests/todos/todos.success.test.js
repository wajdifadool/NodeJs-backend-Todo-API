const request = require('supertest')
const app = require('../../app')
const { registerAndLogin } = require('../testUtils')

describe('✅ Todos API - Success Scenarios Testing ', () => {
  let token

  //   beforeEach test we have email : user@exampl.com

  beforeEach(async () => {
    token = await registerAndLogin('user@example.com')
  })

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

  it('should update a todo', async () => {
    const todo = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Write tests',
      })

    const res = await request(app)
      .put(`/api/v1/todos/${todo.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.status).toBe('done')
    expect(res.body.success).toBe(true)
  })

  it('should delete a todo', async () => {
    const todo = await request(app)
      .post('/api/v1/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Temporary task',
      })

    const res = await request(app)
      .delete(`/api/v1/todos/${todo.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
