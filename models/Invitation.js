const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema(
  {
    todo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo',
      required: true,
    },
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Invitation', invitationSchema)
