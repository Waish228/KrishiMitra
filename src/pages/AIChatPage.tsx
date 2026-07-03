import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, Paperclip, Sprout, Sparkles,
  RotateCcw, Copy, ThumbsUp, ThumbsDown, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  liked?: boolean;
}

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `Namaste! 🌾 I'm **KrishiMitra AI**, your intelligent farming assistant powered by Google Gemini AI.

I can help you with:
- 🔍 **Crop disease identification** and treatment
- 🌡️ **Weather-based farming** advice
- 💰 **Market price predictions** and selling strategies
- 🌱 **Crop selection** based on soil and season
- 💧 **Irrigation and fertilizer** recommendations

Ask me anything about farming — in Hindi or English!`,
    timestamp: new Date(),
  }
];

const suggestions = [
  '🌾 How do I treat wheat rust?',
  '💧 When should I irrigate tomatoes?',
  '📈 Is now a good time to sell onions?',
  '🐛 How to control aphids organically?',
  '🌱 Best fertilizer for mustard crop?',
  '🌡️ What crops grow well in summer?',
];

const simulateResponse = (question: string): string => {
  const responses: Record<string, string> = {
    default: `Great question! Based on current agricultural data and AI analysis, here's my recommendation:

**Analysis:**
Your query relates to an important aspect of farming. Let me provide you with expert guidance.

**Key Recommendations:**
1. 📊 Monitor soil moisture levels regularly (ideal: 60-80% field capacity)
2. 🌿 Apply organic matter to improve soil structure
3. 💧 Use drip irrigation for water efficiency
4. 🔬 Get soil tested every 2-3 years for accurate fertilizer planning

**Seasonal Tip:**
Given the current weather patterns, this is a good time to focus on preventive crop care rather than reactive treatment.

Would you like more specific advice on any of these points? 🌱`,
  };

  const lower = question.toLowerCase();
  if (lower.includes('wheat') || lower.includes('rust')) {
    return `**Wheat Rust Treatment Guide 🌾**

Wheat rust is a serious fungal disease. Here's how to manage it:

**Identification:**
- Orange/brown powdery spots on leaves (leaf rust)
- Yellow stripes on leaves (stripe rust)
- Dark brown pustules on stem (stem rust)

**Immediate Treatment:**
1. **Fungicide Application:** Spray Propiconazole 25% EC @ 1ml/L water
2. **Timing:** Apply early morning or evening
3. **Repeat:** After 15-20 days if needed

**Preventive Measures:**
- Use rust-resistant varieties (HD 3086, DBW 187)
- Ensure proper plant spacing for airflow
- Avoid excess nitrogen application
- Monitor crops weekly during March-April

**Cost:** ~₹800-1000/acre for one spray

⚠️ Act quickly! Rust can spread to 100% of crop in 7-10 days under favorable conditions.

Need help identifying the type of rust? Upload a photo for AI diagnosis! 📸`;
  }

  if (lower.includes('irrigat') || lower.includes('water')) {
    return `**Irrigation Guide for Your Crops 💧**

Proper irrigation is crucial for maximum yield. Here's an AI-optimized schedule:

**Current Weather Assessment:**
- Temperature: 28°C (moderate)
- Humidity: 68% (good)
- Next rain: 48 hours away ⛈️

**Recommended Irrigation:**
| Crop | Current Stage | Water Need | Next Irrigation |
|------|--------------|-----------|----------------|
| Wheat | Ripening | Low | Skip (rain expected) |
| Tomato | Flowering | High | Tomorrow 6 AM |
| Mustard | Seedling | Medium | Day after tomorrow |

**Water-Saving Tips:**
1. 🕕 Water during early morning (6-8 AM) to reduce evaporation
2. 💦 Use mulching to retain soil moisture
3. 📱 Use soil moisture sensors for precision irrigation
4. 🚿 Drip irrigation saves 40-60% water vs flood irrigation

**Weekly Water Budget:** 1,240 liters (saving 18% vs last week)

Would you like me to create a detailed irrigation calendar? 📅`;
  }

  return responses.default;
};

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: simulateResponse(messageText),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/\|(.*?)\|/g, (match) => `<span class="font-mono text-xs">${match}</span>`);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-130px)] lg:max-h-[calc(100vh-64px)]">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 bg-card-gradient-green rounded-xl flex items-center justify-center shadow-md">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">KrishiMitra AI</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Powered by Google Gemini</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-green text-xs px-2 py-1">
            <Sparkles className="w-3 h-3 inline mr-1" />
            AI Active
          </span>
          <button
            onClick={() => { setMessages(sampleMessages); setShowSuggestions(true); }}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="New Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
                message.role === 'assistant'
                  ? 'bg-card-gradient-green'
                  : 'bg-gradient-to-br from-primary-400 to-primary-600'
              )}>
                {message.role === 'assistant'
                  ? <Sprout className="w-4 h-4 text-white" />
                  : <span className="text-xs font-bold text-white">RS</span>
                }
              </div>

              {/* Message Bubble */}
              <div className={cn('max-w-[80%] space-y-1', message.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col')}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm shadow-sm'
                )}>
                  <div
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    className="prose prose-sm max-w-none dark:prose-invert"
                  />
                </div>

                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
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

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-end"
          >
            <div className="w-8 h-8 rounded-xl bg-card-gradient-green flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2 font-medium">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors border border-gray-200 dark:border-slate-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about farming..."
              rows={1}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm transition-all"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="p-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              id="send-message-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">
          AI responses are for guidance only. Consult local agricultural experts for critical decisions.
        </p>
      </div>
    </div>
  );
};

export default AIChatPage;
