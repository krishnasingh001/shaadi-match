import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const dropdownRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Group notifications by actor and type (especially for messages)
  const groupNotifications = useCallback((notifications) => {
    const grouped = [];
    const messageGroups = {}; // Group messages from same user
    
    notifications.forEach(notification => {
      // Group messages from the same user (only unread ones to keep it clean)
      if (notification.notification_type === 'new_message' && notification.actor?.id) {
        const key = `message-${notification.actor.id}`;
        if (!messageGroups[key]) {
          messageGroups[key] = {
            ...notification,
            groupedCount: 1,
            groupedMessages: [notification],
            latestMessage: notification,
            isGrouped: true,
            // Use the first notification's ID as the group ID for dismissal
            groupId: notification.id
          };
        } else {
          messageGroups[key].groupedCount += 1;
          messageGroups[key].groupedMessages.push(notification);
          // Keep the latest message
          if (new Date(notification.created_at) > new Date(messageGroups[key].latestMessage.created_at)) {
            messageGroups[key].latestMessage = notification;
          }
          // Update title and message for grouped notification
          const senderName = notification.actor?.name || 'Someone';
          messageGroups[key].title = `${messageGroups[key].groupedCount} new messages`;
          messageGroups[key].message = `${senderName}: ${notification.message}`;
          messageGroups[key].created_at = notification.created_at; // Use latest timestamp
          // If any in group is unread, mark as unread
          if (!notification.read) {
            messageGroups[key].read = false;
          }
        }
      } else {
        // For non-message notifications, add directly
        grouped.push(notification);
      }
    });
    
    // Add grouped messages
    Object.values(messageGroups).forEach(group => {
      grouped.push(group);
    });
    
    // Sort by created_at (newest first)
    return grouped.sort((a, b) => {
      const dateA = new Date(a.created_at || a.latestMessage?.created_at);
      const dateB = new Date(b.created_at || b.latestMessage?.created_at);
      return dateB - dateA;
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/notifications');
      const rawNotifications = response.data.notifications || [];
      // Group notifications before setting state
      const grouped = groupNotifications(rawNotifications);
      setNotifications(grouped);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user, groupNotifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 5000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [user, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark_as_read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const dismissNotification = async (e, notification) => {
    e.stopPropagation(); // Prevent notification click
    
    // If it's a grouped notification, dismiss all notifications in the group
    const notificationIds = notification.isGrouped && notification.groupedMessages
      ? notification.groupedMessages.map(n => n.id)
      : [notification.id];
    
    // Optimistic update - remove immediately
    const notificationToRemove = notifications.find(n => n.id === notification.id);
    const unreadCountInGroup = notification.isGrouped 
      ? notification.groupedMessages.filter(n => !n.read).length 
      : (!notification.read ? 1 : 0);
    
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setUnreadCount(prev => Math.max(0, prev - unreadCountInGroup));
    
    try {
      // Delete all notifications in the group
      await Promise.all(notificationIds.map(id => api.delete(`/notifications/${id}`)));
      // Refresh to get accurate unread count
      setTimeout(() => {
        fetchNotifications();
      }, 300);
    } catch (error) {
      // Restore on error
      if (notificationToRemove) {
        setNotifications(prev => {
          const restored = [...prev, notificationToRemove];
          return restored.sort((a, b) => {
            const dateA = new Date(a.created_at || a.latestMessage?.created_at);
            const dateB = new Date(b.created_at || b.latestMessage?.created_at);
            return dateB - dateA;
          });
        });
        setUnreadCount(prev => prev + unreadCountInGroup);
      }
      toast.error('Failed to dismiss notification');
    }
  };

  const handleAcceptInterest = async (e, notification) => {
    e.stopPropagation(); // Prevent notification click
    const interestId = notification.metadata?.interest_id;
    if (!interestId) return;

    setActionLoading(prev => ({ ...prev, [`accept-${notification.id}`]: true }));
    
    try {
      await api.patch(`/interests/${interestId}/accept`);
      
      // Mark notification as read on backend
      try {
        await api.post(`/notifications/${notification.id}/mark_as_read`);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
      
      // Update notification state immediately
      setNotifications(prev =>
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, read: true, interest_status: 'accepted' }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Refresh notifications to get the new "accepted" notification
      setTimeout(() => {
        fetchNotifications();
      }, 500);
      
      toast.success('Connection request accepted! 🎉', {
        icon: '✅',
        duration: 2500,
      });
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to accept connection request');
      fetchNotifications();
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[`accept-${notification.id}`];
        return newState;
      });
    }
  };

  const handleRejectInterest = async (e, notification) => {
    e.stopPropagation(); // Prevent notification click
    const interestId = notification.metadata?.interest_id;
    if (!interestId) return;

    setActionLoading(prev => ({ ...prev, [`reject-${notification.id}`]: true }));
    
    try {
      await api.patch(`/interests/${interestId}/reject`);
      
      // Mark notification as read on backend
      try {
        await api.post(`/notifications/${notification.id}/mark_as_read`);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
      
      // Update notification state immediately
      setNotifications(prev =>
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, read: true, interest_status: 'rejected' }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Connection request rejected', {
        icon: '❌',
        duration: 2000,
      });
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to reject connection request');
      fetchNotifications();
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[`reject-${notification.id}`];
        return newState;
      });
    }
  };

  const handleNotificationClick = (notification) => {
    // Don't navigate for interest_received - user can use buttons instead
    if (notification.notification_type === 'interest_received') {
      return;
    }

    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.notification_type === 'interest_accepted') {
      navigate('/profile?tab=sent');
    } else if (notification.notification_type === 'favorited') {
      navigate('/favorites');
    } else if (notification.notification_type === 'new_message') {
      // For grouped messages, use the latest message's conversation ID
      const conversationId = notification.isGrouped 
        ? notification.latestMessage?.metadata?.conversation_id 
        : notification.metadata?.conversation_id;
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      } else {
        navigate('/messages');
      }
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interest_received':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case 'interest_accepted':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        );
      case 'favorited':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'new_message':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors duration-200 rounded-lg hover:bg-pink-50"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border-2 border-white shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isInterestReceived = notification.notification_type === 'interest_received';
                const isPending = isInterestReceived && 
                                  notification.interest_status !== 'accepted' && 
                                  notification.interest_status !== 'rejected';
                const showActions = isPending && !notification.read;
                
                return (
                  <div
                    key={notification.id}
                    className={`group w-full px-5 py-3.5 border-b border-gray-50 transition-all duration-200 ${
                      !notification.read ? 'bg-gradient-to-r from-pink-50/80 to-rose-50/50 hover:from-pink-50 hover:to-rose-50' : 'hover:bg-gray-50/50'
                    } ${
                      isInterestReceived && !showActions ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    onClick={() => !showActions && handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Actor Avatar */}
                      <div className="flex-shrink-0">
                        {notification.actor?.profile_picture_url ? (
                          <img
                            src={notification.actor.profile_picture_url}
                            alt={notification.actor.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {notification.actor?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 relative">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {notification.isGrouped && notification.groupedCount > 1 && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold shadow-sm flex-shrink-0">
                                  {notification.groupedCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                            )}
                            {/* Dismiss Button - Always visible */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(e, notification);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 opacity-70 hover:opacity-100 flex-shrink-0"
                              aria-label="Dismiss notification"
                              title="Dismiss"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Action Buttons - Compact One-Liner */}
                        {showActions && (
                          <div className="flex items-center gap-2 mt-2.5 mb-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleAcceptInterest(e, notification)}
                              disabled={actionLoading[`accept-${notification.id}`] || actionLoading[`reject-${notification.id}`]}
                              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                              {actionLoading[`accept-${notification.id}`] ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                  </svg>
                                  <span>Accept</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={(e) => handleRejectInterest(e, notification)}
                              disabled={actionLoading[`accept-${notification.id}`] || actionLoading[`reject-${notification.id}`]}
                              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                              {actionLoading[`reject-${notification.id}`] ? (
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span>Reject</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {/* Status Badge for Completed Actions */}
                        {isInterestReceived && !isPending && (
                          <div className="flex items-center gap-2 mt-2">
                            {notification.interest_status === 'accepted' ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                                <span>Accepted</span>
                              </div>
                            ) : notification.interest_status === 'rejected' ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Rejected</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                        
                        {/* Time and Icon */}
                        <div className="flex items-center gap-2 mt-1.5">
                          {getNotificationIcon(notification.notification_type)}
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                to="/notifications"
                className="text-sm font-semibold text-pink-600 hover:text-pink-700 text-center block"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

