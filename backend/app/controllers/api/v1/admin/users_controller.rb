module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        before_action :ensure_admin
        
        def index
          users = User.includes(:profile, :subscriptions).page(params[:page]).per(20)
          render json: users.as_json(include: [:profile, :subscriptions]), status: :ok
        end
        
        def show
          user = User.find(params[:id])
          render json: user.as_json(include: [:profile, :subscriptions]), status: :ok
        end
        
        def update
          user = User.find(params[:id])
          if user.update(user_params)
            render json: user, status: :ok
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
        
        def destroy
          user = User.find(params[:id])
          user.destroy
          render json: { message: 'User deleted' }, status: :ok
        end
        
        private
        
        def ensure_admin
          render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user.admin?
        end
        
        def user_params
          params.require(:user).permit(:email, :role)
        end
      end
    end
  end
end

