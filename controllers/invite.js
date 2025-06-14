const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

const Todo = require('../models/Todo')
const Invitation = require('../models/Invitation')

const sendEmail = require('../utils/sendEmail')

// @desc    Send Invitation to user using nodemailer
// @route   POST /api/v1/todos/:todoId/invitations/invite
// @access  Private (Owner)
exports.sendInvite = asyncHandler(async (req, res, next) => {
  const { inviteeEmail } = req.body
  const { todoId } = req.params

  if (inviteeEmail === req.user.email) {
    return next(new ErrorResponse('You cannot invite yourself', 400))
  }

  const rawToken = crypto.randomBytes(32).toString('hex') // TODO: create the token pre.post model Middleware
  // TODO: move to pre modle midleware !
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  await Invitation.create({
    todo: todoId,
    inviter: req.user.id,
    inviteeEmail,
    token: hashedToken,
  })

  // Create invitation url
  // TODO: change the links to shorter urls , try using girbase dynamic links
  const invitationUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/todos/${todoId}/invitations/accept?token=${rawToken}`

  const message = `You are receiving this email because have been invited to join to collaberate in a Todo. Please make a PUT request to: \n\n ${invitationUrl}`

  // TODO: Send email here using nodemailer/sendgrid
  try {
    await sendEmail({
      email: inviteeEmail,
      subject: 'Invitaion Email Collab in a Todo',
      message,
    })
    res.status(200).json({
      success: true,
      message: 'Invitation sent',
      invitationUrl: invitationUrl,
    })
  } catch (error) {
    console.log('error sending email, ', error)
    return next(new ErrorResponse('Email could not be sent', 500))
  }
})

// @desc    Accept Invitation and triger collab endpoint - loged in user only
// @route   POST /api/v1/todos/:todoId/invitations/accept
// @access  Public
exports.acceptInvite = asyncHandler(async (req, res, next) => {
  console.log('acceptInvite ran')

  // const { token } = req.body
  const { token } = req.query
  const { todoId } = req.params
  if (!token) {
    return next(new ErrorResponse('token is required', 400))
  }
  console.log('token:: ', token)
  // Hash the token from the URL
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  // Find the invitation
  // TODO:  add indexing in the mngodb based at 1 params or 2 !
  // so we can index by todi and hashed token, then whe we fetch we check the expraiotn data and status

  const invitation = await Invitation.findOne({
    todo: todoId,
    token: hashedToken,
    status: 'pending',
    inviteeEmail: req.user.email,
    expiresAt: { $gt: Date.now() }, // Optional: if you add expiry
  })
  // console.log(invitation)

  if (!invitation) {
    return next(new ErrorResponse('Invite expired or invalid', 400))
  }

  // call add colab
  // TODO: try make this function ad miidleware , so it gets ,/:todoId/inviation/accept [protect , acceptinvite, loadatod, addcolab]

  const todo = await Todo.findById(todoId)
  if (!todo) return next(new ErrorResponse('Todo not found', 404))

  const userId = req.user.id
  if (todo.owner.toString() === userId) {
    return new next(new ErrorResponse('onwer cant be added as colab', 409))
  }
  if (!todo.collaborators.includes(userId)) {
    todo.collaborators.push(userId)
    await todo.save()
  }

  invitation.status = 'accepted'
  await invitation.save()

  // TODO: aoutmeate task to delete all the accepted , declined inviation, or update the expired date after expriration time

  res.status(200).json({ success: true, message: 'Invitation accepted' })
})
