const express = require('express')

const { protect } = require('../middleware/auth')

const { checkAccess, loadTodo } = require('../middleware/todosMiddlwares')
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

// Include other resource routers
const subtaskRouter = require('./subtask')
const inviationRouter = require('./invite')
/**
 * Re-route into other resource routers
 * Subtask
 * Invitations:see
 */
router.use('/:todoId/subtasks', subtaskRouter)
router.use('/:todoId/invitations', inviationRouter)

router.route('/').post(protect, createTodo)
router.route('/').get(protect, getTodos)

router
  .route('/:todoId')
  .get(
    protect,
    loadTodo,
    checkAccess({ allowOwner: true, allowCollaborator: true }),
    getTodoById
  )
  .put(
    protect,
    loadTodo,
    checkAccess({ allowOwner: true, allowCollaborator: false }),
    updateTodo
  )
  .delete(
    protect,
    loadTodo,
    checkAccess({ allowOwner: true, allowCollaborator: false }),
    deleteTodo
  )

router.post(
  '/:todoId/collaborators',
  protect,
  loadTodo,
  checkAccess({ allowOwner: true, allowCollaborator: false }),
  addCollaborator
)

router
  .route('/:todoId/collaborators')
  .delete(
    protect,
    loadTodo,
    checkAccess({ allowOwner: true, allowCollaborator: false }),
    removeCollaborator
  )

module.exports = router
