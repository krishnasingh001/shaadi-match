Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In production use FRONTEND_URL; in dev allow everything
    allowed_origins = if ENV['FRONTEND_URL'].present?
                        [ENV['FRONTEND_URL']]
                      else
                        ['*']
                      end
    origins(*allowed_origins)
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization']
  end
end

