const mongoose = require('mongoose')

const PostSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    avatar: {
      type: String
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        text: {
          type: String,
          required: true
        },
        name: {
          type: String
        },
        avatar: {
          type: String
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { versionKey: false }
)

const Post = mongoose.model('Post', PostSchema)
module.exports = Post
