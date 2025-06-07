const Todo = require('../models/Todo')

const asyncHandler = require('./async')

const ErrorResponse = require('../utils/errorResponse')
// Only owner (or collaborator, later) can proceed
exports.authorizeTodoAccess = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.todoId)

  if (!todo || todo.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this todo', 403))
  }

  next()
})

// proetect , only loged in users
// authrize  if model is todo ,,
