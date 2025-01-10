import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles, AlertCircle, FileText } from 'lucide-react';

const API_BASE_URL = 'https://anochat.in/v1/chat/gpt';

const ChatArea = () => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('healthhub_chat_messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const getAuthToken = () => {
    const localToken = localStorage.getItem('healthhub_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');

    const sessionToken = sessionStorage.getItem('healthhub_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token');

    return localToken || sessionToken;
  };

  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    try {
      const token = getAuthToken();

      if (!token) {
        setError('Please log in to continue.');
        throw new Error('Authentication required');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          throw new Error('Session expired');
        }
        throw new Error('Request failed');
      }

      const data = await response.json();

      if (!data) {
        throw new Error('Invalid response format');
      }

      return data;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  };

  const fetchWelcomeMessage = async () => {
    try {
      const data = await makeAuthenticatedRequest('/query', {
        method: 'POST',
        body: JSON.stringify({
          query: "Hi, could you introduce yourself and ask how you can help with my health today?"
        })
      });

      if (data.response) {
        setMessages([{
          id: 'initial',
          type: 'ai',
          content: data.response
        }]);
      }
    } catch (error) {
      const message = error.message === 'Authentication required'
        ? "Hello! Please make sure you're logged in to chat with your Health AI Assistant."
        : "Hello! I'm your Health AI Assistant. How can I help you today?";

      setMessages([{
        id: 'initial',
        type: 'ai',
        content: message
      }]);
    }
  };

  const requestHealthSummary = async () => {
    if (isLoadingSummary) return;

    setIsLoadingSummary(true);
    setError(null);

    try {
      const data = await makeAuthenticatedRequest('/health-summary');

      if (data.summary) {
        const formattedSummary = data.summary
          .split('\n')
          .filter(line => line.trim())
          .join('\n\n');

        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: formattedSummary
        }]);
      } else {
        throw new Error('No summary data received');
      }
    } catch (error) {
      if (error.message === 'Authentication required') {
        setError('Please log in to view your health summary.');
      } else {
        setError('Unable to fetch health summary. Please try again later.');
      }
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isFetching) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ query: currentMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: data.response
        }]);
      } else {
        console.error('Unexpected API response:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Chat error:', error);
      if (error.message === 'Authentication required') {
        setError('Please log in to continue the conversation.');
      } else {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: "I apologize, but I wasn't able to understand that. Could you please rephrase your question?"
        }]);
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      fetchWelcomeMessage();
    }
  }, [messages.length]);

  useEffect(() => {
    localStorage.setItem('healthhub_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
            <Bot className="w-6 h-6 text-teal-500 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              HealthHub AI Assistant
              <Sparkles className="w-4 h-4 text-teal-500" />
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your personal health companion
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestHealthSummary}
          disabled={isLoadingSummary || !getAuthToken()}
          className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 
            text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-100 
            dark:hover:bg-teal-900/40 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingSummary ? (
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>Get Health Summary</span>
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-96 mb-4 border dark:border-gray-700 border-gray-200 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                className={`p-4 rounded-xl max-w-[80%] whitespace-pre-wrap ${msg.type === 'user'
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                whileHover={{ scale: 1.01 }}
              >
                {msg.content}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700 border-gray-200">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getAuthToken() ? "Ask me anything about your health..." : "Please log in to chat"}
            className="flex-grow p-3 border-2 dark:border-gray-700 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
              dark:bg-gray-800 dark:text-white transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFetching || !getAuthToken()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isFetching || !getAuthToken()}
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-3 rounded-xl
              hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 flex items-center justify-center min-w-[48px]"
          >
            {isFetching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {getAuthToken()
            ? "Ask questions about your health data, medications, or general health advice"
            : "Please log in to chat with your Health AI Assistant"
          }
        </p>
      </div>
    </div>
  );
};

export default ChatArea;