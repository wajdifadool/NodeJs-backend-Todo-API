const Todo = require('../models/Todo')

const asyncHandler = require('./async')

const ErrorResponse = require('../utils/errorResponse')
// Only owner (or collaborator, later) can proceed
// this is not user any more will be added in the future in more generic way
exports.authorizeTodoAccess = asyncHandler(async (req, res, next) => {
  console.log('authorizeTodoAccess ran')
  const todo = await Todo.findById(req.params.todoId)

  if (!todo || todo.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this todo', 403))
  }

  next()
})
