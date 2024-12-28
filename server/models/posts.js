// Post Document Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {type: String, maxLength: 100, required: true},
  content: {type: String, required: true},
  linkFlairID: {type: Schema.Types.ObjectId, ref: "LinkFlair"},
  postedBy: {type: String,required : true},
  postedDate: {type: Date, default: Date.now, required: true},
  commentIDs: [{type: Schema.Types.ObjectId, ref: "Comment"}],
  views: {type: Number, default: 0, required: true},

  upVotes: {type: Number, default: 0, required: false}, //newley added
});

postSchema.virtual('url')
  .get(function () {
    return "posts/" + this._id;
});

//Export model
module.exports = mongoose.model('Post', postSchema);