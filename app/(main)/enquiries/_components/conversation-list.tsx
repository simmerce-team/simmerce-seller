"use client";

import { Conversation } from "@/actions/conversations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

type ConversationListProps = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  isMobile?: boolean;
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  isMobile = false,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground">
          Your enquiries will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant={
              selectedConversationId === conversation.id ? "secondary" : "ghost"
            }
            className={cn(
              "h-auto w-full justify-start px-3 py-2 text-left",
              selectedConversationId === conversation.id && "font-medium",
              isMobile ? "h-16" : "h-20"
            )}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex w-full flex-col">
              <div className="flex w-full items-center justify-between">
                <span className="truncate font-medium">
                  {conversation.product_name || "Product"}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(conversation.last_message_at || ""),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              <p className="w-full truncate text-sm text-muted-foreground">
                {conversation.last_message || "No messages yet"}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
