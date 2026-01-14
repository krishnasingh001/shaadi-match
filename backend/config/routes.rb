Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Authentication
      post 'signup', to: 'auth#signup'
      post 'login', to: 'auth#login'
      delete 'logout', to: 'auth#logout'
      post 'password/reset', to: 'auth#reset_password'
      
      # Users
      get 'users/profile', to: 'users#current_profile'
      get 'users/current', to: 'users#current_user_info'
      resources :users, only: [:show, :update] do
        member do
          post 'profile_picture', to: 'users#upload_profile_picture'
          get 'profile', to: 'users#profile'
        end
      end
      
      # Profiles
      patch 'profiles/current', to: 'profiles#update_current'
      put 'profiles/current', to: 'profiles#update_current'
      post 'profiles/current/photos', to: 'profiles#upload_photos'
      delete 'profiles/current/photos/:photo_id', to: 'profiles#delete_photo'
      resources :profiles, only: [:show, :create, :update]
      
      # Partner Preferences
      resources :partner_preferences, only: [:show, :create, :update]
      
      # Search & Matching
      get 'search', to: 'search#index'
      get 'matches', to: 'matches#index'
      get 'matches/suggested', to: 'matches#suggested'
      
      # Interests
      resources :interests, only: [:create, :index, :update, :destroy] do
        member do
          patch 'accept', to: 'interests#accept'
          patch 'reject', to: 'interests#reject'
        end
      end
      
      # Favorites
      resources :favorites, only: [:create, :index, :destroy]
      
      # Messages
      resources :conversations, only: [:index, :show, :create] do
        resources :messages, only: [:index, :create]
        collection do
          get 'connections', to: 'conversations#connections'
        end
      end
      
      # Subscriptions
      resources :subscriptions, only: [:index, :create, :show]
      post 'subscriptions/webhook', to: 'subscriptions#webhook'
      
      # Admin
      namespace :admin do
        resources :users, only: [:index, :show, :update, :destroy]
        resources :subscriptions, only: [:index, :show], controller: 'subscriptions'
        get 'dashboard', to: 'dashboard#index'
      end
    end
  end
end

