const asyncHandler = require('../middleware/async')
const Todo = require('../models/Todo')
const MOCK_USER_ID = '665f509e8f22a53bba773ad3' // Replace with a real ObjectId from your DB

exports.createTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.create({ ...req.body, owner: MOCK_USER_ID })
  res.status(201).json({ success: true, data: todo })
})

// TODO: add pagination
exports.getTodos = asyncHandler(async (req, res, next) => {
  const { status, priority, search, sortBy, page = 1, limit = 10 } = req.query
  console.log(req)
  const query = {}

  if (status) query.status = status
  if (priority) query.priority = priority
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (page - 1) * limit

  const todos = await Todo.find(query)
    .sort({ [sortBy || 'createdAt']: -1 })
    .skip(skip)
    .limit(parseInt(limit))

  const total = await Todo.countDocuments(query)

  res
    .status(200)
    .json({ success: true, total, todos, message: 'Sample endpoint working!' })
})

// TODO: change to private
// @desc    Get single Todo
// @route   Get /api/v1/todos/:todoId
// @acsess  Public
exports.getTodoById = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.todoId)
  if (!todo) {
    return next(
      new ErrorResponse(
        `Todo Not found with the id of ${req.params.todoId}`,
        404
      )
    )
  }
  res.status(200).json({
    succsess: true,
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
    succsess: true,
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
    succsess: true,
    data: {},
  })
})
