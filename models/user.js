const mongoose = require('mongoose')

const schemaOptions = {
  username: {
    type: String,
    minLength: 3,
    required: true,
    unique: true,
  },
  name: String,
  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
}

const toJSONOptions = {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject.__v
    delete returnedObject._id
    delete returnedObject.passwordHash
  },
}

const userSchema = new mongoose.Schema(schemaOptions)
userSchema.set('toJSON', toJSONOptions)

module.exports = mongoose.model('User', userSchema)
