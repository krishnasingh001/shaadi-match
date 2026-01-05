class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.integer :role, default: 0
      t.integer :email_verified, default: 0
      t.string :email_verification_token
      t.datetime :email_verified_at

      t.timestamps
    end
    
    add_index :users, :email, unique: true
  end
end

