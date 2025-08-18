'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type Conversation = {
  id: string;
  buyer_id: string;
  buyer_name: string | null;
  buyer_avatar: string | null;
  product_id: string | null;
  product_name: string | null;
  product_image: string | null | undefined;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string | null;
  message_content: string | null;
  created_at: string;
  is_sender: boolean;
};

export async function getConversations(): Promise<{
  data: Conversation[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'User not authenticated' };
  }

  try {
    const { data: businessData, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();
    
    if (businessError || !businessData) {
      return { data: [], error: 'Failed to fetch business data' };
    }

    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        buyer_id,
        buyer:buyer_id(id, full_name),
        product_id,
        product:product_id(id, name),
        updated_at,
        messages:conversation_messages!conversation_id(
          message_content,
          created_at
        )
      `)
      .eq('seller_business_id', businessData.business_id)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      throw conversationsError;
    }
    
    if (!conversationsData || conversationsData.length === 0) {
      return { data: [], error: null };
    }

    const productIds = conversationsData
      .map(conv => conv.product_id)
      .filter((id): id is string => !!id);

    const { data: productImages, error: imagesError } = productIds.length > 0
      ? await supabase
          .from('product_files')
          .select('product_id, url')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
      : { data: null, error: null };

    if (imagesError) throw imagesError;

    const productImageMap = productImages?.reduce((acc: Record<string, string>, img: any) => {
      if (img.url && !acc[img.product_id]) {
        acc[img.product_id] = img.url;
      }
      return acc;
    }, {});

    const conversations = conversationsData.map((conv: any) => {
      const lastMessage = Array.isArray(conv.messages) && conv.messages.length > 0 
        ? conv.messages.reduce((latest: any, current: any) => 
            new Date(current.created_at) > new Date(latest?.created_at || 0) ? current : latest
          )
        : null;
      
      return {
        id: conv.id,
        buyer_id: conv.buyer_id,
        buyer_name: conv.buyer?.full_name || 'Unknown Buyer',
        buyer_avatar: null,
        product_id: conv.product_id,
        product_name: conv.product?.name,
        product_image: conv.product_id ? productImageMap?.[conv.product_id] : null,
        last_message: lastMessage?.message_content || 'No messages yet',
        last_message_at: lastMessage?.created_at || conv.updated_at,
        unread_count: 0
      };
    });

    return { data: conversations, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: [], error: 'Failed to fetch conversations' };
  }
}

export async function getMessages(conversationId: string): Promise<{
  data: Message[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'User not authenticated' };
  }

  try {
    // Get the current user's business ID
    const { data: businessData, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !businessData) {
      return { data: [], error: 'User is not associated with a business' };
    }

    // Get the conversation to check the seller_business_id
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('seller_business_id, buyer_id')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;
    if (!conversation) {
      return { data: [], error: 'Conversation not found' };
    }

    // Get messages with sender info
    const { data, error } = await supabase
      .from('conversation_messages')
      .select(`
        *,
        sender:users!sender_id(id, full_name, email)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process messages to determine if sender is the current user (seller)
    const messages = data.map((msg: any) => {
      const isSender = msg.sender_id === user.id;
      const isFromSeller = msg.sender_id === user.id && 
                         businessData.business_id === conversation.seller_business_id;
      
      return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_name: isSender ? 'You' : (msg.sender?.full_name || 'Buyer'),
        message_content: msg.message_content,
        created_at: msg.created_at,
        is_sender: isFromSeller
      };
    });

    return { data: messages, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: [], error: 'Failed to fetch messages' };
  }
}

export async function sendMessage(
  conversationId: string,
  message: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'User not authenticated' };
  }

  try {
    // Get the current user's business ID
    const { data: businessData, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !businessData) {
      return { error: 'User is not associated with a business' };
    }

    // Get the conversation to verify the seller_business_id
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('seller_business_id')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    // Verify the user is part of the seller's business
    if (businessData.business_id !== conversation?.seller_business_id) {
      return { error: 'Unauthorized to send message in this conversation' };
    }

    // Insert the new message with the user's ID as sender_id
    const { error } = await supabase
      .from('conversation_messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.id, // Use user's ID as sender_id
          message_content: message,
          message_type: 'text'
        }
      ]);

    if (error) throw error;

    // Update the conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    revalidatePath('/enquiries');
    return { error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Failed to send message' };
  }
}
