module Api
  module V1
    class InterestsController < ApplicationController
      def create
        interest = current_user.sent_interests.build(receiver_id: params[:receiver_id])
        
        if interest.save
          render json: interest.as_json(include: [:sender, :receiver]), status: :created
        else
          render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def index
        interests = case params[:type]
        when 'sent'
          current_user.sent_interests.includes(:receiver)
        when 'received'
          current_user.received_interests.includes(:sender)
        else
          Interest.where("sender_id = ? OR receiver_id = ?", current_user.id, current_user.id).includes(:sender, :receiver)
        end
        
        render json: interests.as_json(include: [:sender, :receiver]), status: :ok
      end
      
      def accept
        interest = current_user.received_interests.find(params[:id])
        if interest.update(status: :accepted)
          render json: interest.as_json(include: [:sender, :receiver]), status: :ok
        else
          render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def reject
        interest = current_user.received_interests.find(params[:id])
        if interest.update(status: :rejected)
          render json: interest.as_json(include: [:sender, :receiver]), status: :ok
        else
          render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end

