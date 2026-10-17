const Post = require('./post.model');
const { Notification } = require('../notifications/notification.model');
const ApiError = require('../../utils/ApiError');

const createPost = async ({ authorId, content, media = [], tags = [] }) => {
  const newPost = await Post.create({
    author: authorId,
    content: content ? content.trim() : '',
    media,
    tags,
  });

  return Post.findById(newPost._id)
    .populate('author', 'name role branch company jobRole profilePhoto headline')
    .populate('comments.author', 'name role profilePhoto');
};

const getAllPosts = async ({ page = 1, limit = 20, tag, authorId } = {}) => {
  const query = {};
  if (tag) query.tags = tag;
  if (authorId) query.author = authorId;

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name role branch company jobRole profilePhoto headline')
      .populate('comments.author', 'name role profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments(query),
  ]);

  return {
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};

const getPostById = async (id) => {
  const post = await Post.findById(id)
    .populate('author', 'name role branch company jobRole profilePhoto headline')
    .populate('comments.author', 'name role profilePhoto');

  if (!post) {
    throw ApiError.notFound('Post not found');
  }
  return post;
};

const toggleLikePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const alreadyLiked = post.likes.some(
    (id) => id.toString() === userId.toString()
  );

  let isLiked;
  if (alreadyLiked) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    isLiked = false;
  } else {
    await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
    isLiked = true;

    // Send notification to author if not liking own post
    if (post.author && post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'message',
        message: 'liked your post.',
      }).catch(() => {});
    }
  }

  const updated = await Post.findById(postId).select('likes');
  return { isLiked, likesCount: updated ? updated.likes.length : 0 };
};

const addComment = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const newComment = {
    author: userId,
    text: text.trim(),
  };

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: newComment } },
    { new: true }
  ).populate('comments.author', 'name role profilePhoto');

  // Notify post author if not commenting on own post
  if (post.author && post.author.toString() !== userId.toString()) {
    await Notification.create({
      recipient: post.author,
      sender: userId,
      type: 'message',
      message: `commented on your post: "${text.substring(0, 40)}..."`,
    }).catch(() => {});
  }

  return updatedPost.comments[updatedPost.comments.length - 1];
};

const deleteComment = async (postId, commentId, userId, userRole) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  // Only comment author or admin can delete
  if (comment.author && comment.author.toString() !== userId.toString() && userRole !== 'admin') {
    throw ApiError.forbidden('You are not authorized to delete this comment');
  }

  await Post.findByIdAndUpdate(postId, {
    $pull: { comments: { _id: commentId } },
  });

  return { message: 'Comment deleted successfully' };
};

const deletePost = async (postId, userId, userRole) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  if (post.author.toString() !== userId.toString() && userRole !== 'admin') {
    throw ApiError.forbidden('You are not authorized to delete this post');
  }

  await Post.findByIdAndDelete(postId);
  return { message: 'Post deleted successfully' };
};

const sharePost = async (postId) => {
  const post = await Post.findByIdAndUpdate(
    postId,
    { $inc: { sharesCount: 1 } },
    { new: true }
  );

  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  return { sharesCount: post.sharesCount };
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  toggleLikePost,
  addComment,
  deleteComment,
  deletePost,
  sharePost,
};
