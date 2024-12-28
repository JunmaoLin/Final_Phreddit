// LinkFlair Document Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const linkFlairSchema = new Schema({
  content : { type: String, maxLength: 30, required: true },
});

linkFlairSchema.virtual('url')
  .get(function () {
    return "linkFlairs/" + this._id;
});

//Export model
module.exports = mongoose.model('LinkFlair', linkFlairSchema);