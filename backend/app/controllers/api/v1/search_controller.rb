module Api
  module V1
    class SearchController < ApplicationController
      def index
        profiles = Profile.all
        
        # Exclude current user
        profiles = profiles.where.not(user_id: current_user.id)
        
        # Exclude profiles where current user has already sent an interest (but NOT accepted ones - keep those visible)
        sent_pending_interest_user_ids = current_user.sent_interests.where.not(status: Interest.statuses[:accepted]).pluck(:receiver_id)
        profiles = profiles.where.not(user_id: sent_pending_interest_user_ids) if sent_pending_interest_user_ids.any?
        
        # General search query - searches across multiple fields
        if params[:query].present? && params[:query].strip.present?
          search_term = "%#{params[:query].strip.downcase}%"
          # Search in first_name, last_name, full name (concatenated), and profession
          # Using PostgreSQL's string concatenation operator ||
          # Handle NULL values with COALESCE
          profiles = profiles.where(
            "LOWER(COALESCE(first_name, '')) LIKE :search OR " +
            "LOWER(COALESCE(last_name, '')) LIKE :search OR " +
            "LOWER(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) LIKE :search OR " +
            "LOWER(COALESCE(profession, '')) LIKE :search OR " +
            "LOWER(COALESCE(city, '')) LIKE :search OR " +
            "LOWER(COALESCE(state, '')) LIKE :search OR " +
            "LOWER(COALESCE(education, '')) LIKE :search OR " +
            "LOWER(COALESCE(religion, '')) LIKE :search OR " +
            "LOWER(COALESCE(caste, '')) LIKE :search",
            search: search_term
          )
        end
        
        # Apply gender filter - show opposite gender by default
        if params[:gender].present?
          profiles = profiles.where(gender: params[:gender])
        elsif current_user.profile&.gender.present?
          user_gender = current_user.profile.gender
          if user_gender == 'male'
            profiles = profiles.where(gender: 'female')
          elsif user_gender == 'female'
            profiles = profiles.where(gender: 'male')
          end
          # If gender is 'other', show all genders (no filter)
        end
        
        # Age filters
        if params[:min_age].present? && params[:min_age].to_i > 0
          profiles = profiles.where("date_of_birth <= ?", params[:min_age].to_i.years.ago)
        end
        
        if params[:max_age].present? && params[:max_age].to_i > 0
          profiles = profiles.where("date_of_birth >= ?", params[:max_age].to_i.years.ago)
        end
        
        # Text filters with case-insensitive partial matching
        if params[:religion].present? && params[:religion].strip.present?
          profiles = profiles.where("LOWER(religion) LIKE ?", "%#{params[:religion].strip.downcase}%")
        end
        
        if params[:caste].present? && params[:caste].strip.present?
          profiles = profiles.where("LOWER(caste) LIKE ?", "%#{params[:caste].strip.downcase}%")
        end
        
        if params[:education].present? && params[:education].strip.present?
          profiles = profiles.where("LOWER(education) LIKE ?", "%#{params[:education].strip.downcase}%")
        end
        
        if params[:profession].present? && params[:profession].strip.present?
          profiles = profiles.where("LOWER(profession) LIKE ?", "%#{params[:profession].strip.downcase}%")
        end
        
        if params[:city].present? && params[:city].strip.present?
          profiles = profiles.where("LOWER(city) LIKE ?", "%#{params[:city].strip.downcase}%")
        end
        
        if params[:state].present? && params[:state].strip.present?
          profiles = profiles.where("LOWER(state) LIKE ?", "%#{params[:state].strip.downcase}%")
        end
        
        # Height filters
        if params[:min_height].present? && params[:min_height].to_f > 0
          profiles = profiles.where("height >= ?", params[:min_height].to_f)
        end
        
        if params[:max_height].present? && params[:max_height].to_f > 0
          profiles = profiles.where("height <= ?", params[:max_height].to_f)
        end
        
        # Get total count before pagination
        total_count = profiles.count
        
        # Pagination
        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 20).to_i
        offset = (page - 1) * per_page
        total_pages = (total_count.to_f / per_page).ceil
        
        paginated_profiles = profiles.limit(per_page).offset(offset)
        
        # Format profiles with picture URLs and active status
        formatted_profiles = paginated_profiles.map do |profile|
          picture_url = nil
          if profile.profile_picture.attached?
            begin
              picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
            rescue
              picture_url = nil
            end
          end
          
          # Get all photos URLs
          photos_urls = []
          if profile.photos.attached?
            profile.photos.each do |photo|
              begin
                photos_urls << Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: false, host: request.base_url)
              rescue
                # Skip if URL generation fails
              end
            end
          end
          
          # Check if there's an accepted interest between current_user and this profile's user
          accepted_interest = Interest.where(
            "((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = ?",
            current_user.id, profile.user_id, profile.user_id, current_user.id, Interest.statuses[:accepted]
          ).first
          
          profile_json = profile.as_json(include: :user, methods: [:age, :full_name])
          
          # Ensure full_name is always present - if method didn't work, construct it manually
          if profile_json['full_name'].blank? && profile.first_name.present?
            profile_json['full_name'] = [profile.first_name, profile.last_name].compact.join(' ').strip
          end
          
          profile_json.merge(
            profile_picture_url: picture_url,
            photos_urls: photos_urls,
            is_active: profile.user.active?,
            interest_accepted: accepted_interest.present?,
            first_name: profile.first_name,
            last_name: profile.last_name,
            full_name: profile_json['full_name'] || [profile.first_name, profile.last_name].compact.join(' ').strip || 'Unknown User'
          )
        end
        
        render json: {
          profiles: formatted_profiles,
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
