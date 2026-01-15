module Api
  module V1
    class NotificationsController < ApplicationController
      def index
        notifications = current_user.notifications.recent.limit(50)
        
        formatted_notifications = notifications.map do |notification|
          actor = notification.actor
          actor_profile = actor&.profile
          
          actor_picture_url = nil
          if actor_profile&.profile_picture&.attached?
            begin
              actor_picture_url = Rails.application.routes.url_helpers.rails_blob_url(
                actor_profile.profile_picture, 
                only_path: false, 
                host: request.base_url
              )
            rescue
              actor_picture_url = nil
            end
          end
          
          # Get interest status if this is an interest notification
          interest_status = nil
          if notification.notifiable_type == 'Interest' && notification.notifiable_id
            begin
              interest = Interest.find(notification.notifiable_id)
              interest_status = interest.status
            rescue
              # Interest might have been deleted
            end
          end
          
          notification.as_json.merge(
            actor: actor ? {
              id: actor.id,
              name: actor_profile&.full_name || actor.email.split('@').first,
              profile_picture_url: actor_picture_url
            } : nil,
            interest_status: interest_status
          )
        end
        
        unread_count = current_user.notifications.unread.count
        
        render json: {
          notifications: formatted_notifications,
          unread_count: unread_count
        }, status: :ok
      end
      
      def mark_as_read
        notification = current_user.notifications.find(params[:id])
        notification.mark_as_read!
        render json: { message: 'Notification marked as read' }, status: :ok
      end
      
      def mark_all_as_read
        current_user.notifications.unread.update_all(read: true)
        render json: { message: 'All notifications marked as read' }, status: :ok
      end
      
      def unread_count
        count = current_user.notifications.unread.count
        render json: { unread_count: count }, status: :ok
      end
    end
  end
end

