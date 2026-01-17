import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

// Available profile images
const PROFILE_IMAGES = [
  '/images/image1.jpg',
  '/images/image2.jpg',
  '/images/image3.jpg',
  '/images/image4.avif',
  '/images/image5.avif',
  '/images/image6.avif',
  '/images/image7.avif',
  '/images/image8.avif',
  '/images/image9.avif',
  '/images/image10.avif',
  '/images/image11.avif',
  '/images/image12.avif',
  '/images/image13.avif',
  '/images/image14.avif',
];

// Helper function to get image for profile
const getProfileImage = (profile) => {
  if (profile?.profile_picture_url) {
    return profile.profile_picture_url;
  }
  const imageIndex = (profile?.user_id || profile?.id || 0) % PROFILE_IMAGES.length;
  return PROFILE_IMAGES[imageIndex];
};

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'connections'
  const [lastMessageId, setLastMessageId] = useState(null); // Track last message ID for polling
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const userScrolledUpRef = useRef(false); // Track if user manually scrolled up
  const isUserMessageRef = useRef(false); // Track if the message update is from user action
  const emojiPickerRef = useRef(null);
  const messageInputRef = useRef(null);

  // Check if user is at the bottom of the chat (more strict)
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 50; // 50px threshold - more strict
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= threshold;
  };

  // Auto-scroll to bottom - only when explicitly needed
  const scrollToBottom = (force = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (force) {
      // Force scroll (user sent message) - use scrollTop to avoid page scroll
      userScrolledUpRef.current = false;
      // Use requestAnimationFrame for smooth scroll without affecting page
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    } else if (isAtBottom() && !userScrolledUpRef.current) {
      // Only auto-scroll if user is at bottom and hasn't scrolled up
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  // Track user scroll behavior
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // If user scrolls up, mark that they're reading older messages
      if (!isAtBottom()) {
        userScrolledUpRef.current = true;
      } else {
        // If user scrolls back to bottom, allow auto-scroll again
        userScrolledUpRef.current = false;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedConversation]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('[data-emoji-button]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  // Handle emoji selection
  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setNewMessage(prev => prev + emoji);
    // Focus back on input after selecting emoji
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchConnections();
    
    // Check if there's a conversation ID in URL params
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      // Find and select the conversation
      fetchConversations().then(() => {
        const conv = conversations.find(c => c.id === parseInt(conversationId));
        if (conv) {
          setSelectedConversation(conv);
          setActiveTab('conversations');
        }
      });
    }

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Reset scroll state when switching conversations
      userScrolledUpRef.current = false;
      isUserMessageRef.current = false;
      
      fetchMessages();
      
      // Start polling for new messages every 2 seconds
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(() => {
        pollForNewMessages();
      }, 2000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [selectedConversation]);

  // Scroll to bottom only when conversation changes (initial load)
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && isUserMessageRef.current === false) {
      // Only scroll on initial load
      setTimeout(() => {
        scrollToBottom(true);
      }, 150);
    }
    // Reset flag after initial scroll
    if (messages.length > 0) {
      isUserMessageRef.current = false;
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      const convs = response.data || [];
      setConversations(convs);
      
      // If there's a conversation ID in URL, select it
      const conversationId = searchParams.get('conversation');
      if (conversationId && !selectedConversation) {
        const conv = convs.find(c => c.id === parseInt(conversationId));
        if (conv) {
          setSelectedConversation(conv);
        }
      } else if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await api.get('/conversations/connections');
      setConnections(response.data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const response = await api.get(`/conversations/${selectedConversation.id}/messages`);
      const fetchedMessages = response.data.reverse() || [];
      setMessages(fetchedMessages);
      
      // Update last message ID for polling
      if (fetchedMessages.length > 0) {
        setLastMessageId(fetchedMessages[fetchedMessages.length - 1].id);
      }
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  // Poll for new messages (only fetch if there are new ones)
  const pollForNewMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await api.get(`/conversations/${selectedConversation.id}/messages`);
      const fetchedMessages = response.data.reverse() || [];
      
      // Check if there are new messages
      if (fetchedMessages.length > 0) {
        const latestMessageId = fetchedMessages[fetchedMessages.length - 1].id;
        
        if (lastMessageId === null || latestMessageId !== lastMessageId) {
          // Check if user is at bottom BEFORE updating messages
          const wasAtBottom = isAtBottom() && !userScrolledUpRef.current;
          
          setMessages(fetchedMessages);
          setLastMessageId(latestMessageId);
          
          // Only scroll if user was at bottom AND hasn't scrolled up
          // Never force scroll on polling - only gentle auto-scroll if user is already at bottom
          if (wasAtBottom) {
            setTimeout(() => {
              scrollToBottom(false); // Not forced - will check again
            }, 100);
          }
          
          // Update conversation list to show latest message
          updateConversationList();
        }
      }
    } catch (error) {
      // Silently fail for polling - don't show error toast
      console.error('Error polling messages:', error);
    }
  };

  // Update conversation list with latest messages
  const updateConversationList = async () => {
    try {
      const response = await api.get('/conversations');
      const updatedConvs = response.data || [];
      setConversations(updatedConvs);
      
      // Update selected conversation if it exists in the new list
      if (selectedConversation) {
        const updatedConv = updatedConvs.find(c => c.id === selectedConversation.id);
        if (updatedConv) {
          setSelectedConversation(updatedConv);
        }
      }
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Error updating conversations:', error);
    }
  };

  const startConversation = async (userId) => {
    try {
      const response = await api.post('/conversations', { receiver_id: userId });
      const newConversationId = response.data.id;
      
      // Fetch updated conversations list
      const convsResponse = await api.get('/conversations');
      const convs = convsResponse.data || [];
      setConversations(convs);
      
      // Find and select the new conversation
      const newConv = convs.find(c => c.id === newConversationId);
      if (newConv) {
        setSelectedConversation(newConv);
      } else if (convs.length > 0) {
        setSelectedConversation(convs[0]);
      }
      
      setActiveTab('conversations');
      toast.success('Conversation started!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0] || 'Failed to start conversation';
      if (errorMessage.includes('Interest request must be accepted')) {
        toast.error('Interest request must be accepted before you can start a conversation');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setShowEmojiPicker(false); // Close emoji picker when sending

    // Optimistic update - add message immediately to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      body: messageText,
      user_id: user.id,
      created_at: new Date().toISOString(),
      isOptimistic: true, // Flag to identify optimistic messages
    };

    // Mark that this is a user-initiated message
    isUserMessageRef.current = true;
    userScrolledUpRef.current = false; // Reset scroll state when user sends
    
    setMessages(prev => [...prev, tempMessage]);
    // Always scroll when user sends a message
    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    try {
      const response = await api.post(`/conversations/${selectedConversation.id}/messages`, {
        body: messageText
      });
      
      // Replace optimistic message with real one
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempMessage.id);
        return [...filtered, response.data];
      });
      
      // Update last message ID
      setLastMessageId(response.data.id);
      
      // Update conversation list
      updateConversationList();
      
      // Always scroll after sending message (user action)
      setTimeout(() => {
        scrollToBottom(true);
      }, 50);
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      toast.error('Failed to send message');
    }
  };

  const getOtherUser = (conversation) => {
    return conversation.sender_id === user.id ? conversation.receiver : conversation.sender;
  };

  const getOtherUserProfile = (conversation) => {
    return conversation.other_user_profile || null;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Chat with your connections</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'conversations'
                      ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Conversations
                  {conversations.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs">
                      {conversations.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('connections')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'connections'
                      ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Connections
                  {connections.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {connections.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {activeTab === 'conversations' ? (
                  <div className="divide-y divide-gray-100">
                    {conversations.length > 0 ? (
                      conversations.map((conv) => {
                        const otherUser = getOtherUser(conv);
                        const profile = getOtherUserProfile(conv);
                        const lastMessage = conv.messages?.[0];
                        const isSelected = selectedConversation?.id === conv.id;
                        
                        return (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={profile ? getProfileImage(profile) : '/images/default-avatar.png'}
                                  alt={profile?.full_name || otherUser.email}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E';
                                  }}
                                />
                                {conv.other_user_active && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {profile?.full_name || otherUser.email}
                                  </p>
                                  {lastMessage && (
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                      {formatTime(lastMessage.created_at)}
                                    </span>
                                  )}
                                </div>
                                {lastMessage ? (
                                  <p className="text-sm text-gray-600 truncate">
                                    {lastMessage.body}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No messages yet</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-gray-600 text-sm">No conversations yet</p>
                        <p className="text-gray-400 text-xs mt-1">Start chatting with your connections</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {connections.length > 0 ? (
                      connections.map((connection) => {
                        const profile = connection.profile;
                        
                        return (
                          <div
                            key={connection.user_id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="relative">
                                <img
                                  src={profile ? getProfileImage(profile) : '/images/default-avatar.png'}
                                  alt={profile?.full_name || connection.email}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E';
                                  }}
                                />
                                {connection.is_active && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {profile?.full_name || connection.email}
                                </p>
                                {profile && (
                                  <p className="text-xs text-gray-500">
                                    {profile.age} years • {profile.city || 'Location not set'}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startConversation(connection.user_id)}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
                              >
                                Start Chat
                              </button>
                              <Link
                                to={`/profile/${connection.user_id}`}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-4xl mb-3">👥</div>
                        <p className="text-gray-600 text-sm">No new connections</p>
                        <p className="text-gray-400 text-xs mt-1">Accept interests to start conversations</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`lg:col-span-2 ${selectedConversation ? 'block' : 'hidden lg:block'}`}>
            {selectedConversation ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={getOtherUserProfile(selectedConversation) ? getProfileImage(getOtherUserProfile(selectedConversation)) : '/images/default-avatar.png'}
                        alt={getOtherUser(selectedConversation).email}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E';
                        }}
                      />
                      {selectedConversation.other_user_active && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                          {getOtherUserProfile(selectedConversation)?.full_name || getOtherUser(selectedConversation).email}
                        </h2>
                        {selectedConversation.other_user_active && (
                          <span className="text-xs text-green-600 font-medium">Active now</span>
                        )}
                      </div>
                      {getOtherUserProfile(selectedConversation) && (
                        <p className="text-xs text-gray-500">
                          {getOtherUserProfile(selectedConversation).age} years • {getOtherUserProfile(selectedConversation).city || 'Location not set'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <Link
                      to={`/profile/${getOtherUser(selectedConversation).id}`}
                      className="hidden lg:block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                >
                  {messages.length > 0 ? (
                    <>
                      {messages.map((message) => {
                        const isOwn = message.user_id === user.id;
                        const isOptimistic = message.isOptimistic;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-sm ${
                                isOwn
                                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              } ${isOptimistic ? 'opacity-70' : ''}`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed" style={{ wordBreak: 'break-word' }}>
                                {message.body}
                              </p>
                              <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                                isOwn ? 'text-pink-100' : 'text-gray-500'
                              }`}>
                                {isOptimistic ? (
                                  <>
                                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  formatTime(message.created_at)
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">💭</div>
                      <p className="text-gray-600 font-medium">No messages yet</p>
                      <p className="text-gray-400 text-sm mt-1">Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white relative">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute bottom-full right-4 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-200"
                    >
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme="light"
                        width={350}
                        height={400}
                        previewConfig={{
                          showPreview: false
                        }}
                        skinTonesDisabled
                        searchDisabled={false}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2 items-end">
                    {/* Emoji Button */}
                    <button
                      type="button"
                      data-emoji-button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                        showEmojiPicker 
                          ? 'bg-pink-100 text-pink-600' 
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                      aria-label="Add emoji"
                    >
                      <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                    </button>
                    
                    {/* Message Input */}
                    <div className="flex-1 relative">
                      <input
                        ref={messageInputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onFocus={() => setShowEmojiPicker(false)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        maxLength={1000}
                      />
                      {newMessage.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setNewMessage('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                          aria-label="Clear message"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center gap-2"
                    >
                      <span>Send</span>
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Character Count (optional, for long messages) */}
                  {newMessage.length > 800 && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {newMessage.length} / 1000
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-600 text-lg font-medium mb-2">Select a conversation</p>
                  <p className="text-gray-400 text-sm">Choose a conversation from the list or start a new one with your connections</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
