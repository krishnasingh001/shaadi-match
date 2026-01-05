class ApplicationController < ActionController::API
  before_action :authenticate_user, except: [:signup, :login]
  
  private
  
  def authenticate_user
    token = request.headers['Authorization']&.split(' ')&.last
    return render json: { error: 'Unauthorized' }, status: :unauthorized unless token
    
    begin
      secret = Rails.application.credentials.secret_key_base || 
               Rails.application.secret_key_base || 
               ENV['SECRET_KEY_BASE'] ||
               'development_secret_key_change_in_production'
      decoded = JWT.decode(token, secret)[0]
      @current_user = User.find(decoded['user_id'])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end
  
  def current_user
    @current_user
  end
end

