class Interest < ApplicationRecord
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  
  validates :sender_id, uniqueness: { scope: :receiver_id }
  validate :cannot_interest_self
  
  enum status: { pending: 0, accepted: 1, rejected: 2 }
  
  private
  
  def cannot_interest_self
    errors.add(:receiver_id, "cannot be yourself") if sender_id == receiver_id
  end
end

