module Api
  module V1
    class MatchesController < ApplicationController
      def index
        matches = find_matches
        render json: {
          matches: matches.map { |p| format_match(p) }
        }, status: :ok
      end
      
      def suggested
        matches = find_matches.limit(10)
        render json: {
          matches: matches.map { |p| format_match(p) }
        }, status: :ok
      end
      
      private
      
      def find_matches
        puts "******************************"
        puts Profile.all.inspect
        puts "******************************"
        return Profile.none unless current_user.profile
        
        profile = current_user.profile
        matches = Profile.where.not(user_id: current_user.id)
        
        # Filter by opposite gender: male sees female, female sees male
        if profile.gender == 'male'
          matches = matches.where(gender: 'female')
        elsif profile.gender == 'female'
          matches = matches.where(gender: 'male')
        end
        # If gender is 'other', show all genders (no filter)
        
        if current_user.partner_preference
          pref = current_user.partner_preference
          matches = matches.where("date_of_birth <= ?", pref.max_age.years.ago) if pref.max_age
          matches = matches.where("date_of_birth >= ?", pref.min_age.years.ago) if pref.min_age
          matches = matches.where("height >= ?", pref.min_height) if pref.min_height
          matches = matches.where("height <= ?", pref.max_height) if pref.max_height
          matches = matches.where(religion: pref.religion) if pref.religion.present?
          matches = matches.where(caste: pref.caste) if pref.caste.present?
          matches = matches.where(education: pref.education) if pref.education.present?
          matches = matches.where(city: pref.city) if pref.city.present?
          matches = matches.where(state: pref.state) if pref.state.present?
        end
        
        matches
      end
      
      def format_match(profile)
        picture_url = nil
        if profile.profile_picture.attached?
          begin
            picture_url = Rails.application.routes.url_helpers.rails_blob_url(profile.profile_picture, only_path: false, host: request.base_url)
          rescue
            picture_url = nil
          end
        end
        
        {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.full_name,
          age: profile.age,
          height: profile.height,
          education: profile.education,
          profession: profile.profession,
          city: profile.city,
          state: profile.state,
          profile_picture_url: picture_url
        }
      end
      
    end
  end
end

