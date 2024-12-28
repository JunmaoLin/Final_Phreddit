// Comment Document Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content : {type: String, maxLength: 500, required: true},
  commentIDs: [{type: Schema.Types.ObjectId, ref: "Comment"}],
  commentedBy :{ type: String, required: true}, 
  commentedDate : {type: Date, default: Date.now, required: true},

  upVotes: {type: Number, default: 0, required: false}, //newley added
});

commentSchema.virtual('url')
  .get(function () {
    return "comments/" + this._id;
});

//Export model
module.exports = mongoose.model('Comment', commentSchema);