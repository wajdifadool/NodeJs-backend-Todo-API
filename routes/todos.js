const express = require('express')

const router = express.Router()
const {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
} = require('../controllers/todos')

router.route('/').get(getTodos).post(createTodo)
router.route('/:todoId').get(getTodoById).put(updateTodo).delete(deleteTodo)

module.exports = router
