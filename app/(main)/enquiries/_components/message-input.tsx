'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { KeyboardEvent, useRef } from 'react';

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="flex w-full items-center gap-2 border-t bg-background p-4">
      <Input
        ref={inputRef}
        type="text"
        className="flex-1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button
        type="button"
        size="icon"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="h-10 w-10 shrink-0"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}
