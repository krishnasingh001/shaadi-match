module Api
  module V1
    class SubscriptionsController < ApplicationController
      def index
        subscriptions = current_user.subscriptions.order(created_at: :desc)
        render json: subscriptions, status: :ok
      end
      
      def create
        # In production, integrate with Stripe/Razorpay
        subscription = current_user.subscriptions.build(subscription_params)
        subscription.start_date = Date.today
        subscription.end_date = Date.today + 30.days
        subscription.status = :active
        
        if subscription.save
          render json: subscription, status: :created
        else
          render json: { errors: subscription.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def show
        subscription = current_user.subscriptions.find(params[:id])
        render json: subscription, status: :ok
      end
      
      def webhook
        # Handle payment webhook
        render json: { message: 'Webhook received' }, status: :ok
      end
      
      private
      
      def subscription_params
        params.require(:subscription).permit(:plan_type)
      end
    end
  end
end

