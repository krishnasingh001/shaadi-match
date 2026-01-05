# 🚀 Quick Setup Guide

## Prerequisites

- Ruby 3.3.1 or higher
- PostgreSQL
- Node.js 18+ and npm
- Bundler gem

## Step-by-Step Setup

### 1. Backend Setup

```bash
cd backend

# Install Ruby gems
bundle install

# Create and setup database
rails db:create
rails db:migrate

# (Optional) Create a seed admin user
rails console
# In console:
# User.create!(email: 'admin@example.com', password: 'password123', role: :admin)

# Start Rails server
rails server
```

Backend will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set:
# VITE_API_BASE_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing the Application

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create an account
3. After signup, you'll be redirected to dashboard
4. Click "Create Profile" to build your biodata
5. Fill in all 5 steps of the profile builder
6. Once profile is created, you'll see suggested matches
7. Use "Search" to find more matches with filters
8. Send interests, add favorites, and start conversations!

## Admin Access

To access admin dashboard:
1. Create an admin user in Rails console:
```ruby
User.create!(email: 'admin@example.com', password: 'password123', role: :admin)
```
2. Login with admin credentials
3. Navigate to `/admin` route

## Troubleshooting

### Backend Issues

- **Database connection error**: Make sure PostgreSQL is running
- **Migration errors**: Run `rails db:drop db:create db:migrate`
- **JWT errors**: Check `SECRET_KEY_BASE` in credentials

### Frontend Issues

- **API connection error**: Check `.env` file and ensure backend is running
- **Build errors**: Delete `node_modules` and run `npm install` again
- **CORS errors**: Backend CORS is configured to allow all origins in development

## Next Steps

1. Configure AWS S3 for image uploads
2. Set up email service for verification
3. Integrate payment gateway (Stripe/Razorpay)
4. Deploy to production

