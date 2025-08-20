'use client';

import { Message } from '@/actions/conversations';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';

type ConversationViewProps = {
  messages: Message[];
  isLoading: boolean;
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
  className?: string;
};

export function ConversationView({
  messages,
  isLoading,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  isSending,
  className,
}: ConversationViewProps) {
  const { user } = useAuth();

  const handleSendMessage = () => {
    if (newMessage.trim() && !isSending) {
      onSendMessage();
    }
  };

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        currentUserId={user?.id || ''} 
        className="flex-1" 
      />
      <MessageInput
        value={newMessage}
        onChange={onNewMessageChange}
        onSend={handleSendMessage}
        disabled={isSending}
      />
    </div>
  );
}