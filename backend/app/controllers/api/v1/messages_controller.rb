module Api
  module V1
    class MessagesController < ApplicationController
      def index
        conversation = current_user.conversations.find(params[:conversation_id])
        messages = conversation.messages.order(created_at: :desc).limit(50)
        render json: messages.as_json(
          include: { user: { only: [:id, :email] } },
          only: [:id, :body, :created_at, :user_id]
        ), status: :ok
      end
      
      def create
        conversation = current_user.conversations.find(params[:conversation_id])
        message = conversation.messages.build(user: current_user, body: params[:body])
        
        if message.save
          # Create notification for the receiver (only if not the sender)
          receiver = conversation.sender == current_user ? conversation.receiver : conversation.sender
          if receiver != current_user
            Notification.create_for_message(message)
          end
          
          render json: message.as_json(
            include: { user: { only: [:id, :email] } },
            only: [:id, :body, :created_at, :user_id]
          ), status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end

