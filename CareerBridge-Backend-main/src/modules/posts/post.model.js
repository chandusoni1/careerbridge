const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    default: 'image',
  },
  name: { type: String, default: '' },
  size: { type: Number },
});

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: { type: String, default: '', trim: true },
    media: [mediaSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    sharesCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = Post;
