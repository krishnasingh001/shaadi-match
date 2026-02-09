# AWS S3 Setup Guide

This guide will help you configure AWS S3 for photo uploads in the SwipeUpRight application.

## Quick Start

1. **Set environment variables** in `backend/.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your_bucket_name
   ```

2. **Restart your Rails server** - The application will automatically use S3 if credentials are configured, otherwise it will fall back to local storage.

That's it! The application is already configured to work with S3.

## Prerequisites

1. AWS Account with S3 access
2. S3 Bucket created
3. AWS Access Key ID and Secret Access Key

## Step 1: Create S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Create a new bucket with a unique name (e.g., `swipeupright-photos`)
4. Choose a region (e.g., `us-east-1`)
5. Configure bucket settings:
   - **Block Public Access**: Uncheck "Block all public access" if you want public read access
   - **Bucket Versioning**: Optional (recommended for production)
   - **Default Encryption**: Enable (recommended)

## Step 2: Configure Bucket Permissions

### Bucket Policy (for public read access)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

### CORS Configuration

Add this CORS configuration to your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 3: Create IAM User for S3 Access

1. Go to IAM Console
2. Create a new user (e.g., `swipeupright-s3-user`)
3. Attach policy: `AmazonS3FullAccess` (or create a custom policy with limited permissions)
4. Create Access Key
5. **Save the Access Key ID and Secret Access Key** (you won't see the secret again)

### Recommended IAM Policy (Limited Permissions)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

## Step 4: Set Environment Variables

Create a `.env` file in the `backend` directory (or set these in your deployment environment):

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name_here
```

### For Development

You can also use Rails credentials:

```bash
# Edit credentials
EDITOR="code --wait" rails credentials:edit

# Add:
aws:
  access_key_id: your_access_key_id_here
  secret_access_key: your_secret_access_key_here
  region: us-east-1
  bucket: your_bucket_name_here
```

## Step 5: Verify Configuration

1. Restart your Rails server
2. Try uploading a photo through the application
3. Check your S3 bucket to see if the file was uploaded

## Troubleshooting

### Issue: "Access Denied" error
- Check IAM user permissions
- Verify bucket policy allows the operations
- Ensure Access Key ID and Secret Access Key are correct

### Issue: "Bucket not found"
- Verify bucket name matches `AWS_S3_BUCKET` environment variable
- Check region matches your bucket's region

### Issue: CORS errors
- Ensure CORS configuration is set on the bucket
- Check that allowed origins include your frontend domain

### Issue: SSL Certificate Verification Error
If you see `SSL_connect returned=1 errno=0 state=error: certificate verify failed`, try:

**Option 1: Update SSL Certificates (Recommended)**
```bash
# On macOS with Homebrew
brew update
brew upgrade openssl@3

# Or reinstall certificates
brew reinstall openssl@3
```

**Option 2: Set SSL Certificate File**
Add to your `.env` file:
```bash
SSL_CERT_FILE=/opt/homebrew/etc/openssl@3/cert.pem
```

**Option 3: Temporary Workaround (Development Only)**
Add to your `.env` file:
```bash
AWS_SKIP_SSL_VERIFY=true
```
⚠️ **WARNING**: This disables SSL verification. Only use in development, never in production!

## Security Best Practices

1. **Never commit credentials to git** - Use environment variables or Rails credentials
2. **Use IAM roles** in production (instead of access keys when possible)
3. **Limit IAM permissions** to only what's needed
4. **Enable bucket versioning** for production
5. **Enable bucket encryption** (AES-256 or KMS)
6. **Set up CloudFront CDN** for better performance (optional)

## Testing

After setup, test the upload functionality:
1. Go to Profile Edit page
2. Upload a photo
3. Check if it appears in your S3 bucket
4. Verify the photo displays correctly in the application

