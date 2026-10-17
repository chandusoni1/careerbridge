const express = require('express');
const router = express.Router();
const postController = require('./post.controller');
const authenticate = require('../../middleware/authenticate');
const { validateCreatePost, validateComment } = require('./post.validation');
const validateRequest = require('../../middleware/validateRequest');

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

router.post(
  '/',
  authenticate,
  validateRequest(validateCreatePost),
  postController.createPost
);

router.post('/:id/like', authenticate, postController.toggleLike);
router.post(
  '/:id/comment',
  authenticate,
  validateRequest(validateComment),
  postController.addComment
);
router.delete(
  '/:id/comment/:commentId',
  authenticate,
  postController.deleteComment
);
router.post('/:id/share', postController.sharePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router;
