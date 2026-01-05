module Api
  module V1
    class FavoritesController < ApplicationController
      def create
        favorite = current_user.favorites.build(favorite_user_id: params[:user_id])
        
        if favorite.save
          render json: favorite.as_json(include: :favorite_user), status: :created
        else
          render json: { errors: favorite.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def index
        favorites = current_user.favorites.includes(:favorite_user)
        render json: favorites.as_json(include: { favorite_user: { include: :profile } }), status: :ok
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

