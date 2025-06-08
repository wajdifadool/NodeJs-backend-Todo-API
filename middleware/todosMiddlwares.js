// middleware/loadTodo.js
const Todo = require('../models/Todo')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

exports.checkAccess = (
  options = { allowOwner: true, allowCollaborator: true }
) => {
  return (req, res, next) => {
    // console.log('middleware checkAccess ran')
    if (!req.user || !req.todo) {
      return next(new ErrorResponse('Unauthorized access context missing', 500))
    }

    const isOwner = req.todo.owner.toString() === req.user.id
    const isCollaborator = req.todo.collaborators.some(
      (id) => id.toString() === req.user.id
    )

    req.access = { isOwner, isCollaborator }

    if (
      (options.allowOwner && isOwner) ||
      (options.allowCollaborator && isCollaborator)
    ) {
      return next()
    }

    return next(new ErrorResponse('Not authorized to access this todo', 403))
  }
}

exports.loadTodo = asyncHandler(async (req, res, next) => {
  // console.log('middleware loadTodo ran')
  const { todoId } = req.params

  const todo = await Todo.findById(todoId)

  if (!todo) {
    return next(new ErrorResponse(`Todo ${todoId} not found`, 404))
  }

  req.todo = todo
  next()
})

/**
 * TODO: santize body for : update todo
exports.sanitizeBody = (rules = {}) => {
  return (req, res, next) => {
    const { isOwner, isCollaborator } = req.access || {}

    let allowedFields = []

    if (isOwner) {
      allowedFields = rules.owner || []
    } else if (isCollaborator) {
      allowedFields = rules.collaborator || []
    } else {
      return next(
        new ErrorResponse('Access role not recognized in sanitizeBody', 403)
      )
    }

    // Filter the request body
    const sanitized = {}
    for (const key of allowedFields) {
      if (req.body.hasOwnProperty(key)) {
        sanitized[key] = req.body[key]
      }
    }

    req.body = sanitized
    next()
  }
}


 * Example Usage
 * const { sanitizeBody } = require('../middleware/sanitizeBody')

router
  .route('/:todoId')
  .put(
    protect,
    loadTodo,
    checkAccess({ allowOwner: true, allowCollaborator: true }),
    sanitizeBody({
      owner: ['title', 'description', 'status', 'priority', 'dueDate', 'collaborators'],
      collaborator: ['title', 'description', 'status', 'priority'],
    }),
    updateTodo
  )
 * 
 */
