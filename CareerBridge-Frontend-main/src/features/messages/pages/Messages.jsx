import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesApi } from '../../../services/messages.api';
import { connectionsApi } from '../../../services/connections.api';
import { LoadingSpinner } from '../../../components/feedback';
import { UserAvatar } from '../../../components/common/UserAvatar';
import { getSocket } from '../../../services/socket';

export const Messages = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedUserId = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Online Presence state for active conversation partner
  const [partnerPresence, setPartnerPresence] = useState({
    isOnline: false,
    lastSeen: null,
  });

  // Attachment state
  const [attachment, setAttachment] = useState(null); // { file, name, size, type, dataUrl, progress, error }
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format last seen timestamp in WhatsApp style
  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Offline';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Offline';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Last seen today at ${timeStr}`;
    if (isYesterday) return `Last seen yesterday at ${timeStr}`;
    return `Last seen ${date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })} at ${timeStr}`;
  };

  // Load user connections and conversations
  const loadChatData = async () => {
    try {
      setLoading(true);
      const [convList, summaryRes] = await Promise.all([
        messagesApi.getConversations().catch(() => []),
        connectionsApi.getSummary().catch(() => ({ connections: [] })),
      ]);

      const validConversations = Array.isArray(convList) ? convList : [];
      setConversations(validConversations);

      const validConnections = Array.isArray(summaryRes?.connections)
        ? summaryRes.connections
        : [];
      setConnections(validConnections);

      // Handle preselected target user from URL (?userId=...)
      if (preselectedUserId) {
        const existingConv = validConversations.find((c) =>
          c.participants?.some((p) => (p._id || p) === preselectedUserId)
        );

        if (existingConv) {
          setActiveConversation(existingConv);
        } else {
          try {
            const createdConv = await messagesApi.getOrCreateConversation(
              preselectedUserId
            );
            setActiveConversation(createdConv);
            setConversations((prev) => [createdConv, ...prev]);
          } catch (err) {
            console.error('Failed to start conversation with preselected user:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    if (!convId) return;
    try {
      const msgs = await messagesApi.getMessages(convId);
      if (Array.isArray(msgs)) {
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);

        // Acknowledge delivery to server for incoming un-delivered messages
        const undelivered = msgs.filter(
          (m) =>
            (m.receiver?._id || m.receiver) === user?._id &&
            m.status === 'sent'
        );
        if (undelivered.length > 0) {
          undelivered.forEach((m) => {
            messagesApi.markDelivered(m._id).catch(() => {});
          });
        }

        // Active recipient is viewing the conversation: mark incoming unread messages as read
        const hasUnread = msgs.some(
          (m) =>
            (m.receiver?._id || m.receiver) === user?._id &&
            (m.status !== 'read' || !m.isRead)
        );
        if (hasUnread) {
          messagesApi.markRead(convId).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [preselectedUserId]);

  // Real-time socket message delivery, read status, and presence listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Incoming real-time message handler
    const handleReceiveMessage = (msg) => {
      if (!msg) return;
      const currentConvId = activeConversation?._id;
      const msgConvId = msg.conversationId || msg.conversation;

      if (currentConvId && msgConvId === currentConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 100);

        // Current client received and viewed the message: acknowledge delivered & read
        if ((msg.receiver?._id || msg.receiver) === user?._id) {
          messagesApi.markDelivered(msg._id).catch(() => {});
          messagesApi.markRead(currentConvId).catch(() => {});
        }
      } else {
        // Acknowledge delivery even if not actively in this chat
        if ((msg.receiver?._id || msg.receiver) === user?._id) {
          messagesApi.markDelivered(msg._id).catch(() => {});
        }
      }

      // Update snippet in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msgConvId
            ? {
                ...c,
                lastMessage:
                  msg.text ||
                  (msg.attachments?.[0]?.name
                    ? `📎 ${msg.attachments[0].name}`
                    : '📎 Attachment'),
                lastMessageAt: new Date(),
              }
            : c
        )
      );
    };

    // Real-time status update handler (delivered / read ticks)
    const handleStatusUpdate = (update) => {
      if (!update) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (update.messageId && m._id === update.messageId) {
            return {
              ...m,
              status: update.status,
              deliveredAt: update.deliveredAt || m.deliveredAt,
              readAt: update.readAt || m.readAt,
            };
          }
          if (
            update.conversationId &&
            (m.conversationId === update.conversationId ||
              m.conversation === update.conversationId)
          ) {
            if (update.status === 'read') {
              return { ...m, status: 'read', isRead: true, readAt: update.readAt || new Date() };
            }
          }
          return m;
        })
      );
    };

    // Real-time partner presence update
    const handlePresenceUpdate = (presence) => {
      if (!presence || !activeConversation) return;
      const partner = activeConversation.participants?.find(
        (p) => (p._id || p) !== user?._id
      );
      const partnerId = (partner?._id || partner)?.toString();
      if (presence.userId && presence.userId.toString() === partnerId) {
        setPartnerPresence({
          isOnline: Boolean(presence.isOnline),
          lastSeen: presence.lastSeen || (presence.isOnline ? null : new Date()),
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_status_update', handleStatusUpdate);
    socket.on('user_presence', handlePresenceUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_status_update', handleStatusUpdate);
      socket.off('user_presence', handlePresenceUpdate);
    };
  }, [activeConversation?._id, user?._id]);

  // Periodic background fallback sync for active conversation messages
  useEffect(() => {
    if (activeConversation?._id) {
      loadMessages(activeConversation._id);
      const interval = setInterval(() => {
        if (!document.hidden) {
          loadMessages(activeConversation._id);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConversation?._id]);

  // Real-time presence polling for active conversation partner
  useEffect(() => {
    if (!activeConversation) {
      setPartnerPresence({ isOnline: false, lastSeen: null });
      return;
    }

    const partner = activeConversation.participants?.find(
      (p) => (p._id || p) !== user?._id
    );
    const partnerId = partner?._id || partner;

    if (!partnerId) return;

    const fetchPresence = async () => {
      try {
        const res = await messagesApi.getPresence(partnerId);
        if (res && res.success !== false) {
          setPartnerPresence({
            isOnline: Boolean(res.isOnline),
            lastSeen: res.lastSeen,
          });
        }
      } catch {
        if (partner?.lastSeen) {
          setPartnerPresence({
            isOnline: false,
            lastSeen: partner.lastSeen,
          });
        }
      }
    };

    fetchPresence();
    const presenceTimer = setInterval(() => {
      if (!document.hidden) {
        fetchPresence();
      }
    }, 10000);

    return () => clearInterval(presenceTimer);
  }, [activeConversation, user?._id]);

  // Handle connection selection
  const handleSelectConnection = async (connection) => {
    const existing = conversations.find((c) =>
      c.participants?.some((p) => (p._id || p) === connection._id)
    );

    if (existing) {
      setActiveConversation(existing);
    } else {
      try {
        setLoading(true);
        const created = await messagesApi.getOrCreateConversation(connection._id);
        setActiveConversation(created);
        setConversations((prev) => [created, ...prev]);
      } catch (err) {
        alert(err.message || 'Could not open conversation');
      } finally {
        setLoading(false);
      }
    }
  };

  // WhatsApp-like back navigation
  const handleBackToChatList = () => {
    setActiveConversation(null);
    setAttachment(null);
    if (preselectedUserId) {
      setSearchParams({});
    }
  };

  // File Attachment Handling with validation and progress
  const processSelectedFile = (file) => {
    if (!file) return;

    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setAttachment({
        file: null,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: 'document',
        dataUrl: null,
        progress: 0,
        error: 'File size exceeds 15 MB limit. Please select a smaller file.',
      });
      return;
    }

    let detectedType = 'document';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';

    setAttachment({
      file,
      name: file.name,
      size:
        file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : (file.size / 1024).toFixed(1) + ' KB',
      type: detectedType,
      dataUrl: null,
      progress: 30,
      error: null,
    });

    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 100);
        setAttachment((prev) => (prev ? { ...prev, progress: percent } : null));
      }
    };

    reader.onload = (e) => {
      setAttachment((prev) =>
        prev
          ? {
              ...prev,
              dataUrl: e.target.result,
              progress: 100,
              error: null,
            }
          : null
      );
    };

    reader.onerror = () => {
      setAttachment((prev) =>
        prev
          ? {
              ...prev,
              progress: 0,
              error: 'Failed to read file. Please retry.',
            }
          : null
      );
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRetryAttachment = () => {
    if (attachment?.file) {
      processSelectedFile(attachment.file);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message with optional text and attachments
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeConversation) return;

    const hasText = newText.trim().length > 0;
    const hasValidAttachment = attachment?.dataUrl && !attachment?.error;

    if (!hasText && !hasValidAttachment) return;

    const partner = activeConversation.participants?.find(
      (p) => (p._id || p) !== user?._id
    );

    setSending(true);
    try {
      const attachmentsPayload = hasValidAttachment
        ? [
            {
              url: attachment.dataUrl,
              type: attachment.type,
              name: attachment.name,
              size: attachment.file?.size || 0,
            },
          ]
        : [];

      const sentMsg = await messagesApi.sendMessage({
        conversationId: activeConversation._id,
        receiverId: partner?._id || partner,
        text: newText.trim(),
        attachments: attachmentsPayload,
      });

      setMessages((prev) => [...prev, sentMsg]);
      setNewText('');
      handleRemoveAttachment();
      setTimeout(scrollToBottom, 100);

      // Update last message in local conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? {
                ...c,
                lastMessage:
                  newText.trim() ||
                  (attachmentsPayload[0]?.name
                    ? `📎 ${attachmentsPayload[0].name}`
                    : '📎 Attachment'),
                lastMessageAt: new Date(),
              }
            : c
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Merge accepted connections with conversation data
  const mergedConnections = connections.map((conn) => {
    const conv = conversations.find((c) =>
      c.participants?.some((p) => (p._id || p) === conn._id)
    );
    return {
      ...conn,
      conversation: conv || null,
      lastMessage: conv?.lastMessage || '',
      lastMessageAt: conv?.lastMessageAt ? new Date(conv.lastMessageAt) : null,
    };
  });

  // Sort: most recent message first, then alphabetically
  const sortedConnections = mergedConnections.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) {
      return b.lastMessageAt - a.lastMessageAt;
    }
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Filter connections by search input
  const filteredConnections = sortedConnections.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.headline?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
        {/* VIEW 1: CHAT LIST (Visible when NO conversation is active) */}
        {!activeConversation ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <h1 className="text-lg font-black text-white tracking-wide">
                    Chats
                  </h1>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full">
                  {connections.length} Connection{connections.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Search Bar for Connections */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Connections / Chat List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {loading ? (
                <LoadingSpinner text="Loading your connections..." />
              ) : connections.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="text-3xl">👥</div>
                  <h3 className="font-bold text-white text-sm">
                    No connections yet
                  </h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                    Connect with students and alumni from the Directory or Network page to start private WhatsApp-style messaging!
                  </p>
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  No connections match "{searchQuery}"
                </div>
              ) : (
                filteredConnections.map((conn) => {
                  return (
                    <button
                      key={conn._id}
                      onClick={() => handleSelectConnection(conn)}
                      className="w-full p-4 flex gap-3.5 items-center text-left hover:bg-slate-950/70 transition cursor-pointer group"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={conn.profilePhoto}
                          name={conn.name}
                          size="lg"
                        />
                      </div>

                      {/* Connection Details & Latest Message Snippet */}
                      <div className="overflow-hidden flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-extrabold text-white text-xs truncate group-hover:text-cyan-400 transition">
                            {conn.name}
                          </span>
                          {conn.lastMessageAt && (
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {new Date(conn.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                          {conn.lastMessage || (
                            <span className="text-slate-500 italic">
                              {conn.headline || `${conn.role || 'Member'} • Say hello 👋`}
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* VIEW 2: PRIVATE CONVERSATION (Visible when a connection is selected, other connection names are hidden) */
          <div className="flex-1 flex flex-col h-full bg-slate-950/70">
            {/* WhatsApp-Style Chat Header */}
            {(() => {
              const partner = activeConversation.participants?.find(
                (p) => (p._id || p) !== user?._id
              );

              return (
                <div className="p-3.5 md:p-4 border-b border-slate-800 bg-slate-900/90 flex items-center gap-3 backdrop-blur-md sticky top-0 z-10">
                  {/* Back Arrow Button */}
                  <button
                    onClick={handleBackToChatList}
                    className="p-2 -ml-1 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/80 rounded-xl transition cursor-pointer flex items-center justify-center"
                    title="Back to Chats"
                    aria-label="Back to chats"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Partner Avatar with Online Indicator */}
                  <div className="relative shrink-0">
                    <UserAvatar
                      src={partner?.profilePhoto}
                      name={partner?.name}
                      size="md"
                      showOnline={true}
                      isOnline={partnerPresence.isOnline}
                    />
                  </div>

                  {/* Partner Info and Online / Last Seen Status */}
                  <div className="overflow-hidden flex-1">
                    <h2 className="font-black text-white text-sm truncate">
                      {partner?.name || 'Member'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {partnerPresence.isOnline ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium truncate">
                          {formatLastSeen(partnerPresence.lastSeen)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
                  <div className="text-4xl">👋</div>
                  <p className="text-xs font-semibold text-slate-400">
                    No messages yet. Say hello to start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = (m.sender?._id || m.sender) === user?._id;
                  const hasAttachments =
                    Array.isArray(m.attachments) && m.attachments.length > 0;

                  return (
                    <div
                      key={m._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl text-xs leading-relaxed overflow-hidden shadow-lg ${
                          isMe
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {/* Attachments rendering */}
                        {hasAttachments && (
                          <div className="space-y-2">
                            {m.attachments.map((att, idx) => (
                              <div key={idx} className="overflow-hidden">
                                {att.type === 'image' && (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block cursor-pointer"
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name || 'Attachment'}
                                      className="w-full max-h-72 object-cover rounded-t-xl"
                                    />
                                  </a>
                                )}

                                {att.type === 'video' && (
                                  <video
                                    src={att.url}
                                    controls
                                    className="w-full max-h-72 rounded-t-xl bg-black"
                                  />
                                )}

                                {att.type === 'document' && (
                                  <div
                                    className={`p-3 flex items-center justify-between gap-3 ${
                                      isMe ? 'bg-cyan-600/30' : 'bg-slate-900/60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-xl">📄</span>
                                      <div className="truncate">
                                        <p className="font-bold text-xs truncate">
                                          {att.name || 'Document'}
                                        </p>
                                        {att.size > 0 && (
                                          <p className="text-[10px] opacity-75 font-semibold">
                                            {(att.size / 1024).toFixed(1)} KB
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <a
                                      href={att.url}
                                      download={att.name || 'document'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`px-3 py-1 rounded-lg text-[11px] font-black shrink-0 transition ${
                                        isMe
                                          ? 'bg-slate-950 text-cyan-400 hover:bg-slate-900'
                                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                                      }`}
                                    >
                                      📥 Download
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text Caption or Message Content */}
                        {m.text && !m.text.startsWith('📎 ') && (
                          <div className="px-4 py-2.5 font-medium whitespace-pre-wrap break-words">
                            {m.text}
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Delivery Tick Status */}
                      <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1.5 font-semibold">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <span className="inline-flex items-center text-xs ml-0.5" title={
                            m.status === 'read' || m.isRead
                              ? 'Read'
                              : m.status === 'delivered'
                              ? 'Delivered to recipient device'
                              : 'Sent to server'
                          }>
                            {m.status === 'read' || m.isRead ? (
                              <span className="text-cyan-400 font-extrabold tracking-tighter">✓✓</span>
                            ) : m.status === 'delivered' ? (
                              <span className="text-slate-400 font-bold tracking-tighter">✓✓</span>
                            ) : (
                              <span className="text-slate-400 font-bold">✓</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File Attachment Preview inside Message Composer */}
            {attachment && (
              <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                  {attachment.type === 'image' && attachment.dataUrl && (
                    <img
                      src={attachment.dataUrl}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0"
                    />
                  )}
                  {attachment.type === 'video' && (
                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                      🎬
                    </div>
                  )}
                  {attachment.type === 'document' && (
                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                      📄
                    </div>
                  )}

                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {attachment.name}
                    </p>
                    {attachment.error ? (
                      <p className="text-[11px] text-rose-400 font-semibold">
                        {attachment.error}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-cyan-400 font-semibold">
                          {attachment.size} • {attachment.type.toUpperCase()}
                        </span>
                        {attachment.progress < 100 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            {attachment.progress}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {attachment.error && (
                    <button
                      type="button"
                      onClick={handleRetryAttachment}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg text-xs font-bold transition"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Message Composer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
            >
              {/* Hidden File Picker */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
                className="hidden"
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Attach image, video, or document"
              >
                📎
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder="Type a message..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-medium"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={
                  sending ||
                  (!newText.trim() && (!attachment || attachment.error || !attachment.dataUrl))
                }
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition cursor-pointer"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
