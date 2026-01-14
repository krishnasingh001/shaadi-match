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
      
      def upload_photos
        unless current_user.profile
          render json: { error: 'Profile not found' }, status: :not_found
          return
        end
        
        if params[:photos].present?
          # Limit to 6 photos total
          current_count = current_user.profile.photos.count
          new_photos = params[:photos].is_a?(Array) ? params[:photos] : [params[:photos]]
          
          if current_count + new_photos.length > 6
            render json: { error: 'Maximum 6 photos allowed' }, status: :unprocessable_entity
            return
          end
          
          new_photos.each do |photo|
            current_user.profile.photos.attach(photo)
          end
          
          render json: { message: 'Photos uploaded successfully', count: current_user.profile.photos.count }, status: :ok
        else
          render json: { error: 'No photos provided' }, status: :unprocessable_entity
        end
      end
      
      def delete_photo
        unless current_user.profile
          render json: { error: 'Profile not found' }, status: :not_found
          return
        end
        
        begin
          # Find photo by signed_id (Active Storage uses signed IDs)
          photo = current_user.profile.photos.find_signed(params[:photo_id])
          if photo
            photo.purge
            render json: { message: 'Photo deleted successfully' }, status: :ok
          else
            render json: { error: 'Photo not found' }, status: :not_found
          end
        rescue ActiveSupport::MessageVerifier::InvalidSignature
          render json: { error: 'Invalid photo ID' }, status: :unprocessable_entity
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

