module Api
  module V1
    module Admin
      class SubscriptionsController < ApplicationController
        before_action :ensure_admin
        
        def index
          subscriptions = Subscription.includes(:user).order(created_at: :desc).page(params[:page]).per(20)
          render json: subscriptions.as_json(include: :user), status: :ok
        end
        
        def show
          subscription = Subscription.find(params[:id])
          render json: subscription.as_json(include: :user), status: :ok
        end
        
        private
        
        def ensure_admin
          render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user.admin?
        end
      end
    end
  end
end

