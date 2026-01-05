module Api
  module V1
    class PartnerPreferencesController < ApplicationController
      def show
        if current_user.partner_preference
          render json: current_user.partner_preference, status: :ok
        else
          render json: { error: 'Partner preference not found' }, status: :not_found
        end
      end
      
      def create
        if current_user.partner_preference
          render json: { error: 'Partner preference already exists' }, status: :unprocessable_entity
          return
        end
        
        preference = current_user.build_partner_preference(partner_preference_params)
        
        if preference.save
          render json: preference, status: :created
        else
          render json: { errors: preference.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        unless current_user.partner_preference
          render json: { error: 'Partner preference not found' }, status: :not_found
          return
        end
        
        if current_user.partner_preference.update(partner_preference_params)
          render json: current_user.partner_preference, status: :ok
        else
          render json: { errors: current_user.partner_preference.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private
      
      def partner_preference_params
        params.require(:partner_preference).permit(
          :min_age, :max_age, :min_height, :max_height,
          :religion, :caste, :education, :profession,
          :city, :state, :marital_status
        )
      end
    end
  end
end

