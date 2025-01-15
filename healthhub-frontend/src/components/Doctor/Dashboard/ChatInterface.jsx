import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User, Search, ChevronLeft,
  Check, Image, Paperclip, Smile,
  X, MoreVertical, Settings
} from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';


const useChatData = () => {
  const [messages] = useState([
    {
      id: 1,
      sender: 'patient',
      content: 'Hello Dr. Smith, I have been experiencing severe headaches lately',
      time: '9:30 AM',
      status: 'read'
    },
    {
      id: 2,
      sender: 'doctor',
      content: 'Hello Sarah, I\'m sorry to hear that. How long have you been experiencing these headaches?',
      time: '9:32 AM',
      status: 'read'
    },
    {
      id: 3,
      sender: 'patient',
      content: 'For about a week now. They\'re especially bad in the morning.',
      time: '9:33 AM',
      status: 'read'
    },
    {
      id: 4,
      sender: 'doctor',
      content: 'Are you experiencing any other symptoms along with the headaches? Any nausea or sensitivity to light?',
      time: '9:35 AM',
      status: 'sent'
    }
  ]);

  const patients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      lastMessage: 'Experiencing severe headaches',
      time: '9:35 AM',
      unread: 2,
      status: 'online',
      avatar: '/api/placeholder/32/32'
    },
    {
      id: 2,
      name: 'Michael Chen',
      lastMessage: 'Thank you doctor',
      time: 'Yesterday',
      unread: 0,
      status: 'offline',
      avatar: '/api/placeholder/32/32'
    }
  ];

  return { messages, patients };
};


const Message = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
  >
    <div className={`max-w-[70%] ${message.sender === 'doctor' ? 'order-2' : ''}`}>
      <div className={`p-4 rounded-xl ${
        message.sender === 'doctor'
          ? 'bg-teal-500 text-white'
          : 'bg-white border border-gray-100'
      }`}>
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      <div className={`flex items-center gap-2 mt-1 ${
        message.sender === 'doctor' ? 'justify-end' : 'justify-start'
      }`}>
        <span className="text-xs text-gray-500">{message.time}</span>
        {message.sender === 'doctor' && (
          <div className="flex items-center">
            {message.status === 'sent' && (
              <Check className="w-3 h-3 text-gray-400" />
            )}
            {message.status === 'read' && (
              <div className="flex">
                <Check className="w-3 h-3 text-teal-500" />
                <Check className="w-3 h-3 text-teal-500 -ml-2" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);


const ChatInterface = () => {
  const { messages, patients } = useChatData();
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      
      setNewMessage('');
      scrollToBottom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-white">

      <div className="pt-16 flex w-full h-full">
        
        <AnimatePresence>
            
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="w-[320px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0 overflow-hidden"
            >
                <div>
                        <div className="flex-1 max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg
                focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all"
            />
          </div>
        </div>
        </div>


              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {filteredPatients.map(patient => (
                    <motion.button
                      key={patient.id}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setSelectedPatient(patient);
                        if (window.innerWidth < 768) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all
                        ${selectedPatient?.id === patient.id
                          ? 'bg-teal-50 border-teal-100'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                          ${patient.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-800">{patient.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{patient.lastMessage}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">{patient.time}</span>
                        {patient.unread > 0 && (
                          <div className="mt-1 bg-teal-500 text-white text-xs rounded-full w-5 h-5
                            flex items-center justify-center">
                            {patient.unread}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col h-full">
          <div className="py-3 px-4 bg-white border-b border-gray-200 flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </motion.button>

            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                  ${selectedPatient?.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div>
                <h2 className="font-medium text-gray-800">{selectedPatient?.name}</h2>
                <p className="text-sm text-gray-500">{selectedPatient?.status}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
            </motion.button>
          </div>

          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
          >
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Image className="w-5 h-5 text-gray-500" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-gray-100 rounded-lg relative"
                  >
                    <Smile className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>
                <textarea
                  rows="1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg resize-none
                    focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all
                    max-h-32 overflow-y-auto"
                  style={{
                    minHeight: '42px',
                    height: 'auto'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    newMessage.trim()
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>


              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full left-0 mb-2"
                  >
                    <div className="bg-white rounded-lg shadow-xl border border-gray-200">
                      <Picker 
                        data={data} 
                        onEmojiSelect={handleEmojiSelect}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;