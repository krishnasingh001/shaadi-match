module Api
  module V1
    class ConversationsController < ApplicationController
      def index
        conversations = current_user.conversations.includes(:sender, :receiver, :messages)
        
        formatted_conversations = conversations.map do |conv|
          other_user = conv.sender == current_user ? conv.receiver : conv.sender
          profile = other_user.profile
          
          picture_url = nil
          if profile&.profile_picture&.attached?
            begin
              picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
            rescue
              picture_url = nil
            end
          end
          
          conv.as_json(
            include: {
              sender: { only: [:id, :email] },
              receiver: { only: [:id, :email] },
              messages: { only: [:id, :body, :created_at, :user_id] }
            }
          ).merge(
            other_user_profile: profile ? profile.as_json(methods: [:age, :full_name]).merge(profile_picture_url: picture_url) : nil,
            other_user_active: other_user.active?
          )
        end
        
        render json: formatted_conversations, status: :ok
      end
      
      def connections
        # Get all accepted interests where current user is involved
        accepted_interests = Interest.where(
          "(sender_id = ? OR receiver_id = ?) AND status = ?",
          current_user.id, current_user.id, Interest.statuses[:accepted]
        ).includes(:sender, :receiver)
        
        # Get user IDs of people we're already conversing with
        existing_conversation_user_ids = current_user.conversations.pluck(:sender_id, :receiver_id).flatten.uniq - [current_user.id]
        
        # Get connections (people with accepted interests who we're not already conversing with)
        connections = []
        accepted_interests.each do |interest|
          other_user = interest.sender == current_user ? interest.receiver : interest.sender
          next if existing_conversation_user_ids.include?(other_user.id)
          
          profile = other_user.profile
          picture_url = nil
          if profile&.profile_picture&.attached?
            begin
              picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
            rescue
              picture_url = nil
            end
          end
          
          connections << {
            user_id: other_user.id,
            email: other_user.email,
            profile: profile ? profile.as_json(methods: [:age, :full_name]).merge(profile_picture_url: picture_url) : nil,
            is_active: other_user.active?
          }
        end
        
        render json: { connections: connections }, status: :ok
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
        
        # Check if interest is accepted between current_user and receiver
        accepted_interest = Interest.where(
          "((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = ?",
          current_user.id, receiver.id, receiver.id, current_user.id, Interest.statuses[:accepted]
        ).first
        
        unless accepted_interest
          render json: { 
            error: 'Cannot start conversation. Interest request must be accepted first.' 
          }, status: :unprocessable_entity
          return
        end
        
        # Check if conversation exists in either direction
        conversation = Conversation.where(
          "(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
          current_user.id, receiver.id, receiver.id, current_user.id
        ).first
        
        # Create if doesn't exist
        unless conversation
          conversation = Conversation.create(
            sender: current_user,
            receiver: receiver
          )
        end
        
        # Include profile data
        other_user = conversation.sender == current_user ? conversation.receiver : conversation.sender
        profile = other_user.profile
        
        picture_url = nil
        if profile&.profile_picture&.attached?
          begin
            picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
          rescue
            picture_url = nil
          end
        end
        
        render json: conversation.as_json(
          include: [:sender, :receiver]
        ).merge(
          other_user_profile: profile ? profile.as_json(methods: [:age, :full_name]).merge(profile_picture_url: picture_url) : nil
        ), status: :created
      end
    end
  end
end

