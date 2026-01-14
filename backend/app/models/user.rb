class User < ApplicationRecord
  has_secure_password
  
  has_one :profile, dependent: :destroy
  has_one :partner_preference, dependent: :destroy
  has_many :sent_interests, class_name: 'Interest', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_interests, class_name: 'Interest', foreign_key: 'receiver_id', dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorite_users, through: :favorites, source: :favorite_user
  has_many :sent_conversations, class_name: 'Conversation', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_conversations, class_name: 'Conversation', foreign_key: 'receiver_id', dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :subscriptions, dependent: :destroy
  
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  
  enum :role, { user: 0, admin: 1 }
  enum :email_verified, { unverified: 0, verified: 1 }
  
  before_create :generate_email_verification_token
  
  def generate_jwt
    secret = Rails.application.credentials.secret_key_base || 
             Rails.application.secret_key_base || 
             ENV['SECRET_KEY_BASE'] ||
             'development_secret_key_change_in_production'
    JWT.encode({ user_id: id, exp: 30.days.from_now.to_i }, secret)
  end
  
  def verified?
    email_verified == 'verified'
  end
  
  def conversations
    Conversation.where("sender_id = ? OR receiver_id = ?", id, id)
  end
  
  # Check if user is active (active within last 5 minutes)
  def active?
    return false unless last_seen_at
    last_seen_at > 5.minutes.ago
  end
  
  private
  
  def generate_email_verification_token
    self.email_verification_token = SecureRandom.hex(32)
  end
end

