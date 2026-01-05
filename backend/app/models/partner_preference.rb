class PartnerPreference < ApplicationRecord
  belongs_to :user
  
  validates :min_age, presence: true, numericality: { greater_than: 0, less_than: :max_age }
  validates :max_age, presence: true, numericality: { greater_than: :min_age }
  validates :min_height, presence: true, numericality: { greater_than: 0, less_than: :max_height }
  validates :max_height, presence: true, numericality: { greater_than: :min_height }
end

