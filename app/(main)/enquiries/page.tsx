'use client';

import { getConversations, getMessages, sendMessage } from '@/actions/conversations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConversationList } from './_components/conversation-list';
import { ConversationView } from './_components/conversation-view';

export default function EnquiriesPage() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(!isMobile);
  const supabase = createClient();

  // Fetch conversations
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    select: (data) => data?.data || [],
  });

  // Set initial conversation on mobile
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0]?.id);
    }
  }, [conversations, selectedConversationId]);

  // Fetch messages for the selected conversation
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => selectedConversationId ? getMessages(selectedConversationId).then(res => res.data || []) : Promise.resolve([]),
    enabled: !!selectedConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversationId || !newMessage.trim()) return;
      return sendMessage(selectedConversationId, newMessage);
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`conversation_${selectedConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, queryClient, supabase]);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  // Handle back to conversations on mobile
  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  // Show loading state
  if (isLoadingConversations) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (conversationsError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive">Failed to load conversations. Please try again.</p>
        <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({queryKey: ['conversations']})}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card className="flex h-full flex-col md:flex-row p-0">
      {/* Conversation List */}
      <div className={cn(
        'h-1/2 w-full border-b md:h-full md:w-80 md:border-r md:border-b-0',
        !showConversationList && 'hidden md:block'
      )}>
        <div className="flex h-16 items-center border-b px-4">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isLoading={isLoadingConversations}
          isMobile={isMobile}
        />
      </div>

      {/* Conversation View */}
      <div className={cn(
        'flex-1',
        showConversationList && 'hidden md:flex'
      )}>
        {selectedConversationId ? (
          <>
            {isMobile && (
              <div className="flex h-16 items-center border-b px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToConversations}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold">
                  {conversations.find(c => c.id === selectedConversationId)?.product_name || 'Conversation'}
                </h2>
              </div>
            )}
            <ConversationView
              messages={messages}
              isLoading={isLoadingMessages}
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
              onSendMessage={() => sendMessageMutation.mutate()}
              isSending={sendMessageMutation.isPending}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </Card>
  );
}