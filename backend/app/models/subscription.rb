class Subscription < ApplicationRecord
  belongs_to :user
  
  enum plan_type: { basic: 0, premium: 1, platinum: 2 }
  enum status: { active: 0, cancelled: 1, expired: 2 }
  
  validates :plan_type, presence: true
  validates :start_date, presence: true
  validates :end_date, presence: true
  
  def active?
    status == 'active' && end_date >= Date.today
  end
end

