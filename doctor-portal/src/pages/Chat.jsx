import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  MessageSquare, 
  User, 
  AlertCircle,
  Clock 
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const socketRef = useRef(null);
  const feedEndRef = useRef(null);

  // Load chat partners from appointments list
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await api.get('/doctor/appointments');
        if (response.data.success) {
          // Extract unique patients
          const uniquePatientsMap = {};
          response.data.appointments.forEach((app) => {
            if (app.patient && app.patient.user) {
              uniquePatientsMap[app.patient.user._id] = {
                userId: app.patient.user._id,
                name: app.patient.user.name,
                email: app.patient.user.email,
              };
            }
          });
          setPartners(Object.values(uniquePatientsMap));
        }
      } catch (err) {
        setError('Failed to load chat contacts list.');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://127.0.0.1:5000');

    // Register login room
    socketRef.current.emit('join', user._id);

    // Message listener
    socketRef.current.on('messageReceived', (message) => {
      // Append if from current active partner
      if (activePartner && message.sender?._id === activePartner.userId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on('messageSent', (message) => {
      // Append if to current active partner
      if (activePartner && message.recipient?._id === activePartner.userId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, activePartner]);

  // Load chat history when active partner changes
  useEffect(() => {
    if (!activePartner) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chat/history/${activePartner.userId}`);
        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (err) {
        console.error('History fetch error', err);
      }
    };

    fetchHistory();
  }, [activePartner]);

  // Auto-scroll chat feed to bottom
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner || !socketRef.current) return;

    // Send via socket
    socketRef.current.emit('sendMessage', {
      senderId: user._id,
      recipientId: activePartner.userId,
      content: text.trim(),
    });

    setText('');
  };

  return (
    <div className="h-[calc(100vh-10rem)] bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-xl flex">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-850 flex flex-col bg-slate-900/50">
        <div className="p-5 border-b border-slate-850">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-400" />
            <span>Consulting Channels</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
            </div>
          ) : partners.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-10 italic">No patient chat partners active.</p>
          ) : (
            partners.map((partner) => (
              <button
                key={partner.userId}
                onClick={() => setActivePartner(partner)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left border cursor-pointer transition-all ${
                  activePartner?.userId === partner.userId
                    ? 'bg-teal-600/10 text-teal-400 border-teal-500/25 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-850/40 hover:text-slate-200 border-transparent'
                }`}
              >
                <div className="h-9 w-9 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-teal-400">
                  <User size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-200 truncate">{partner.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{partner.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950/20">
        {activePartner ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-850 bg-slate-900/60 flex items-center gap-3">
              <div className="h-9 w-9 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-teal-400">
                <User size={16} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{activePartner.name}</h4>
                <p className="text-[10px] text-slate-500">Patient Active Channel</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl p-4 shadow ${
                      isMe 
                        ? 'bg-teal-600 text-white rounded-br-none' 
                        : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[9px] block text-right text-teal-200/60 mt-1.5 flex items-center justify-end gap-1 font-mono">
                        <Clock size={10} />
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={feedEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-850 bg-slate-900/40 flex gap-2">
              <input
                type="text"
                placeholder="Type your message here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-2xl py-3 px-4 text-slate-200 placeholder-slate-650 outline-none"
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-500 text-white p-3.5 rounded-2xl shadow-lg shadow-teal-500/10 cursor-pointer transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <MessageSquare size={36} className="text-slate-700" />
            <p className="text-sm italic">Select a patient from the side panel to start consulting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
