'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';

// Chat message type
type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

// Rate limiting
const MAX_MESSAGES_PER_MINUTE = 10;
const PROMPT_DELAY_MS = 15000; // 15 seconds

// Quick start questions
const QUICK_START_QUESTIONS = [
  'How unique is my fingerprint?',
  'How can I protect my privacy?',
  'What is entropy?',
  'Am I being tracked?',
  'How much is my data worth?',
  'What is canvas fingerprinting?',
];

export function FingerprintChat() {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nanoid(),
      role: 'assistant',
      content:
        "👁️ I'm your fingerprint analysis assistant. Ask me anything about browser fingerprinting, tracking, privacy protection, or what your data is worth to advertisers.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [timestamps, setTimestamps] = useState<number[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptTimer = useRef<NodeJS.Timeout | null>(null);

  // 15-second delayed prompt
  useEffect(() => {
    promptTimer.current = setTimeout(() => {
      setShowPrompt(true);
    }, PROMPT_DELAY_MS);

    return () => {
      if (promptTimer.current) clearTimeout(promptTimer.current);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rate limit check
  const canSend = useMemo(() => {
    const now = Date.now();
    return (
      timestamps.filter((ts) => now - ts < 60_000).length < MAX_MESSAGES_PER_MINUTE
    );
  }, [timestamps]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (!canSend) {
        setError('Rate limit exceeded. Please wait a minute.');
        return;
      }

      setError('');
      const userMessage: ChatMessage = {
        id: nanoid(),
        role: 'user',
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsThinking(true);

      // Update rate limit timestamps
      setTimestamps((prev) => {
        const now = Date.now();
        const recent = prev.filter((ts) => now - ts < 60_000);
        return [...recent, now];
      });

      try {
        // Call API proxy (Cloudflare Worker)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.panopticlick.org';
        const response = await fetch(`${apiUrl}/v1/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmed,
            fingerprintContext: {
              // Optional: Pass fingerprint context if available
              // entropy: 33.2,
              // uniqueness: '1 in 286,435',
              // trackers: 12,
            },
          }),
        });

        if (!response.ok) throw new Error('Request failed');

        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: data.message.content,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error('[Chat Error]', err);
        const errorMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment. In the meantime, check out our documentation or run a fingerprint scan!",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsThinking(false);
      }
    },
    [canSend]
  );

  const handleToggle = () => {
    setIsOpen((current) => !current);
    setShowPrompt(false);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleToggle}
          />
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* 15-second delayed prompt bubble */}
        <AnimatePresence>
          {showPrompt && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-auto max-w-xs rounded-2xl border border-highlight/30 bg-gradient-to-br from-paper/95 to-paper-100/95 p-5 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight/20">
                  <Eye className="h-5 w-5 text-ink" />
                </div>
                <div>
                  <p className="font-serif text-sm font-bold text-ink">
                    Got Questions?
                  </p>
                  <p className="mt-1 text-xs text-ink-200 leading-relaxed">
                    Ask me about your fingerprint analysis, privacy protection, or how
                    AdTech tracks you.
                  </p>
                  <button
                    onClick={handleToggle}
                    className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-highlight hover:text-highlight/80 transition-colors"
                  >
                    Chat Now →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto fixed inset-x-4 bottom-4 z-50 flex max-h-[600px] flex-col rounded-3xl border border-paper-300 bg-gradient-to-br from-paper/98 to-paper-100/98 shadow-2xl backdrop-blur-lg sm:inset-x-auto sm:right-6 sm:w-[420px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-paper-300 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-highlight/20 to-highlight/10">
                    <Eye className="h-5 w-5 text-ink animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-ink">
                      Fingerprint Analysis
                    </h3>
                    <p className="text-xs font-mono text-ink-300">
                      Panopticlick AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  className="rounded-full p-2 text-ink-300 transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={
                      message.role === 'assistant'
                        ? 'flex items-start gap-3'
                        : 'ml-auto max-w-[85%]'
                    }
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-highlight/10">
                        <Eye className="h-4 w-4 text-ink-200" />
                      </div>
                    )}
                    <div
                      className={
                        message.role === 'assistant'
                          ? 'flex-1 rounded-2xl bg-paper-100/80 p-4 text-sm leading-relaxed text-ink-100'
                          : 'rounded-2xl border border-highlight/30 bg-gradient-to-br from-highlight/10 to-highlight/5 p-4 text-sm leading-relaxed text-ink'
                      }
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-highlight/10">
                      <Eye className="h-4 w-4 text-ink-200" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 2 && (
                <div className="border-t border-paper-300 p-4">
                  <p className="mb-3 text-xs font-mono uppercase tracking-wider text-ink-300">
                    Quick Start
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_START_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleQuickQuestion(question)}
                        disabled={isThinking}
                        className="rounded-full border border-paper-300 bg-paper-100/50 px-3 py-1.5 text-xs text-ink-200 transition-all hover:border-highlight/30 hover:bg-highlight/5 hover:text-ink disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-paper-300 p-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder="Ask about fingerprinting..."
                    disabled={isThinking}
                    className="flex-1 rounded-full border border-paper-300 bg-paper-100/50 px-4 py-2.5 text-sm text-ink placeholder:text-ink-300 focus:border-highlight/30 focus:outline-none focus:ring-2 focus:ring-highlight/20 disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={isThinking || !input.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-highlight to-highlight/80 text-ink shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs text-red-600">{error}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.button
          onClick={handleToggle}
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-highlight to-highlight/80 text-ink shadow-2xl transition-all hover:scale-110 hover:shadow-highlight/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={
            showPrompt && !isOpen
              ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    '0 20px 25px -5px rgb(253 224 71 / 0.4), 0 8px 10px -6px rgb(253 224 71 / 0.2)',
                    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  ],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: showPrompt && !isOpen ? Infinity : 0,
            ease: 'easeInOut',
          }}
          aria-label="Open fingerprint analysis chat"
        >
          <Eye className="h-7 w-7" />
        </motion.button>
      </div>
    </>
  );
}
