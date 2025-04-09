'use client';

import { Markdown } from '@/components/chat/markdown';
import { Message, MessageAvatar, MessageContent } from '@/components/chat/message';
import { PromptSuggestion } from '@/components/chat/prompt-suggestion';
import { Button } from '@heroui/button';
import { Loader, PulseDotLoader } from '@/components/chat/loader';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '@/components/chat/prompt-input';
import { useChat } from 'ai/react';
import { ArrowUp, Square } from 'lucide-react';

export function GitexChat() {
  const { messages, input, setInput, handleSubmit, status, stop } = useChat();
  //   Hook status:
  // submitted: The message has been sent to the API and we're awaiting the start of the response stream.
  // streaming: The response is actively streaming in from the API, receiving chunks of data.
  // ready: The full response has been received and processed; a new user message can be submitted.
  // error: An error occurred during the API request, preventing successful completion.
  const isLoading = status === 'submitted' || status === 'streaming';
  const showStopButton = status === 'streaming';

  return (
    <div className="relative flex flex-col h-full max-w-3xl mx-auto pt-7">
      <div className="flex-1 overflow-y-auto mb-[140px] p-3">
        <div className="flex w-full space-y-6 flex-col">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <h3 className="mb-2 text-xl font-semibold">Welcome to Gitex Assistant</h3>
              <p className="mb-6 text-default-500">
                Ask me anything about GITEX exhibitors, their products, or sectors.
              </p>
              <div className="flex w-full max-w-md flex-col gap-2">
                <PromptSuggestion onClick={() => setInput('Show me exhibitors in the AI sector')}>
                  Show me exhibitors in the AI sector
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    setInput('Which companies are showcasing cybersecurity solutions?')
                  }
                >
                  Which companies are showcasing cybersecurity solutions?
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() => setInput('Find exhibitors from the United Arab Emirates')}
                >
                  Find exhibitors from the United Arab Emirates
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    setInput('Tell me about companies working on blockchain technology')
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
                    <MessageAvatar src="/logo.svg" alt="AI Assistant" fallback="AI" />
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
          {status === 'submitted' && (
            <Message className="justify-start">
              <MessageAvatar src="/logo.svg" alt="AI Assistant" fallback="AI" />
              <div className="flex items-center h-8 px-4">
                <PulseDotLoader className="text-default" />
              </div>
            </Message>
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
                {showStopButton && (
                  <PromptInputAction tooltip="Stop" onClick={stop}>
                    <Button variant="faded" size="sm" isIconOnly radius="full">
                      <Square className="size-4" />
                    </Button>
                  </PromptInputAction>
                )}

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
