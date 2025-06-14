const express = require('express')
const router = express.Router({ mergeParams: true })
const { sendInvite, acceptInvite } = require('../controllers/invite')

const { protect } = require('../middleware/auth')
const { loadTodo, checkAccess } = require('../middleware/todosMiddlwares')

router.post(
  '/invite',
  protect,
  loadTodo,
  checkAccess({ allowOwner: true, allowCollaborator: false }),
  sendInvite
)
router.put('/accept', protect, acceptInvite)

module.exports = router

// craete link with cupherd token
// save the link in the data base under invetaion, with status pending user id , invitaion id
// if the link get clicked , hit th eapi point with the crypto and update the invtaion intop accepted , and push the new user to that todo based id
// middleware ,
// how can send inviation ? authenticated user, owner of the todo,
// how can hit the accept link ? authenticated user !  have the same email from the jwt , not the owner of the todo
