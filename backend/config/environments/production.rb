require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false

  # Heroku serves static files via the asset pipeline
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present? || ENV["RENDER"].present?

  config.active_support.deprecation = :notify
  config.active_support.disallowed_deprecation = :log
  config.active_support.disallowed_deprecation_warnings = []
  config.log_formatter = ::Logger::Formatter.new
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info").to_sym
  config.log_tags = [ :request_id ]
  config.active_record.dump_schema_after_migration = false

  # Allow Heroku host and any custom domain
  config.hosts.clear

  # Force SSL in production
  config.force_ssl = true if ENV["RAILS_FORCE_SSL"] == "true"

  # Active Storage: use S3 in production if configured, otherwise local
  config.active_storage.service = ENV.fetch("RAILS_STORAGE_SERVICE", "local").to_sym
end

