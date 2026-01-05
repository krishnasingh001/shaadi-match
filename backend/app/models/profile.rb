class Profile < ApplicationRecord
  belongs_to :user
  has_one_attached :profile_picture
  has_many_attached :photos
  
  validates :first_name, presence: true
  validates :date_of_birth, presence: true
  validates :gender, presence: true, inclusion: { in: %w[male female other] }
  validates :height, presence: true, numericality: { greater_than: 0 }
  validates :religion, presence: true
  validates :caste, presence: true
  validates :education, presence: true
  validates :profession, presence: true
  validates :city, presence: true
  validates :state, presence: true
  validates :country, presence: true
  
  enum :marital_status, { never_married: 0, divorced: 1, widowed: 2, separated: 3 }, prefix: true
  enum :diet, { vegetarian: 0, non_vegetarian: 1, vegan: 2, jain: 3 }, prefix: true
  enum :drinking, { no: 0, occasionally: 1, yes: 2 }, prefix: true
  enum :smoking, { no: 0, occasionally: 1, yes: 2 }, prefix: true
  
  def age
    return nil unless date_of_birth
    today = Date.today
    age = today.year - date_of_birth.year
    age -= 1 if today < date_of_birth + age.years
    age
  end
  
  def full_name
    "#{first_name} #{last_name}".strip
  end
end

