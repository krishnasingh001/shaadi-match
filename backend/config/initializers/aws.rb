# AWS SDK Configuration
# This initializer configures the AWS SDK with proper SSL settings

if ENV['AWS_ACCESS_KEY_ID'].present? && ENV['AWS_S3_BUCKET'].present?
  require 'aws-sdk-s3'
  
  # Set SSL certificate file if not already set
  # This helps with SSL certificate verification issues
  unless ENV['SSL_CERT_FILE']
    # Try common certificate locations
    cert_paths = [
      '/opt/homebrew/etc/openssl@3/cert.pem',
      '/opt/homebrew/etc/openssl@1.1/cert.pem',
      '/usr/local/etc/openssl@3/cert.pem',
      '/usr/local/etc/openssl@1.1/cert.pem',
      '/etc/ssl/certs/ca-certificates.crt',
      '/etc/ssl/certs/ca-bundle.crt'
    ]
    
    cert_path = cert_paths.find { |path| File.exist?(path) }
    if cert_path
      ENV['SSL_CERT_FILE'] = cert_path
    end
  end
  
  # Configure AWS SDK with SSL settings
  aws_config = {
    region: ENV['AWS_REGION'] || 'us-east-1',
    http_open_timeout: 15,
    http_read_timeout: 60
  }
  
  # For development: If SSL verification fails, you can temporarily disable it
  # WARNING: Only use this in development, never in production!
  if Rails.env.development? && ENV['AWS_SKIP_SSL_VERIFY'] == 'true'
    aws_config[:ssl_verify_peer] = false
    Rails.logger.warn "WARNING: SSL verification is disabled for AWS S3. This should only be used in development!"
  else
    aws_config[:ssl_verify_peer] = true
  end
  
  Aws.config.update(aws_config)
  
  Rails.logger.info "AWS SDK configured for region: #{aws_config[:region]}"
end

