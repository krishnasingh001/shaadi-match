module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user, only: [:signup, :login]
      
      def signup
        user = User.new(user_params)
        
        if user.save
          user.create_profile
          user.create_partner_preference
          token = user.generate_jwt
          render json: {
            user: user.as_json(except: [:password_digest]),
            token: token,
            message: 'User created successfully. Please verify your email.'
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def login
        user = User.find_by(email: params[:email])
        
        if user && user.authenticate(params[:password])
          token = user.generate_jwt
          render json: {
            user: user.as_json(except: [:password_digest]),
            token: token,
            message: 'Logged in successfully'
          }, status: :ok
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end
      
      def logout
        render json: { message: 'Logged out successfully' }, status: :ok
      end
      
      def reset_password
        user = User.find_by(email: params[:email])
        if user
          # In production, send password reset email
          render json: { message: 'Password reset instructions sent to your email' }, status: :ok
        else
          render json: { error: 'Email not found' }, status: :not_found
        end
      end
      
      private
      
      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation)
      end
    end
  end
end

