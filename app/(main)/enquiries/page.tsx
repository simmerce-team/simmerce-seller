'use client';

import { getConversations, getMessages, sendMessage, type Conversation, type Message } from '@/actions/conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EnquiriesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const supabase = createClient();

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await getConversations();
        if (!error && data.length > 0) {
          setConversations(data);
          // Select the first conversation by default
          if (!selectedConversation) {
            setSelectedConversation(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Set up real-time subscription for new messages
  useEffect(() => {
    // First, fetch the current user's business ID
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the user's business ID
      const { data: businessData } = await supabase
        .from('user_businesses')
        .select('business_id')
        .eq('user_id', user.id)
        .single();

      if (!businessData) return;

      const channel = supabase
        .channel('conversation_messages')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'conversation_messages',
            filter: `conversation_id=eq.${selectedConversation}`
          },
          async (payload) => {
            // Get the conversation to check if the sender is the seller
            const { data: conversation } = await supabase
              .from('conversations')
              .select('seller_business_id')
              .eq('id', selectedConversation)
              .single();

            if (!conversation) return;

            // Determine if the sender is the current user (seller)
            const isSender = payload.new.sender_id === user.id && 
                           businessData.business_id === conversation.seller_business_id;

            setMessages(prev => [
              ...prev,
              {
                id: payload.new.id,
                conversation_id: payload.new.conversation_id,
                sender_id: payload.new.sender_id,
                sender_name: isSender ? 'You' : 'Buyer', // You might want to fetch the actual name
                message_content: payload.new.message_content,
                created_at: payload.new.created_at,
                is_sender: isSender
              }
            ]);

            // Refresh conversations to update last message
            const { data: updatedConversations } = await getConversations();
            if (updatedConversations) setConversations(updatedConversations);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    if (selectedConversation) {
      setupSubscription();
    }
  }, [selectedConversation]);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await getMessages(selectedConversation);
        if (!error) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      // Get the current user's info for optimistic update
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create optimistic message
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: selectedConversation,
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || 'You',
        message_content: messageToSend,
        created_at: new Date().toISOString(),
        is_sender: true // Always true for sent messages
      };
      
      // Add optimistic message
      setMessages(prev => [...prev, tempMessage]);
      
      // Send the message
      const { error } = await sendMessage(selectedConversation, messageToSend);
      
      if (error) throw new Error(error);
      
      // Refresh messages to get the actual message with proper ID
      const { data: updatedMessages } = await getMessages(selectedConversation);
      setMessages(updatedMessages);
      
      // Update conversation list to show the latest message
      const { data: updatedConversations } = await getConversations();
      if (updatedConversations) setConversations(updatedConversations);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      
      // Restore the message in the input
      setNewMessage(messageToSend);
      
      // Show error to user (you might want to use a toast or alert)
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle conversation selection on mobile
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const getSelectedConversation = () => {
    return conversations.find((conv) => conv.id === selectedConversation);
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Left column - Conversation list */}
        <div 
          className={`${isMobile ? (showConversationList ? 'flex' : 'hidden') : 'flex'} 
                     md:flex md:w-80 w-full flex-col border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0`}
        >
          <div className="p-3 md:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h1 className="text-lg md:text-xl font-semibold">Messages</h1>
          </div>
          <div className="divide-y divide-gray-200">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {conversation.buyer_name?.charAt(0) || 'B'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                          {conversation.buyer_name}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {conversation.last_message_at
                            ? formatDistanceToNow(new Date(conversation.last_message_at), {
                                addSuffix: true,
                              })
                            : ''}
                        </p>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            )}
          </div>
        </div>

        {/* Right column - Chat area */}
        <div className={`${!isMobile || !showConversationList ? 'flex' : 'hidden'} flex-1 flex-col bg-white border-l border-gray-200`}>
          {selectedConversation ? (
            <>
              <div className="p-3 md:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center">
                  {isMobile && (
                    <button 
                      onClick={() => setShowConversationList(true)}
                      className="mr-2 p-1 rounded-full hover:bg-gray-100"
                      aria-label="Back to conversations"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                    {getSelectedConversation()?.buyer_name?.charAt(0) || 'B'}
                  </div>
                  <div className="truncate">
                    <h2 className="text-base md:text-lg font-medium truncate">
                      {getSelectedConversation()?.buyer_name || 'Buyer'}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_sender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] md:max-w-md px-3 py-2 rounded-lg text-sm md:text-base ${
                          message.is_sender
                            ? 'bg-blue-600 text-white rounded-bl-none'
                            : 'bg-gray-100 text-gray-800 rounded-br-none'
                        }`}
                      >
                        <p>{message.message_content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.is_sender ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 text-sm md:text-base"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                  />
                  <Button 
                    type="submit" 
                    size={isMobile ? 'icon' : 'default'}
                    className="h-10 w-10 md:w-auto md:px-4"
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isMobile ? (
                      <Send className="h-5 w-5" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 px-4 text-center">
              {conversations.length === 0 
                ? 'Start a new conversation' 
                : isMobile 
                  ? 'Select a conversation to start chatting' 
                  : 'Select a conversation from the list to start chatting'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}