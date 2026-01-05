class CreateProfiles < ActiveRecord::Migration[7.2]
  def change
    create_table :profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.string :first_name, null: false
      t.string :last_name
      t.date :date_of_birth, null: false
      t.string :gender, null: false
      t.decimal :height, null: false
      t.string :religion, null: false
      t.string :caste, null: false
      t.string :sub_caste
      t.integer :marital_status, default: 0
      t.integer :diet, default: 0
      t.integer :drinking, default: 0
      t.integer :smoking, default: 0
      t.string :education, null: false
      t.string :profession, null: false
      t.decimal :annual_income
      t.string :city, null: false
      t.string :state, null: false
      t.string :country, null: false, default: 'India'
      t.text :about_me
      t.text :family_details
      t.string :father_name
      t.string :mother_name
      t.string :siblings
      t.string :native_place
      t.string :languages_spoken

      t.timestamps
    end
  end
end

