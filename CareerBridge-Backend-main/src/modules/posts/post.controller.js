const postService = require('./post.service');
const asyncHandler = require('../../utils/asyncHandler');

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost({
    authorId: req.user.id,
    content: req.body.content,
    media: req.body.media || [],
    tags: req.body.tags || [],
  });
  res.status(201).json(post);
});

const getAllPosts = asyncHandler(async (req, res) => {
  const result = await postService.getAllPosts(req.query);
  res.status(200).json(result);
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  res.status(200).json(post);
});

const toggleLike = asyncHandler(async (req, res) => {
  const result = await postService.toggleLikePost(req.params.id, req.user.id);
  res.status(200).json(result);
});

const addComment = asyncHandler(async (req, res) => {
  const comment = await postService.addComment(
    req.params.id,
    req.user.id,
    req.body.text
  );
  res.status(201).json(comment);
});

const deleteComment = asyncHandler(async (req, res) => {
  const result = await postService.deleteComment(
    req.params.id,
    req.params.commentId,
    req.user.id,
    req.user.role
  );
  res.status(200).json(result);
});

const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePost(
    req.params.id,
    req.user.id,
    req.user.role
  );
  res.status(200).json(result);
});

const sharePost = asyncHandler(async (req, res) => {
  const result = await postService.sharePost(req.params.id);
  res.status(200).json(result);
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
  addComment,
  deleteComment,
  deletePost,
  sharePost,
};
