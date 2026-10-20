const {
  Conversation,
  Message,
  Notification,
} = require('../notifications/notification.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { isUserOnline } = require('../../services/socket.service');

const getOrCreateConversation = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw ApiError.badRequest('Cannot start a conversation with yourself');
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, targetUserId] },
  }).populate('participants', 'name role headline profilePhoto company lastSeen');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, targetUserId],
    });
    conversation = await Conversation.findById(conversation._id).populate(
      'participants',
      'name role headline profilePhoto company lastSeen'
    );
  }

  return conversation;
};

const getUserConversations = async (userId) => {
  return Conversation.find({ participants: userId })
    .populate('participants', 'name role headline profilePhoto company lastSeen')
    .sort({ lastMessageAt: -1 });
};

const getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw ApiError.notFound('Conversation not found');
  }

  const isMember = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isMember) {
    throw ApiError.forbidden('Unauthorized access to this conversation');
  }

  // Mark incoming unread messages as read with timestamp
  await Message.updateMany(
    { conversationId, receiver: userId, status: { $ne: 'read' } },
    { $set: { status: 'read', isRead: true, readAt: new Date() } }
  );

  return Message.find({ conversationId })
    .populate('sender', 'name role profilePhoto')
    .populate('receiver', 'name role profilePhoto')
    .sort({ createdAt: 1 });
};

const sendMessage = async ({
  senderId,
  receiverId,
  text = '',
  conversationId,
  attachments = [],
}) => {
  const hasText = text && text.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  if (!hasText && !hasAttachments) {
    throw ApiError.badRequest('Message text or attachment is required');
  }

  let convId = conversationId;
  if (!convId) {
    const conv = await getOrCreateConversation(senderId, receiverId);
    convId = conv._id;
  }

  const snippet = hasText
    ? text.trim()
    : attachments[0]?.name
    ? `📎 ${attachments[0].name}`
    : '📎 Attachment';

  const message = await Message.create({
    conversationId: convId,
    sender: senderId,
    receiver: receiverId,
    text: hasText ? text.trim() : snippet,
    attachments: hasAttachments ? attachments : [],
    isRead: false,
  });

  await Conversation.findByIdAndUpdate(convId, {
    lastMessage: snippet,
    lastMessageSender: senderId,
    lastMessageAt: new Date(),
  });

  const sender = await User.findById(senderId).select('name');

  await Notification.create({
    recipient: receiverId,
    sender: senderId,
    type: 'message',
    message: `${sender?.name || 'Someone'} sent you a message: "${snippet.substring(0, 30)}..."`,
  }).catch(() => {});

  return Message.findById(message._id)
    .populate('sender', 'name role profilePhoto')
    .populate('receiver', 'name role profilePhoto');
};

const getUserPresence = async (targetUserId) => {
  const user = await User.findById(targetUserId).select('lastSeen name');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const socketOnline = isUserOnline ? isUserOnline(targetUserId) : false;
  const recentHttp =
    user.lastSeen && Date.now() - new Date(user.lastSeen).getTime() < 45000;
  const isOnline = Boolean(socketOnline || recentHttp);

  return {
    userId: targetUserId,
    isOnline,
    lastSeen: user.lastSeen,
  };
};

const markMessageDelivered = async (messageId, receiverId) => {
  const updated = await Message.findOneAndUpdate(
    { _id: messageId, receiver: receiverId, status: 'sent' },
    { $set: { status: 'delivered', deliveredAt: new Date() } },
    { new: true }
  );
  return updated;
};

const markConversationRead = async (conversationId, userId) => {
  await Message.updateMany(
    { conversationId, receiver: userId, status: { $ne: 'read' } },
    { $set: { status: 'read', isRead: true, readAt: new Date() } }
  );
  return { success: true };
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  getUserPresence,
  markMessageDelivered,
  markConversationRead,
};
