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
import { useChat } from 'ai/react';
import { ArrowUp } from 'lucide-react';
import { ChangeEvent, FormEvent } from 'react';

export function GitexChat() {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat();

  const handleSuggestionClick = (suggestion: string) => {
    const e = {
      target: { value: suggestion },
    } as ChangeEvent<HTMLInputElement>;

    setInput(suggestion);
  };

  return (
    <div className="relative flex flex-col h-full max-w-3xl mx-auto px-3 pt-10">
      <div className="flex-1 overflow-y-auto mb-[140px]">
        <div className="flex w-full space-y-6 flex-col">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold">Welcome to Gitex Assistant</h3>
              <p className="mb-6 text-default-500">
                Ask me anything about GITEX exhibitors, their products, or sectors.
              </p>
              <div className="flex w-full max-w-md flex-col gap-2">
                <PromptSuggestion
                  onClick={() => handleSuggestionClick('Show me exhibitors in the AI sector')}
                >
                  Show me exhibitors in the AI sector
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    handleSuggestionClick('Which companies are showcasing cybersecurity solutions?')
                  }
                >
                  Which companies are showcasing cybersecurity solutions?
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    handleSuggestionClick('Find exhibitors from the United Arab Emirates')
                  }
                >
                  Find exhibitors from the United Arab Emirates
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    handleSuggestionClick(
                      'Tell me about companies working on blockchain technology'
                    )
                  }
                >
                  Tell me about companies working on blockchain technology
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
          <form onSubmit={handleSubmit}>
            <PromptInput
              value={input}
              onSubmit={handleSubmit}
              maxHeight={80}
              onValueChange={setInput}
            >
              <PromptInputTextarea
                placeholder="Ask about GITEX exhibitors..."
                className=""
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
              />
              <PromptInputActions className="justify-end pt-2">
                <PromptInputAction tooltip={isLoading ? 'Processing...' : 'Send message'}>
                  <Button
                    variant="bordered"
                    size="sm"
                    isIconOnly
                    radius="full"
                    type="submit"
                    isLoading={isLoading}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>
          </form>
        </div>
      </div>
    </div>
  );
}
