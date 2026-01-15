class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :actor, class_name: 'User', optional: true
  belongs_to :notifiable, polymorphic: true, optional: true

  validates :notification_type, presence: true
  validates :title, presence: true
  validates :message, presence: true

  scope :unread, -> { where(read: false) }
  scope :read, -> { where(read: true) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(notification_type: type) }

  def mark_as_read!
    update(read: true)
  end

  def self.create_for_interest(interest)
    receiver = interest.receiver
    sender = interest.sender
    sender_name = sender.profile&.full_name || sender.email.split('@').first

    create!(
      user: receiver,
      actor: sender,
      notifiable: interest,
      notification_type: 'interest_received',
      title: 'New Connection Request',
      message: "#{sender_name} sent you a connection request",
      metadata: {
        interest_id: interest.id,
        sender_id: sender.id,
        sender_name: sender_name
      }
    )
  end

  def self.create_for_interest_accepted(interest)
    sender = interest.sender
    receiver = interest.receiver
    receiver_name = receiver.profile&.full_name || receiver.email.split('@').first

    create!(
      user: sender,
      actor: receiver,
      notifiable: interest,
      notification_type: 'interest_accepted',
      title: 'Connection Request Accepted',
      message: "#{receiver_name} accepted your connection request",
      metadata: {
        interest_id: interest.id,
        receiver_id: receiver.id,
        receiver_name: receiver_name
      }
    )
  end

  def self.create_for_favorite(favorite)
    favorite_user = favorite.favorite_user
    user = favorite.user
    user_name = user.profile&.full_name || user.email.split('@').first

    create!(
      user: favorite_user,
      actor: user,
      notifiable: favorite,
      notification_type: 'favorited',
      title: 'Added to Favorites',
      message: "#{user_name} added you to their favorites",
      metadata: {
        favorite_id: favorite.id,
        user_id: user.id,
        user_name: user_name
      }
    )
  end

  def self.create_for_message(message)
    conversation = message.conversation
    sender = message.user
    receiver = conversation.sender == sender ? conversation.receiver : conversation.sender
    
    sender_name = sender.profile&.full_name || sender.email.split('@').first

    create!(
      user: receiver,
      actor: sender,
      notifiable: message,
      notification_type: 'new_message',
      title: 'New Message',
      message: "#{sender_name}: #{message.body.truncate(50)}",
      metadata: {
        message_id: message.id,
        conversation_id: conversation.id,
        sender_id: sender.id,
        sender_name: sender_name
      }
    )
  end
end

