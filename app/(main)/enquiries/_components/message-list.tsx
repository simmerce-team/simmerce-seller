'use client';

import { Message } from '@/actions/conversations';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  currentUserId: string;
  className?: string;
};

export function MessageList({ messages, isLoading, currentUserId, className }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const messageDate = new Date(message.created_at);
          const formattedTime = format(messageDate, 'h:mm a');

          return (
            <div
              key={message.id}
              className={cn('flex', {
                'justify-end': isCurrentUser,
                'justify-start': !isCurrentUser,
              })}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                  'relative'
                )}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-medium text-muted-foreground">
                    {message.sender_name}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{message.message_content}</p>
                <div
                  className={cn(
                    'mt-1 text-xs',
                    isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {formattedTime}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
