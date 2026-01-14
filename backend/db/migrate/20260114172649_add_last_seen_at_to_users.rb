class AddLastSeenAtToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :last_seen_at, :datetime
  end
end
