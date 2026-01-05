class CreateInterests < ActiveRecord::Migration[7.2]
  def change
    create_table :interests do |t|
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.references :receiver, null: false, foreign_key: { to_table: :users }
      t.integer :status, default: 0

      t.timestamps
    end
    
    add_index :interests, [:sender_id, :receiver_id], unique: true
  end
end

