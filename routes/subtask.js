const express = require('express')
const router = express.Router({ mergeParams: true })

const {
  addSubtask,
  deleteSubtask,
  //
} = require('../controllers/subtask')
const { protect } = require('../middleware/auth')
const { checkAccess, loadTodo } = require('../middleware/todosMiddlwares')

router.post(
  '/',
  protect,
  loadTodo,
  checkAccess({ allowOwner: true, allowCollaborator: true }),
  addSubtask
)

router.post(
  '/',
  protect,
  loadTodo,
  checkAccess({ allowOwner: true, allowCollaborator: false }),
  deleteSubtask
)

module.exports = router
