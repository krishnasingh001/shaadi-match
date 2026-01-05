module Api
  module V1
    module Admin
      class DashboardController < ApplicationController
        before_action :ensure_admin
        
        def index
          render json: {
            total_users: User.count,
            active_subscriptions: Subscription.active.count,
            total_profiles: Profile.count,
            pending_interests: Interest.pending.count
          }, status: :ok
        end
        
        private
        
        def ensure_admin
          render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user.admin?
        end
      end
    end
  end
end

