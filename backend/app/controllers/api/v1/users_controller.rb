module Api
  module V1
    class UsersController < ApplicationController
      def show
        user = User.find(params[:id])
        render json: user.as_json(
          include: {
            profile: { methods: [:age, :full_name] },
            partner_preference: {}
          }
        ), status: :ok
      end
      
      def update
        if current_user.update(user_params)
          render json: current_user.as_json(except: [:password_digest]), status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def profile
        user = User.find(params[:id])
        if user.profile
          render json: user.profile.as_json(methods: [:age, :full_name]), status: :ok
        else
          render json: { error: 'Profile not found' }, status: :not_found
        end
      end
      
      def current_profile
        if current_user.profile
          render json: current_user.profile.as_json(methods: [:age, :full_name]), status: :ok
        else
          render json: { error: 'Profile not found' }, status: :not_found
        end
      end
      
      def current_user_info
        render json: current_user.as_json(
          include: {
            profile: { methods: [:age, :full_name] },
            partner_preference: {}
          },
          except: [:password_digest]
        ), status: :ok
      end
      
      def upload_profile_picture
        if params[:profile_picture].present?
          current_user.profile.profile_picture.attach(params[:profile_picture])
          render json: { message: 'Profile picture uploaded successfully' }, status: :ok
        else
          render json: { error: 'No file provided' }, status: :unprocessable_entity
        end
      end
      
      private
      
      def user_params
        params.require(:user).permit(:email)
      end
    end
  end
end

