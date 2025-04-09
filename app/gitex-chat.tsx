'use client';

import { Markdown } from '@/components/chat/markdown';
import { Message, MessageAvatar, MessageContent } from '@/components/chat/message';
import { PromptSuggestion } from '@/components/chat/prompt-suggestion';
import { Button } from '@heroui/button';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/chat/prompt-input';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Square } from 'lucide-react';

export function GitexChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'user',
      content: 'Hello! Can you help me with a coding question?',
    },
    {
      id: 2,
      role: 'assistant',
      content:
        "Of course! I'd be happy to help with your coding question. What would you like to know?",
    },
    {
      id: 3,
      role: 'user',
      content: 'How do I create a responsive layout with CSS Grid?',
    },
    {
      id: 4,
      role: 'assistant',
      content:
        "Creating a responsive layout with CSS Grid is straightforward. Here's a basic example:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n```\n\nThis creates a grid where:\n- Columns automatically fit as many as possible\n- Each column is at least 250px wide\n- Columns expand to fill available space\n- There's a 1rem gap between items\n\nWould you like me to explain more about how this works?",
    },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef('');
  const [inputValue, setInputValue] = useState('');

  const streamResponse = () => {
    if (isStreaming) return;

    setIsStreaming(true);
    const fullResponse =
      "Yes, I'd be happy to explain more about CSS Grid! The `grid-template-columns` property defines the columns in your grid. The `repeat()` function is a shorthand that repeats a pattern. `auto-fit` will fit as many columns as possible in the available space. The `minmax()` function sets a minimum and maximum size for each column. This creates a responsive layout that automatically adjusts based on the available space without requiring media queries.";

    // Add a new message with empty content that will be filled gradually
    const newMessageId = messages.length + 1;
    setMessages(prev => [
      ...prev,
      {
        id: newMessageId,
        role: 'assistant',
        content: '',
      },
    ]);

    // Start streaming content character by character
    let charIndex = 0;
    streamContentRef.current = '';

    streamIntervalRef.current = setInterval(() => {
      if (charIndex < fullResponse.length) {
        streamContentRef.current += fullResponse[charIndex];
        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessageId ? { ...msg, content: streamContentRef.current } : msg
          )
        );
        charIndex++;
      } else {
        // End streaming
        clearInterval(streamIntervalRef.current!);
        setIsStreaming(false);
      }
    }, 30); // Stream a character every 30ms
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    // Add a new user message with the suggestion
    const newMessageId = messages.length + 1;
    setMessages(prev => [
      ...prev,
      {
        id: newMessageId,
        role: 'user',
        content: suggestion,
      },
    ]);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="relative flex flex-col h-full max-w-3xl mx-auto px-3">
      <div className="flex items-center justify-between py-3 flex-shrink-0">
        <div />
        <Button size="sm" onPress={streamResponse} disabled={isStreaming}>
          {isStreaming ? 'Streaming...' : 'Add Message'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto mb-[140px]">
        <div className="flex w-full space-y-6 flex-col">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold">Welcome to Gitex Assistant</h3>
              <p className="mb-6 text-default-500">
                Ask me anything about coding, technology, or any other topic.
              </p>
              <div className="flex w-full max-w-md flex-col gap-2">
                <PromptSuggestion
                  onPress={() =>
                    handleSuggestionClick(
                      'What are the best practices for React performance optimization?'
                    )
                  }
                >
                  What are the best practices for React performance optimization?
                </PromptSuggestion>
                <PromptSuggestion
                  onPress={() =>
                    handleSuggestionClick(
                      'How do I implement authentication in a Next.js application?'
                    )
                  }
                >
                  How do I implement authentication in a Next.js application?
                </PromptSuggestion>
                <PromptSuggestion
                  onPress={() =>
                    handleSuggestionClick(
                      'Can you explain the difference between useState and useReducer in React?'
                    )
                  }
                >
                  Can you explain the difference between useState and useReducer in React?
                </PromptSuggestion>
                <PromptSuggestion
                  onPress={() =>
                    handleSuggestionClick(
                      'What are the key features of TypeScript that make it valuable for JavaScript development?'
                    )
                  }
                >
                  What are the key features of TypeScript that make it valuable for JavaScript
                  development?
                </PromptSuggestion>
              </div>
            </div>
          ) : (
            messages.map(message => {
              const isAssistant = message.role === 'assistant';

              return (
                <Message
                  key={message.id}
                  className={message.role === 'user' ? 'justify-end' : 'justify-start'}
                >
                  {isAssistant && (
                    <MessageAvatar src="/avatars/ai.png" alt="AI Assistant" fallback="AI" />
                  )}
                  <div className="max-w-[90%] flex-1">
                    {isAssistant ? (
                      <div className="prose prose-sm -mt-[18px] rounded-lg px-1 prose-neutral dark:prose-invert">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    ) : (
                      <MessageContent className="bg-content4/40 text-content4-foreground text-sm">
                        {message.content}
                      </MessageContent>
                    )}
                  </div>
                </Message>
              );
            })
          )}
        </div>
      </div>

      <div className="fixed bottom-0 max-w-3xl mx-auto left-0 right-0 bg-background/80 backdrop-blur-sm shadow-2xl p-3 border-[2px] rounded-t-lg border-divider">
        <div className="mx-auto px-1 py-px">
          <PromptInput
            value={inputValue}
            onValueChange={setInputValue}
            onSubmit={handleSubmit}
            maxHeight={80}
          >
            <PromptInputTextarea placeholder="Type your message here..." className="" />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction tooltip={'Send message'}>
                <Button
                  variant="bordered"
                  size="sm"
                  isIconOnly
                  radius="full"
                  onPress={handleSubmit}
                >
                  <ArrowUp className="size-4" />
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
