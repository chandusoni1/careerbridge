const validateCreatePost = (req) => {
  const { content, media } = req.body;
  const hasText = content && typeof content === 'string' && content.trim().length > 0;
  const hasMedia = Array.isArray(media) && media.length > 0;

  if (!hasText && !hasMedia) {
    return {
      isValid: false,
      error: 'Post must have either text content or at least one media attachment',
    };
  }

  return { isValid: true };
};

const validateComment = (req) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { isValid: false, error: 'Comment text cannot be empty' };
  }
  return { isValid: true };
};

module.exports = {
  validateCreatePost,
  validateComment,
};
