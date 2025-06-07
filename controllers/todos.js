const asyncHandler = require('../middleware/async')
const Todo = require('../models/Todo')
const User = require('../models/User')

const ErrorResponse = require('../utils/errorResponse')

exports.createTodo = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id
  const todo = await Todo.create(req.body)
  res.status(201).json({ success: true, data: todo })
})

// TODO: add pagination
exports.getTodos = asyncHandler(async (req, res, next) => {
  // const { status, priority, search, sortBy, page = 1, limit = 10 } = req.query

  // const query = {}

  // if (status) query.status = status
  // if (priority) query.priority = priority
  // if (search) {
  // query.$or = [
  // { title: { $regex: search, $options: 'i' } },
  // { description: { $regex: search, $options: 'i' } },
  // ]
  // }

  // const skip = (page - 1) * limit

  // const todos = await Todo.find(query)
  // .sort({ [sortBy || 'createdAt']: -1 })
  // .skip(skip)
  // .limit(parseInt(limit))
  // const total = await Todo.countDocuments(query)

  // res
  //   .status(200)
  //   .json({ success: true, total, todos, message: 'Sample endpoint working!' })
  // const todos = await Todo.find({ owner: req.user.id })

  const userId = req.user.id

  const todos = await Todo.find({
    $or: [{ owner: userId }, { collaborators: userId }],
  })

  res.status(200).json({
    success: true,
    count: todos.length,
    data: todos,
  })
})

// TODO: change to private
// @desc    Get single Todo
// @route   Get /api/v1/todos/:todoId
// @acsess  Public
exports.getTodoById = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.todoId)

  if (!todo) {
    return next(new ErrorResponse('Todo not found', 404))
  }

  // Check if current user owns this todo
  if (todo.owner.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to access this todo', 403))
  }

  res.status(200).json({
    success: true,
    data: todo,
  })
})

// @desc    Update existing TODO
// @route   PUT /api/v1/todo/:todoId
// @acsess  Private
exports.updateTodo = asyncHandler(async (req, res, next) => {
  let todo = await Todo.findById(req.params.todoId)
  if (!todo) {
    return next(
      new ErrorResponse(
        `TODO Not found with the id of ${req.params.todoId}`,
        404
      )
    )
  }
  // do the actual update
  todo = await Todo.findByIdAndUpdate(
    req.params.todoId,
    { $set: req.body },
    {
      //   {new:true} : will return the new updated Model
      new: true,
      runValidators: true,
    }
  )

  res.status(200).json({
    success: true,
    data: todo,
  })
})

// @desc    Delete existing Todo
// @route   DELETE /api/v1/todo/:todoId
// @acsess  Private
exports.deleteTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.todoId)
  //   {new:true} : will return the new updated Model
  if (!todo) {
    return next(
      new ErrorResponse(
        `TODO Not found with the id of ${req.params.todoId}`,
        404
      )
    )
  }

  await todo.deleteOne()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Add a collaborator to a Todo
// @route   POST /api/v1/todos/:todoId/collaborators
// @access  Private (Owner only)
exports.addCollaborator = asyncHandler(async (req, res, next) => {
  const { todoId } = req.params
  const { collaboratorId } = req.body

  if (!collaboratorId) {
    return next(new ErrorResponse('Collaborator ID is required', 400))
  }

  if (collaboratorId === req.user.id) {
    return next(
      new ErrorResponse('Owner can not be added as collaborator', 400)
    )
  }
  const todo = await Todo.findById(todoId)

  if (!todo) {
    return next(new ErrorResponse('Todo not found', 404))
  }

  // Check if collaborator exists
  const userToAdd = await User.findById(collaboratorId)

  if (!userToAdd) {
    return next(new ErrorResponse('User not found', 404))
  }

  // Check if already a collaborator
  if (todo.collaborators.includes(collaboratorId)) {
    return next(new ErrorResponse('User is already a collaborator', 400))
  }

  todo.collaborators.push(collaboratorId)

  await todo.save()

  res.status(200).json({
    success: true,
    data: todo,
  })
})

// @desc    Remove a collaborator from a Todo
// @route   DELETE /api/v1/todos/:todoId/collaborators
// @access  Private (Owner only)
exports.removeCollaborator = asyncHandler(async (req, res, next) => {
  const { todoId } = req.params
  const { collaboratorId } = req.body

  const todo = await Todo.findById(todoId) //TODO:pass via the middleware insted of donloading it twice
  if (!todo) return next(new ErrorResponse('Todo not found', 404))

  if (todo.owner.toString() !== req.user.id)
    return next(new ErrorResponse('Not authorized to modify this todo', 403))

  // Remove if exists
  const index = todo.collaborators.indexOf(collaboratorId)
  if (index === -1)
    return next(new ErrorResponse('Collaborator not found in todo', 400))

  todo.collaborators.splice(index, 1)
  await todo.save()

  res.status(200).json({ success: true, data: todo })
})
