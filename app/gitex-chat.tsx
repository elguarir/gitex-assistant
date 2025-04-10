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
import { ArrowUp, Paperclip, Square, X } from 'lucide-react';
import { useState } from 'react';
import { FileUpload, FileUploadContent, FileUploadTrigger } from '@/components/chat/file-upload';
import { uploadPdfToS3 } from '@/app/actions';
import { cn } from '@heroui/theme';
import { addToast } from '@heroui/toast';

// Add file type with status
type FileWithStatus = {
  file: File;
  status: 'idle' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
};

export function GitexChat() {
  const { messages, input, setInput, handleSubmit, status, stop } = useChat();
  //   Hook status:
  // submitted: The message has been sent to the API and we're awaiting the start of the response stream.
  // streaming: The response is actively streaming in from the API, receiving chunks of data.
  // ready: The full response has been received and processed; a new user message can be submitted.
  // error: An error occurred during the API request, preventing successful completion.
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Filter out non-PDF files
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    const nonPdfFiles = newFiles.filter(file => file.type !== 'application/pdf');

    // Show toast message if any non-PDF files were filtered out
    if (nonPdfFiles.length > 0) {
      addToast({
        title: 'Invalid file type',
        description: `Only PDF files are supported. ${nonPdfFiles.length} files were skipped.`,
        color: 'warning',
      });
    }

    // If no PDF files remain, return early
    if (pdfFiles.length === 0) {
      return;
    }

    // Continue with PDF files only
    newFiles = pdfFiles;

    // Add files with initial status
    const newFileList = newFiles.map(file => ({
      file,
      status: 'idle' as const,
    }));

    // First add the files to the state
    setFiles(prev => [...prev, ...newFileList]);

    // Then upload each file
    for (const newFile of newFileList) {
      // Update to uploading status
      setFiles(prev =>
        prev.map(f => (f.file === newFile.file ? { ...f, status: 'uploading' } : f))
      );

      try {
        // Upload to S3
        const result = await uploadPdfToS3(newFile.file);

        // Update the status based on the result
        setFiles(prev =>
          prev.map(f =>
            f.file === newFile.file
              ? {
                  ...f,
                  status: result.success ? 'success' : 'error',
                  url: result.url,
                  error: result.error,
                }
              : f
          )
        );
      } catch (error) {
        // Handle errors
        setFiles(prev =>
          prev.map(f =>
            f.file === newFile.file
              ? { ...f, status: 'error', error: 'Upload failed unexpectedly' }
              : f
          )
        );
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isLoading = status === 'submitted' || status === 'streaming';
  const showStopButton = status === 'streaming';

  // Custom form submit handler to include file URLs
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get URLs of successfully uploaded files
    const uploadedFiles = files.filter(f => f.status === 'success' && f.url);

    handleSubmit(e, {
      experimental_attachments: uploadedFiles.map(f => ({
        type: 'file',
        name: f.file.name,
        contentType: f.file.type,
        url: f.url!,
      })),
    });

    setFiles([]);
  };

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
                    setInput('Which Moroccan companies are showcasing cybersecurity solutions?')
                  }
                >
                  Which Moroccan companies are showcasing cybersecurity solutions?
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    setInput('Find exhibitors from USA working on smart city solutions in hall 19')
                  }
                >
                  Find exhibitors from USA working on smart city solutions in hall 19
                </PromptSuggestion>
                <PromptSuggestion
                  onClick={() =>
                    setInput('Based on my resume, tell me about companies I should visit')
                  }
                >
                  Based on my resume, tell me about companies I should visit
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
          <form onSubmit={handleFormSubmit}>
            <FileUpload onFilesAdded={handleFilesAdded} accept=".pdf">
              <PromptInput
                value={input}
                onSubmit={() => {}}
                isLoading={isLoading}
                maxHeight={80}
                onValueChange={setInput}
              >
                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2 w-full">
                    {files.map((fileItem, index) => (
                      <div
                        key={index}
                        className={cn(
                          'border-[1.5px] flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm',
                          {
                            'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200':
                              fileItem.status === 'error',
                            'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200':
                              fileItem.status === 'uploading',
                            'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200':
                              fileItem.status === 'success',
                            'bg-default-100 border-default-300 text-default-800':
                              !fileItem.status || fileItem.status === 'idle',
                          }
                        )}
                      >
                        <div className="flex items-center gap-2 w-[85%]">
                          <Paperclip className="size-3.5 shrink-0" />
                          <span className="max-w-[90%] truncate text-sm">
                            {fileItem.file.name}
                            {fileItem.status === 'uploading' && ' (Uploading...)'}
                            {fileItem.status === 'error' && ` (Error: ${fileItem.error})`}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onPress={() => removeFile(index)}
                          isIconOnly
                          color={
                            fileItem.status === 'error'
                              ? 'danger'
                              : fileItem.status === 'uploading'
                                ? 'warning'
                                : fileItem.status === 'success'
                                  ? 'success'
                                  : 'default'
                          }
                          isDisabled={fileItem.status === 'uploading'}
                          variant="light"
                          radius="full"
                          className="min-w-6 size-6"
                          size="sm"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <PromptInputTextarea
                  placeholder="Ask about GITEX exhibitors..."
                  className=""
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isLoading}
                />

                <PromptInputActions className="flex justify-between items-center gap-2">
                  <PromptInputAction content="Attach files">
                    <FileUploadTrigger asChild>
                      <Button variant="faded" size="sm" isIconOnly radius="full">
                        <Paperclip className="size-4" />
                      </Button>
                    </FileUploadTrigger>
                  </PromptInputAction>

                  <div className="flex items-center gap-2">
                    {showStopButton && (
                      <PromptInputAction content="Stop" onClick={stop}>
                        <Button variant="faded" size="sm" isIconOnly radius="full">
                          <Square className="size-4" />
                        </Button>
                      </PromptInputAction>
                    )}

                    <PromptInputAction content={isLoading ? 'Processing...' : 'Send message'}>
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
                  </div>
                </PromptInputActions>
              </PromptInput>
              <FileUploadContent>
                <div className="flex min-h-[200px] w-full items-center justify-center backdrop-blur-sm">
                  <div className="bg-background/90 m-4 w-full max-w-md rounded-lg border border-divider p-8 shadow-lg">
                    <div className="mb-4 flex justify-center">
                      <svg
                        className="text-muted size-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-center text-base font-medium">Drop files to upload</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      Release to add files to your message
                    </p>
                  </div>
                </div>
              </FileUploadContent>
            </FileUpload>
          </form>
        </div>
      </div>
    </div>
  );
}
