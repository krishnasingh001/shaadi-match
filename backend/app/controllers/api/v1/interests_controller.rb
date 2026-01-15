module Api
  module V1
    class InterestsController < ApplicationController
      def create
        receiver = User.find(params[:receiver_id])
        
        # Check if interest already exists
        existing_interest = Interest.find_by(sender_id: current_user.id, receiver_id: receiver.id)
        
        if existing_interest
          # If interest already exists, return it with a message
          render json: {
            interest: existing_interest.as_json(include: [:sender, :receiver]),
            message: 'Interest already sent'
          }, status: :ok
        else
          # Create new interest
          interest = current_user.sent_interests.build(receiver_id: params[:receiver_id])
          
          if interest.save
            # Create notification for receiver
            Notification.create_for_interest(interest)
            render json: interest.as_json(include: [:sender, :receiver]), status: :created
          else
            render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
      
      def index
        interests = case params[:type]
        when 'sent'
          current_user.sent_interests.includes(receiver: :profile)
        when 'received'
          current_user.received_interests.includes(sender: :profile)
        else
          Interest.where("sender_id = ? OR receiver_id = ?", current_user.id, current_user.id).includes(sender: :profile, receiver: :profile)
        end
        
        formatted_interests = interests.map do |interest|
          user = params[:type] == 'sent' ? interest.receiver : interest.sender
          profile = user&.profile
          
          picture_url = nil
          if profile&.profile_picture&.attached?
            begin
              picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
            rescue
              picture_url = nil
            end
          end
          
          interest.as_json(include: [:sender, :receiver]).merge(
            profile_data: profile ? profile.as_json(methods: [:age, :full_name]).merge(profile_picture_url: picture_url) : nil
          )
        end
        
        render json: formatted_interests, status: :ok
      end
      
      def accept
        interest = current_user.received_interests.find(params[:id])
        if interest.update(status: :accepted)
          # Create notification for sender that their interest was accepted
          Notification.create_for_interest_accepted(interest)
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

      def destroy
        # Allow users to cancel their own sent interests
        interest = current_user.sent_interests.find(params[:id])
        if interest.destroy
          render json: { message: 'Interest request cancelled successfully' }, status: :ok
        else
          render json: { errors: interest.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end

