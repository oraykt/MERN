const mongoose = require('mongoose')
const { isEmail } = require('validator')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required!'
      // validate: [isEmail, 'invalid email']
    },
    password: {
      type: String,
      required: 'Password is required!'
      // minlength: [4, 'Password length must be greater than 4'],
      // maxlength: [32, 'Password length must be less than 32']
    },
    avatar: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
)

const User = mongoose.model('User', UserSchema)
module.exports = User
