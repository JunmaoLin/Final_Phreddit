const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  first : {type: String,  required: true},
  last: {type: String,  required: true},
  email :{ type: String, required: true}, 
  display : {type: String, required: true},
  password : {type: String, required: true},
  createdDate: {type: Date, default: Date.now},
  reputation: {type: Number, default: 100},
  admin: {type: Boolean, default: false},
});

//Export model
module.exports = mongoose.model('User', userSchema);