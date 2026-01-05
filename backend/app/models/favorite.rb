class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :favorite_user, class_name: 'User'
  
  validates :user_id, uniqueness: { scope: :favorite_user_id }
  validate :cannot_favorite_self
  validate :cannot_duplicate_favorite
  
  private
  
  def cannot_favorite_self
    errors.add(:favorite_user_id, "cannot be yourself") if user_id == favorite_user_id
  end
  
  def cannot_duplicate_favorite
    if Favorite.exists?(user_id: user_id, favorite_user_id: favorite_user_id)
      errors.add(:favorite_user_id, "already in favorites")
    end
  end
end

