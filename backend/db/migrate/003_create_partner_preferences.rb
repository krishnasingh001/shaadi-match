class CreatePartnerPreferences < ActiveRecord::Migration[7.2]
  def change
    create_table :partner_preferences do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :min_age, null: false
      t.integer :max_age, null: false
      t.decimal :min_height, null: false
      t.decimal :max_height, null: false
      t.string :religion
      t.string :caste
      t.string :education
      t.string :profession
      t.string :city
      t.string :state
      t.string :marital_status

      t.timestamps
    end
  end
end

