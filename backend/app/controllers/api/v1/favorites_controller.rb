module Api
  module V1
    class FavoritesController < ApplicationController
      def create
        # Check if already favorited
        existing_favorite = current_user.favorites.find_by(favorite_user_id: params[:user_id])
        
        if existing_favorite
          render json: {
            favorite: existing_favorite.as_json(include: :favorite_user),
            message: 'Already in favorites'
          }, status: :ok
          return
        end
        
        favorite = current_user.favorites.build(favorite_user_id: params[:user_id])
        
        if favorite.save
          # Create notification for the favorited user
          Notification.create_for_favorite(favorite)
          
          user = favorite.favorite_user
          profile = user.profile
          
          # Get profile picture URL
          picture_url = nil
          if profile&.profile_picture&.attached?
            begin
              picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
            rescue
              picture_url = nil
            end
          end
          
          # Get all photos URLs
          photos_urls = []
          if profile&.photos&.attached?
            profile.photos.each do |photo|
              begin
                photos_urls << Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: false, host: request.base_url)
              rescue
                # Skip if URL generation fails
              end
            end
          end
          
          render json: favorite.as_json.merge(
            favorite_user: user.as_json.merge(
              profile: profile ? profile.as_json(methods: [:age, :full_name]).merge(
                profile_picture_url: picture_url,
                photos_urls: photos_urls,
                is_active: user.active?,
                first_name: profile.first_name,
                last_name: profile.last_name
              ) : nil
            )
          ), status: :created
        else
          render json: { errors: favorite.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def index
        favorites = current_user.favorites.includes(favorite_user: :profile)
        
        formatted_favorites = favorites.map do |favorite|
          user = favorite.favorite_user
          profile = user.profile
          
          # Get profile picture URL
          picture_url = nil
          if profile&.profile_picture&.attached?
            begin
              picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
            rescue
              picture_url = nil
            end
          end
          
          # Get all photos URLs
          photos_urls = []
          if profile&.photos&.attached?
            profile.photos.each do |photo|
              begin
                photos_urls << Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: false, host: request.base_url)
              rescue
                # Skip if URL generation fails
              end
            end
          end
          
          favorite.as_json.merge(
            favorite_user: user.as_json.merge(
              profile: profile ? profile.as_json(methods: [:age, :full_name]).merge(
                profile_picture_url: picture_url,
                photos_urls: photos_urls,
                is_active: user.active?,
                first_name: profile.first_name,
                last_name: profile.last_name
              ) : nil
            )
          )
        end
        
        render json: formatted_favorites, status: :ok
      end
      
      def destroy
        favorite = current_user.favorites.find_by(favorite_user_id: params[:id])
        if favorite&.destroy
          render json: { message: 'Removed from favorites' }, status: :ok
        else
          render json: { error: 'Favorite not found' }, status: :not_found
        end
      end
    end
  end
end

