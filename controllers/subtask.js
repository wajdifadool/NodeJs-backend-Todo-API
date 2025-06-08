const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Todo = require('../models/Todo')

// @desc    Add a subtask to a Todo
// @route   POST /api/v1/todos/:todoId/subtasks
// @access  Private (Owner or Collaborator)
exports.addSubtask = asyncHandler(async (req, res, next) => {
  const { subtaskTitle } = req.body

  if (!subtaskTitle) {
    return next(new ErrorResponse('Subtask title is required', 400))
  }

  req.todo.subtasks.push({
    title: subtaskTitle,
    creator: req.user.id,
  })

  await req.todo.save()

  res.status(201).json({
    success: true,
    data: req.todo.subtasks[req.todo.subtasks.length - 1], // return the newly added
  })
})

// @desc    Remove a subtask
// @route   DELETE /api/v1/todos/:todoId/subtasks/
// @access  Private (Owner or Collaborator)
exports.deleteSubtask = asyncHandler(async (req, res, next) => {
  const { todoId } = req.params
  const { subtaskId } = req.body

  const todo = await Todo.findById(todoId)
  if (!todo) return next(new ErrorResponse('Todo not found', 404))

  const isOwner = todo.owner.toString() === req.user.id
  const isCollaborator = todo.collaborators.some(
    (id) => id.toString() === req.user.id
  )

  if (!isOwner && !isCollaborator) {
    return next(new ErrorResponse('Not authorized to delete subtasks', 403))
  }

  const subtask = todo.subtasks.id(subtaskId)
  if (!subtask) {
    return next(new ErrorResponse('Subtask not found', 404))
  }

  subtask.deleteOne()
  await todo.save()

  res.status(200).json({ success: true, data: {} })
})
