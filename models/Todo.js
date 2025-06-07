const mongoose = require('mongoose')

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true }, // Placeholder, to be replaced with real URL
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'doing', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // ✅ Index for $or
    },

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true, // ✅ Index for $or
      },
    ],
    subtasks: [subtaskSchema],
    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Todo', TodoSchema)
