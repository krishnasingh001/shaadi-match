module Api
  module V1
    class MessagesController < ApplicationController
      def index
        conversation = current_user.conversations.find(params[:conversation_id])
        messages = conversation.messages.recent.limit(50)
        render json: messages.as_json(include: { user: { only: [:id, :email] } }), status: :ok
      end
      
      def create
        conversation = current_user.conversations.find(params[:conversation_id])
        message = conversation.messages.build(user: current_user, body: params[:body])
        
        if message.save
          render json: message.as_json(include: { user: { only: [:id, :email] } }), status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end

