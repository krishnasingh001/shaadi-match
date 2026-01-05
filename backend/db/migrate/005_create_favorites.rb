class CreateFavorites < ActiveRecord::Migration[7.2]
  def change
    create_table :favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.references :favorite_user, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
    
    add_index :favorites, [:user_id, :favorite_user_id], unique: true
  end
end

