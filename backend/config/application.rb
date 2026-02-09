require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module ShaadiMatchingApi
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    
    # CORS is configured in config/initializers/cors.rb
    
    config.active_storage.variant_processor = :mini_magick
  end
end

