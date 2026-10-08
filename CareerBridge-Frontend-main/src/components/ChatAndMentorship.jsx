import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export const ChatModal = ({ currentUser, targetUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (currentUser?._id) socket.emit('join_chat', currentUser._id);
    socket.on('receive_message', (data) => setMessages((prev) => [...prev, data]));
    return () => socket.off('receive_message');
  }, [currentUser]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msgData = {
      senderId: currentUser._id,
      senderName: currentUser.name,
      receiverId: targetUser._id,
      text
    };
    socket.emit('send_message', msgData);
    setMessages((prev) => [...prev, msgData]);
    setText("");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-[450px] space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white">Chat with {targetUser?.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <div className="h-64 overflow-y-auto space-y-2 p-2 bg-slate-950 rounded-2xl border border-slate-800/80">
          {messages.map((m, idx) => (
            <div key={idx} className={`p-3 rounded-xl max-w-[80%] text-xs font-medium ${m.senderId === currentUser?._id ? 'bg-cyan-500 text-slate-950 ml-auto' : 'bg-slate-800 text-slate-200'}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type message..." 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none" 
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl">Send</button>
        </div>
      </div>
    </div>
  );
};