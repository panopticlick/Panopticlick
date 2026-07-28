'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Loader2, RotateCcw, Send } from 'lucide-react';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';
import {
  APIError,
  api,
  type AIChatContext,
  type AIChatMessage,
} from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FailedRequest {
  conversation: ChatMessage[];
  question: string;
}

const OPENING_STATEMENT =
  'This is the interrogation room. Ask me anything about fingerprinting, tracking, ' +
  'or what your data is worth. If a case file is attached, I will use its metrics.';

const QUICK_QUESTIONS = [
  'How unique is my fingerprint?',
  'How can I protect my privacy?',
  'What is entropy?',
  'How much is my data worth?',
];

// Soft client-side guard so the UI degrades politely before the worker's real
// rate limiter (10/min) starts returning 429s.
const MAX_MESSAGES_PER_MINUTE = 8;

/**
 * Interrogation-transcript chat surface. Multi-turn: the whole visible
 * conversation is replayed to the API each round. When a scan report exists,
 * its key numbers ride along so answers reference the visitor's actual case.
 */
export function ChatPanel({
  context,
  className,
  focusInputOnMount = false,
}: {
  context?: AIChatContext;
  className?: string;
  focusInputOnMount?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'opening', role: 'assistant', content: OPENING_STATEMENT },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const [failedRequest, setFailedRequest] = useState<FailedRequest | null>(null);
  const sentAt = useRef<number[]>([]);
  const requestPending = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, thinking]);

  const requestAnswer = useCallback(
    async (conversation: ChatMessage[], question: string) => {
      requestPending.current = true;
      setThinking(true);
      setError('');
      setFailedRequest(null);

      try {
        const response = await api.ai.chat(
          // The scripted opening line is UI chrome, not conversation.
          conversation
            .filter((message) => message.id !== 'opening')
            .map<AIChatMessage>(({ role, content }) => ({ role, content })),
          context
        );
        const content = response.message?.content?.trim();
        if (!content) throw new Error('The analysis desk returned an empty response.');

        setMessages((current) => [
          ...current,
          {
            id: response.message.id || nanoid(),
            role: 'assistant',
            content,
          },
        ]);
      } catch (requestError) {
        console.error('[chat] request failed', requestError);
        if (requestError instanceof APIError && requestError.status === 429) {
          const wait = requestError.retryAfterSeconds;
          setError(
            wait
              ? `The analysis desk is rate-limited. Try again in about ${wait} seconds.`
              : 'The analysis desk is rate-limited. Wait a minute before trying again.'
          );
          // An immediate retry would predictably fail and consume another
          // request, so keep the question in the transcript without a retry
          // control until the visitor submits again later.
          setFailedRequest(null);
        } else {
          setError(
            'The line to the analysis desk dropped. Your question is still on the record.'
          );
          setFailedRequest({ conversation, question });
        }
      } finally {
        requestPending.current = false;
        setThinking(false);
      }
    },
    [context]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || requestPending.current) return;

      const now = Date.now();
      sentAt.current = sentAt.current.filter((t) => now - t < 60_000);
      if (sentAt.current.length >= MAX_MESSAGES_PER_MINUTE) {
        setFailedRequest(null);
        setError('Slow down — the stenographer needs a minute to catch up.');
        return;
      }
      sentAt.current.push(now);

      const outgoing: ChatMessage = { id: nanoid(), role: 'user', content: trimmed };
      const conversation = [...messages, outgoing];
      setMessages(conversation);
      setInput('');
      await requestAnswer(conversation, trimmed);
    },
    [messages, requestAnswer]
  );

  const showQuickQuestions = messages.length <= 1;

  return (
    <div className={cn('flex flex-col rounded-sm border border-paper-300 bg-paper', className)}>
      <div className="flex items-center justify-between border-b border-paper-300 bg-paper-100 px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-300">
          Interrogation transcript
        </span>
        <span className="font-mono text-xs text-ink-300">
          {context?.entropyBits != null || context?.entropy != null
            ? `case context: ${(context.entropyBits ?? context.entropy ?? 0).toFixed(1)} bits`
            : 'no case file attached'}
        </span>
      </div>

      <div
        ref={logRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
        style={{ maxHeight: '24rem', minHeight: '14rem' }}
        role="log"
        aria-label="Interrogation transcript"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={thinking}
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="text-sm leading-relaxed"
          >
            <span
              className={cn(
                'mr-2 font-mono text-xs font-bold uppercase tracking-wider',
                message.role === 'assistant' ? 'text-stamp-blue' : 'text-ink-300'
              )}
            >
              {message.role === 'assistant' ? 'Agent:' : 'Subject:'}
            </span>
            {message.role === 'assistant' ? (
              <div className="mt-1 max-w-none border-l-2 border-paper-300 pl-3 font-serif [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-ink-300 [&_blockquote]:pl-3 [&_code]:font-mono [&_code]:text-xs [&_h1]:my-2 [&_h1]:font-bold [&_h2]:my-2 [&_h2]:font-bold [&_h3]:my-2 [&_h3]:font-bold [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                <ReactMarkdown
                  components={{
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noreferrer">
                        {children}
                      </a>
                    ),
                    // The page owns its document outline. Model-authored
                    // Markdown must not introduce a second H1.
                    h1: ({ children }) => <h3>{children}</h3>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <span className="font-serif">{message.content}</span>
            )}
          </motion.div>
        ))}

        {thinking && (
          <div role="status" className="flex items-center gap-2 font-mono text-xs text-ink-300">
            <Loader2
              className={cn('h-3.5 w-3.5', !reducedMotion && 'animate-spin')}
              aria-hidden="true"
            />
            The agent is consulting the file…
          </div>
        )}
      </div>

      {showQuickQuestions && (
        <div className="flex flex-wrap gap-2 border-t border-dashed border-paper-300 px-4 py-3">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void send(question)}
              disabled={thinking}
              className="rounded-sm border border-paper-300 bg-paper-100 px-2.5 py-1 font-mono text-xs text-ink-200 transition-colors hover:border-ink hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-stamp-blue disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2 border-t border-paper-300 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask the agent a question
        </label>
        <input
          id={inputId}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="State your question for the record…"
          disabled={thinking}
          maxLength={1000}
          autoComplete="off"
          autoFocus={focusInputOnMount}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="flex-1 rounded-sm border border-paper-300 bg-paper-100 px-3 py-2 font-serif text-sm placeholder:text-ink-300 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-stamp-blue disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-ink text-paper transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-stamp-blue focus-visible:ring-offset-2 disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {error && (
        <div
          id={`${inputId}-error`}
          role="alert"
          className="mx-3 mb-3 flex items-start justify-between gap-3 border-l-2 border-alert-red bg-alert-red/10 px-3 py-2 font-mono text-xs text-alert-red"
        >
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
          {failedRequest && (
            <button
              type="button"
              onClick={() =>
                void requestAnswer(failedRequest.conversation, failedRequest.question)
              }
              disabled={thinking}
              className="flex shrink-0 items-center gap-1 underline underline-offset-2 disabled:opacity-50"
              aria-label={`Retry question: ${failedRequest.question}`}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
