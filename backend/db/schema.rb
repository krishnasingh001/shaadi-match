# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 8) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "conversations", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "receiver_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["receiver_id"], name: "index_conversations_on_receiver_id"
    t.index ["sender_id", "receiver_id"], name: "index_conversations_on_sender_id_and_receiver_id", unique: true
    t.index ["sender_id"], name: "index_conversations_on_sender_id"
  end

  create_table "favorites", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "favorite_user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["favorite_user_id"], name: "index_favorites_on_favorite_user_id"
    t.index ["user_id", "favorite_user_id"], name: "index_favorites_on_user_id_and_favorite_user_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "interests", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "receiver_id", null: false
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["receiver_id"], name: "index_interests_on_receiver_id"
    t.index ["sender_id", "receiver_id"], name: "index_interests_on_sender_id_and_receiver_id", unique: true
    t.index ["sender_id"], name: "index_interests_on_sender_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.bigint "user_id", null: false
    t.text "body", null: false
    t.boolean "read", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "partner_preferences", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "min_age", null: false
    t.integer "max_age", null: false
    t.decimal "min_height", null: false
    t.decimal "max_height", null: false
    t.string "religion"
    t.string "caste"
    t.string "education"
    t.string "profession"
    t.string "city"
    t.string "state"
    t.string "marital_status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_partner_preferences_on_user_id"
  end

  create_table "profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "first_name", null: false
    t.string "last_name"
    t.date "date_of_birth", null: false
    t.string "gender", null: false
    t.decimal "height", null: false
    t.string "religion", null: false
    t.string "caste", null: false
    t.string "sub_caste"
    t.integer "marital_status", default: 0
    t.integer "diet", default: 0
    t.integer "drinking", default: 0
    t.integer "smoking", default: 0
    t.string "education", null: false
    t.string "profession", null: false
    t.decimal "annual_income"
    t.string "city", null: false
    t.string "state", null: false
    t.string "country", default: "India", null: false
    t.text "about_me"
    t.text "family_details"
    t.string "father_name"
    t.string "mother_name"
    t.string "siblings"
    t.string "native_place"
    t.string "languages_spoken"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "plan_type", null: false
    t.integer "status", default: 0
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.string "payment_id"
    t.decimal "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_subscriptions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.integer "role", default: 0
    t.integer "email_verified", default: 0
    t.string "email_verification_token"
    t.datetime "email_verified_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "conversations", "users", column: "receiver_id"
  add_foreign_key "conversations", "users", column: "sender_id"
  add_foreign_key "favorites", "users"
  add_foreign_key "favorites", "users", column: "favorite_user_id"
  add_foreign_key "interests", "users", column: "receiver_id"
  add_foreign_key "interests", "users", column: "sender_id"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users"
  add_foreign_key "partner_preferences", "users"
  add_foreign_key "profiles", "users"
  add_foreign_key "subscriptions", "users"
end
