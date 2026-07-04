import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, Sprout, Sparkles,
  RotateCcw, Copy, ThumbsUp, ThumbsDown, MessageSquare, Plus, Menu, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';

import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import type { SupportedLanguage } from '../api/ai/prompts';
import { streamChatResponse } from '../api/ai/client';
import { AI_CONFIG } from '../api/ai/config';
import { 
  getConversations, 
  createConversation, 
  getMessages, 
  addMessage 
} from '../api/conversations';
import type { Conversation, Message } from '../api/types';

const SUGGESTIONS = [
  '🌾 How do I treat wheat rust?',
  '💧 When should I irrigate tomatoes?',
  '📈 Is now a good time to sell onions?',
  '🐛 How to control aphids organically?',
];

const LANGUAGES: SupportedLanguage[] = ['English', 'Hindi', 'Bengali', 'Odia'];

const remarkPlugins = [remarkGfm];

export default function AIChatPage() {
  const { user, profile } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    (profile?.preferred_language as SupportedLanguage) || 'English'
  );
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Scroll to bottom on new messages or streaming content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isTyping]);

  async function loadConversations() {
    if (!user) return;
    try {
      const convs = await getConversations(user.uid);
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadMessages(convId: string) {
    try {
      const msgs = await getMessages(convId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !user) return;

    setInput('');
    setIsTyping(true);
    setStreamingContent('');

    try {
      let convId = activeConversationId;
      
      // Create a new conversation if we don't have one
      if (!convId) {
        const newTitle = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        const newConv = await createConversation(user.uid, newTitle);
        setConversations(prev => [newConv, ...prev]);
        convId = newConv.id;
        setActiveConversationId(convId);
      }

      // Add user message to UI immediately for snappiness, then save to DB
      const userMessageObj: Omit<Message, 'id' | 'created_at'> = {
        conversation_id: convId,
        user_id: user.uid,
        role: 'user',
        content: messageText
      };
      
      // Save user message to Firebase
      const savedUserMsg = await addMessage(userMessageObj);
      setMessages(prev => [...prev, savedUserMsg]);

      // Start streaming AI response
      const stream = streamChatResponse(messages, messageText, selectedLanguage);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      // Save assistant message to Firebase
      const assistantMessageObj: Omit<Message, 'id' | 'created_at'> = {
        conversation_id: convId,
        user_id: user.uid,
        role: 'assistant',
        content: fullResponse
      };
      
      const savedAssistantMsg = await addMessage(assistantMessageObj);
      
      setMessages(prev => [...prev, savedAssistantMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response from AI. Please try again.');
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-130px)] lg:max-h-[calc(100vh-64px)] relative bg-white dark:bg-slate-900">
      
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* History Sidebar */}
      <div className={cn(
        "absolute lg:static inset-y-0 left-0 w-72 bg-gray-50 dark:bg-slate-800/50 border-r border-gray-100 dark:border-slate-700 z-30 transform transition-transform duration-300 ease-in-out flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Chat History</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {loadingHistory ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading history...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">No past conversations</div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  activeConversationId === conv.id 
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                )}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Chat Header */}
        <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-card-gradient-green rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">KrishiMitra AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Powered by {AI_CONFIG.modelDisplayName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className="text-xs bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button
              onClick={handleNewChat}
              className="hidden sm:flex p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && !isTyping ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-display">How can I help your farm today?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
                Ask me about crop diseases, weather forecasts, market prices, or general farming advice in your preferred language.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 p-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1',
                    message.role === 'assistant'
                      ? 'bg-card-gradient-green'
                      : 'bg-gradient-to-br from-primary-400 to-primary-600'
                  )}>
                    {message.role === 'assistant'
                      ? <Sprout className="w-4 h-4 text-white" />
                      : <span className="text-xs font-bold text-white">{profile?.full_name?.[0] || 'U'}</span>
                    }
                  </div>

                  {/* Message Bubble */}
                  <div className={cn('max-w-[85%] sm:max-w-[75%] space-y-1 flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden',
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm shadow-sm'
                    )}>
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
                          <ReactMarkdown remarkPlugins={remarkPlugins}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 px-1">
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Copy">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-green-500 transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-red-500 transition-colors">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Streaming / Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-xl bg-card-gradient-green flex items-center justify-center flex-shrink-0 mt-1">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              
              <div className="max-w-[85%] sm:max-w-[75%] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                {streamingContent ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1">
                    <ReactMarkdown remarkPlugins={remarkPlugins}>
                      {streamingContent + ' ▋'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 z-10">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about farming..."
                rows={1}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm transition-all"
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
            </div>
            <div className="flex gap-2 mb-1">
              <button
                className="p-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                id="send-message-btn"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-3 max-w-xl mx-auto">
            AI responses are for guidance only. Consult local agricultural experts for critical decisions before applying chemicals.
          </p>
        </div>
      </div>
    </div>
  );
}
