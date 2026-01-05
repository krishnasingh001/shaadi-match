class CreateSubscriptions < ActiveRecord::Migration[7.2]
  def change
    create_table :subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :plan_type, null: false
      t.integer :status, default: 0
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.string :payment_id
      t.decimal :amount

      t.timestamps
    end
  end
end

