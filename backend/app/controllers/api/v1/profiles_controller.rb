module Api
  module V1
    class ProfilesController < ApplicationController
      def show
        if current_user.profile
          render json: current_user.profile.as_json(methods: [:age, :full_name]), status: :ok
        else
          render json: { error: 'Profile not found' }, status: :not_found
        end
      end
      
      def create
        if current_user.profile
          render json: { error: 'Profile already exists' }, status: :unprocessable_entity
          return
        end
        
        profile = current_user.build_profile(profile_params)
        
        if profile.save
          render json: profile.as_json(methods: [:age, :full_name]), status: :created
        else
          render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update
        profile = Profile.find(params[:id])
        if profile.user_id != current_user.id
          render json: { error: 'Unauthorized' }, status: :unauthorized
          return
        end
        
        if profile.update(profile_params)
          render json: profile.as_json(methods: [:age, :full_name]), status: :ok
        else
          render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def update_current
        unless current_user.profile
          render json: { error: 'Profile not found' }, status: :not_found
          return
        end
        
        if current_user.profile.update(profile_params)
          render json: current_user.profile.as_json(methods: [:age, :full_name]), status: :ok
        else
          render json: { errors: current_user.profile.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private
      
      def profile_params
        params.require(:profile).permit(
          :first_name, :last_name, :date_of_birth, :gender, :height,
          :religion, :caste, :sub_caste, :marital_status, :diet, :drinking, :smoking,
          :education, :profession, :annual_income, :city, :state, :country,
          :about_me, :family_details, :father_name, :mother_name, :siblings,
          :native_place, :languages_spoken
        )
      end
    end
  end
end

