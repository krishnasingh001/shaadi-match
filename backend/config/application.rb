require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module ShaadiMatchingApi
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head]
      end
    end
    
    config.active_storage.variant_processor = :mini_magick
  end
end

