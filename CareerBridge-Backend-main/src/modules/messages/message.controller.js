const messageService = require('./message.service');
const asyncHandler = require('../../utils/asyncHandler');
const { getIo } = require('../../services/socket.service');

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getUserConversations(req.user.id);
  res.status(200).json(conversations);
});

const getOrCreate = asyncHandler(async (req, res) => {
  const conversation = await messageService.getOrCreateConversation(
    req.user.id,
    req.params.targetUserId
  );
  res.status(200).json(conversation);
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages(
    req.params.conversationId,
    req.user.id
  );
  res.status(200).json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage({
    senderId: req.user.id || req.user._id,
    receiverId: req.body.receiverId,
    text: req.body.text,
    attachments: req.body.attachments || [],
    conversationId: req.body.conversationId,
  });

  // Real-time socket delivery if connected
  try {
    const io = getIo();
    io.to(req.body.receiverId.toString()).emit('receive_message', message);
    io.to(req.body.receiverId.toString()).emit('notification', {
      type: 'message',
      msg: `New message from ${message.sender?.name || 'Someone'}`,
    });
  } catch {
    // Socket emit fallback handled smoothly
  }

  res.status(201).json(message);
});

const getUserPresence = asyncHandler(async (req, res) => {
  const presence = await messageService.getUserPresence(req.params.targetUserId);
  res.status(200).json(presence);
});

const markRead = asyncHandler(async (req, res) => {
  const result = await messageService.markConversationRead(
    req.params.conversationId,
    req.user.id || req.user._id
  );
  res.status(200).json(result);
});

module.exports = {
  getConversations,
  getOrCreate,
  getMessages,
  sendMessage,
  getUserPresence,
  markRead,
};
