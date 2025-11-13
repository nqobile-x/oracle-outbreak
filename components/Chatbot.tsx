
import React, { useState, useEffect, useRef } from 'react';
import { OutbreakAnalysis, ChatMessage } from '../types';
import { getChatSession } from '../services/geminiService';
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon, PaperAirplaneIcon } from './icons';
import { GenerateContentResponse } from '@google/genai';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: OutbreakAnalysis | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && analysis && !isInitialized.current) {
        const chat = getChatSession();
        const initialPrompt = `This is the current situation report: ${JSON.stringify(analysis, null, 2)}. Please answer my questions based on this. Start by greeting me and letting me know you're ready to help.`;
        
        setIsLoading(true);
        setMessages([]); // Clear previous messages
        
        chat.sendMessage({ message: initialPrompt }).then((response) => {
            setMessages([{ role: 'model', text: response.text }]);
        }).catch(err => {
            console.error("Chatbot initialization failed", err);
            setMessages([{ role: 'model', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
        }).finally(() => {
            setIsLoading(false);
        });

        isInitialized.current = true;
    }
    if (!isOpen) {
        isInitialized.current = false; // Reset on close
    }
  }, [isOpen, analysis]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const chat = getChatSession();
        const result = await chat.sendMessageStream({ message: input });
        
        let text = '';
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of result) {
            text += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = text;
                return newMessages;
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, an error occurred.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900/80 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50 flex flex-col border-l border-gray-700`}
    >
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Oracle Assistant</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <XMarkIcon className="w-7 h-7" />
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2 ${
                msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.role === 'user' && (
             <div className="flex justify-start">
                <div className="max-w-xs md:max-w-sm rounded-2xl px-4 py-2 bg-gray-700 text-gray-200 rounded-bl-none">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex items-center bg-gray-800 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the data..."
            className="w-full bg-transparent px-4 py-2 text-gray-200 focus:outline-none"
            disabled={isLoading}
          />
          <button type="submit" className="p-2 text-cyan-400 hover:text-cyan-300 disabled:text-gray-600" disabled={isLoading || !input.trim()}>
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
