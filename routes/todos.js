const express = require('express')
const { authorizeTodoAccess } = require('../middleware/authorizeTodoAccess')
const router = express.Router()
const {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
  addCollaborator,
  removeCollaborator,
} = require('../controllers/todos')

const { protect } = require('../middleware/auth')

router.route('/').post(protect, createTodo)
router.route('/').get(protect, getTodos)

router
  .route('/:todoId')
  .get(protect, authorizeTodoAccess, getTodoById)
  .put(protect, authorizeTodoAccess, updateTodo)
  .delete(protect, authorizeTodoAccess, deleteTodo)

router.post(
  '/:todoId/collaborators',
  protect,
  authorizeTodoAccess,
  addCollaborator
)

router
  .route('/:todoId/collaborators')
  .delete(protect, authorizeTodoAccess, removeCollaborator)

module.exports = router
