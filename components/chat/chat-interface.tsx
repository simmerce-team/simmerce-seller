'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Check, CheckCheck, MapPin, MoreVertical, Paperclip, Phone, Search, Send, Smile, Star, Video } from 'lucide-react';
import { useState } from 'react';

// Mock data for conversations
const conversations = [
  {
    id: 1,
    name: "Delhi Graphs & Charts",
    location: "Ghaziabad, Uttar Pradesh",
    lastMessage: "Hi Aniket, we can deliver paper tub You can con",
    time: "1:16 PM",
    unread: 2,
    verified: true,
    rating: 3.7,
    responseRate: "78%",
    avatar: "/api/placeholder/40/40",
    status: "online",
    inquiry: "Paper Tub"
  },
  {
    id: 2,
    name: "Huma Marketing Pvt. Ltd.",
    location: "Ahmedabad, Gujarat",
    lastMessage: "I viewed your 'Catalog Page'",
    time: "Yesterday",
    unread: 0,
    verified: true,
    rating: 4.2,
    responseRate: "85%",
    avatar: "/api/placeholder/40/40",
    status: "offline",
    inquiry: "Industrial Equipment"
  },
  {
    id: 3,
    name: "D G S Paper Products",
    location: "Pune, Maharashtra",
    lastMessage: "IndiaMART connected you with this seller",
    time: "22/07/2025",
    unread: 0,
    verified: true,
    rating: 4.5,
    responseRate: "92%",
    avatar: "/api/placeholder/40/40",
    status: "online",
    inquiry: "Paper Products"
  },
  {
    id: 4,
    name: "Vedant Agro Foods",
    location: "Pune, Maharashtra",
    lastMessage: "Please find the catalog link: https://www.vedante",
    time: "20/07/2025",
    unread: 1,
    verified: false,
    rating: 3.9,
    responseRate: "65%",
    avatar: "/api/placeholder/40/40",
    status: "offline",
    inquiry: "Food Products"
  },
  {
    id: 5,
    name: "Navnath Spices Private Limited",
    location: "Dhule, Maharashtra",
    lastMessage: "You have sent an enquiry to this seller",
    time: "18/07/2025",
    unread: 0,
    verified: true,
    rating: 4.1,
    responseRate: "88%",
    avatar: "/api/placeholder/40/40",
    status: "online",
    inquiry: "Spices & Seasonings"
  }
];

// Mock messages for active conversation
const messages = [
  {
    id: 1,
    type: 'system',
    content: 'You visited this seller\'s catalog',
    time: '23 Jul 2025, 1:16 PM'
  },
  {
    id: 2,
    type: 'received',
    content: 'Hi Aniket, we can deliver paper tub You can contact us at delhigraphscharts@yahoo.com or call us on 08046050187.',
    time: '23 Jul 2025, 1:16 PM',
    status: 'delivered'
  },
  {
    id: 3,
    type: 'received',
    content: 'Please find the catalog link: https://www.delhigraphs.in/',
    time: '23 Jul 2025, 1:16 PM',
    status: 'delivered'
  },
  {
    id: 4,
    type: 'system',
    content: 'Close this Requirement',
    time: '23 Jul 2025, 1:16 PM',
    actionable: true
  },
];

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.inquiry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      setMessageText('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] bg-slate-50">
      {/* Sidebar - Conversations List */}
      <div className="w-100 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-medium text-slate-800 mb-3 tracking-tight">Messages</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 border-slate-200 focus:border-red-300 focus:ring-red-100 text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-3 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
                selectedConversation.id === conversation.id ? 'bg-red-50 border-l-4 border-l-red-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
                      {conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    conversation.status === 'online' ? 'bg-green-500' : 'bg-slate-300'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-slate-800 truncate text-sm">{conversation.name}</h3>
                      {conversation.verified && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-1 py-0.5 text-[10px]">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{conversation.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-500 truncate">{conversation.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-slate-600">{conversation.rating}</span>
                    </div>
                    <span className="text-xs text-slate-500">{conversation.responseRate}</span>
                  </div>
                  
                  <p className="text-xs text-slate-600 truncate mb-2 leading-relaxed">{conversation.lastMessage}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs text-slate-600 px-1.5 py-0.5">
                      {conversation.inquiry}
                    </Badge>
                    {conversation.unread > 0 && (
                      <Badge className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
                    {selectedConversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  selectedConversation.status === 'online' ? 'bg-green-500' : 'bg-slate-300'
                }`} />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-slate-800 text-sm">{selectedConversation.name}</h2>
                  {selectedConversation.verified && (
                    <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5">
                      <Building2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedConversation.location}</span>
                  <span>•</span>
                  <span className={selectedConversation.status === 'online' ? 'text-green-600' : 'text-slate-500'}>
                    {selectedConversation.status === 'online' ? 'Online' : 'Last seen recently'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Phone className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Video className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'system' && (
                <div className="flex justify-center">
                  <div className={`px-3 py-1.5 rounded-full text-xs ${
                    message.actionable 
                      ? 'bg-red-100 text-red-700 border border-red-200 cursor-pointer hover:bg-red-200 transition-colors'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {message.content}
                  </div>
                </div>
              )}
              
              {message.type === 'received' && (
                <div className="flex items-start gap-2.5">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                      {selectedConversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-md">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md p-2.5">
                      <p className="text-slate-800 text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-1">
                      <span className="text-xs text-slate-500">{message.time}</span>
                      {message.status && (
                        <div className="text-slate-400">
                          {message.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {message.type === 'sent' && (
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="flex-1 flex justify-end max-w-md">
                    <div className="bg-red-600 text-white rounded-2xl rounded-tr-md p-2.5">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-slate-200 p-3">
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-10 h-9 border-slate-200 focus:border-red-300 focus:ring-red-100 text-sm"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <Smile className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-red-600 hover:bg-red-700 text-white h-9 px-3 flex-shrink-0 text-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          <div className="mt-1.5 text-xs text-slate-500 text-center">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
