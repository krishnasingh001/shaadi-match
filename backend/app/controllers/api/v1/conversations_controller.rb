module Api
  module V1
    class ConversationsController < ApplicationController
      def index
        conversations = current_user.conversations.includes(:sender, :receiver, :messages)
        render json: conversations.as_json(
          include: {
            sender: { only: [:id, :email] },
            receiver: { only: [:id, :email] },
            messages: { only: [:id, :body, :created_at] }
          }
        ), status: :ok
      end
      
      def show
        conversation = current_user.conversations.find(params[:id])
        render json: conversation.as_json(
          include: {
            sender: { include: :profile },
            receiver: { include: :profile },
            messages: { include: { user: { only: [:id, :email] } } }
          }
        ), status: :ok
      end
      
      def create
        receiver = User.find(params[:receiver_id])
        conversation = Conversation.find_or_create_by(
          sender: current_user,
          receiver: receiver
        ) do |conv|
          conv.sender = current_user
          conv.receiver = receiver
        end
        
        render json: conversation.as_json(include: [:sender, :receiver]), status: :created
      end
    end
  end
end

