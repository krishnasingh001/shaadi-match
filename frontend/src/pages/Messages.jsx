import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data || []);
      if (response.data?.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const response = await api.get(`/conversations/${selectedConversation.id}/messages`);
      setMessages(response.data.reverse() || []);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.post(`/conversations/${selectedConversation.id}/messages`, {
        body: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getOtherUser = (conversation) => {
    return conversation.sender_id === user.id ? conversation.receiver : conversation.sender;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Conversations</h2>
              <div className="space-y-2">
                {conversations.length > 0 ? (
                  conversations.map((conv) => {
                    const otherUser = getOtherUser(conv);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedConversation?.id === conv.id
                            ? 'bg-pink-100 border-2 border-pink-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <p className="font-semibold">{otherUser.email}</p>
                        {conv.messages?.[0] && (
                          <p className="text-sm text-gray-600 truncate">
                            {conv.messages[0].body}
                          </p>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-600">No conversations yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="card flex flex-col h-[600px]">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-semibold">
                    {getOtherUser(selectedConversation).email}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.user_id === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.user_id === user.id
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.body}</p>
                          <p className={`text-xs mt-1 ${
                            message.user_id === user.id ? 'text-pink-100' : 'text-gray-600'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-600">No messages yet. Start the conversation!</p>
                  )}
                </div>

                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary">
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

