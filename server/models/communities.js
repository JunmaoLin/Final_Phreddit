// Community Document Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const communitySchema = new Schema({
  name : { type: String, maxLength: 100, required: true },
  description: { type: String, maxLength: 500,required: true },
  postIDs :[{ type: Schema.Types.ObjectId, ref: "Post" }],
  startDate : { type: Date, default: Date.now, required:  true },
  members : [{ type: String, required: true }], 
  createdBy: {type: String,required : true},
});

communitySchema.virtual('memberCount')
  .get(function () {
    return this.members.length;
});

communitySchema.virtual('url')
  .get(function () {
    return "communities/" + this._id;
});

//Export model
module.exports = mongoose.model('Community', communitySchema);