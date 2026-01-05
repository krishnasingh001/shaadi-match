module Api
  module V1
    class SearchController < ApplicationController
      def index
        puts "******************************"
        puts Profile.all.inspect
        puts "******************************"
        profiles = Profile.all
        
        # Apply gender filter
        # if params[:gender].present?
        #   profiles = profiles.where(gender: params[:gender])
        # elsif current_user.profile&.gender.present?
        #   # Auto-filter by opposite gender if no gender param provided
        #   user_gender = current_user.profile.gender
        #   if user_gender == 'male'
        #     profiles = profiles.where(gender: 'female')
        #   elsif user_gender == 'female'
        #     profiles = profiles.where(gender: 'male')
        #   end
        #   # If gender is 'other', show all genders (no filter)
        # end
        # profiles = profiles.where("date_of_birth <= ?", params[:max_age].to_i.years.ago) if params[:max_age].present?
        # profiles = profiles.where("date_of_birth >= ?", params[:min_age].to_i.years.ago) if params[:min_age].present?
        # profiles = profiles.where(religion: params[:religion]) if params[:religion].present?
        # profiles = profiles.where(caste: params[:caste]) if params[:caste].present?
        # profiles = profiles.where(education: params[:education]) if params[:education].present?
        # profiles = profiles.where(profession: params[:profession]) if params[:profession].present?
        # profiles = profiles.where(city: params[:city]) if params[:city].present?
        # profiles = profiles.where(state: params[:state]) if params[:state].present?
        # profiles = profiles.where("height >= ?", params[:min_height]) if params[:min_height].present?
        # profiles = profiles.where("height <= ?", params[:max_height]) if params[:max_height].present?
        
        # Exclude current user
        # profiles = profiles.where.not(user_id: current_user.id)
        
        # Get total count before pagination
        total_count = profiles.count
        
        # # Pagination
        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 20).to_i
        offset = (page - 1) * per_page
        total_pages = (total_count.to_f / per_page).ceil
        
        paginated_profiles = profiles.limit(per_page).offset(offset)
        
        render json: {
          profiles: paginated_profiles.map { |p| p.as_json(include: :user, methods: [:age, :full_name]) },
          pagination: {
            current_page: page,
            total_pages: total_pages,
            total_count: total_count,
            per_page: per_page
          }
        }, status: :ok
      end
      
      private
    end
  end
end

