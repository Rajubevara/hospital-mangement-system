import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Clock, 
  Stethoscope, 
  ArrowLeft
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const feedEndRef = useRef(null);

  // Load chat partners from appointments list
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await api.get('/patient/appointments');
        if (response.data.success) {
          // Extract unique doctors
          const uniqueDoctorsMap = {};
          response.data.appointments.forEach((app) => {
            if (app.doctor && app.doctor.user) {
              uniqueDoctorsMap[app.doctor.user._id] = {
                userId: app.doctor.user._id,
                name: app.doctor.user.name,
                email: app.doctor.user.email,
                specialty: app.doctor.specialty?.name || 'Medical Specialist',
              };
            }
          });
          setPartners(Object.values(uniqueDoctorsMap));
        }
      } catch (err) {
        console.error('Failed to load chat contacts list.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://127.0.0.1:5000';

    socketRef.current = io(socketUrl);

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
    <div className="h-[calc(100vh-10rem)] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs flex">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-900 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-blue-600 dark:text-blue-405" />
            <span>Practitioner Channels</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : partners.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-10 italic">No consulting doctors active.</p>
          ) : (
            partners.map((partner) => (
              <button
                key={partner.userId}
                onClick={() => setActivePartner(partner)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left border cursor-pointer transition-colors ${
                  activePartner?.userId === partner.userId
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/20 shadow-inner font-semibold'
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                <div className="h-8 w-8 bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-blue-400">
                  <Stethoscope size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{partner.name}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{partner.specialty}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Feed Area */}
      <div className={`flex-1 flex flex-col justify-between bg-white dark:bg-slate-900/40 ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
        {activePartner ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center gap-3">
              {/* Back button on mobile */}
              <button 
                onClick={() => setActivePartner(null)}
                className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="h-8 w-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Stethoscope size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{activePartner.name}</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">{activePartner.specialty}</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl p-3.5 shadow-xs ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-[8px] block text-right mt-1.5 flex items-center justify-end gap-1 font-mono ${isMe ? 'text-blue-200/80' : 'text-slate-400'}`}>
                        <Clock size={9} />
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={feedEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-150 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/40 flex gap-2">
              <input
                type="text"
                placeholder="Ask clinical queries here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-750 text-white p-2.5 rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3 p-6 text-center">
            <MessageSquare size={32} className="text-slate-300 dark:text-slate-700" />
            <p className="text-xs italic">Select a medical practitioner from the side panel to start chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
