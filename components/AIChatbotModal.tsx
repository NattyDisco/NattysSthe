
import React, { useState, useRef, useEffect } from 'react';
import { askAIChatbot, resetChat } from '../services/geminiService';
import { SparklesIcon, XCircleIcon } from './icons';
import { useI18n } from '../hooks/useI18n';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AIChatbotModal: React.FC<AIChatbotModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const [messages, setMessages] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (!isOpen) {
            // Reset chat state when modal is closed
            resetChat();
            setMessages([]);
        }
    }, [isOpen]);


    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { type: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponse = await askAIChatbot(input, t);
        setMessages(prev => [...prev, { type: 'ai' as const, text: aiResponse }]);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    // FIX: Cast motion.div to any to avoid type errors with motion props.
    const MotionDiv = motion.div as any;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2"><SparklesIcon className="text-indigo-500"/> {t('ai_chatbot.title')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XCircleIcon className="h-6 w-6 text-slate-500"/></button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <MotionDiv
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-md p-3 rounded-lg ${msg.type === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </MotionDiv>
                        ))}
                    </AnimatePresence>
                    {isLoading && <div className="text-center text-sm text-slate-500">Thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t dark:border-slate-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder={t('ai_chatbot.placeholder')}
                            className="flex-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                        />
                        <button onClick={handleSend} disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-400">
                            {t('ai_chatbot.send')}
                        </button>
                    </div>
                </div>
            </MotionDiv>
        </div>
    );
};

export default AIChatbotModal;
