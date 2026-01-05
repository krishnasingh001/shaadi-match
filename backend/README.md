# Shaadi Matching Platform - Backend API

Rails API backend for the marriage matching platform.

## Setup

1. Install dependencies:
```bash
bundle install
```

2. Setup database:
```bash
rails db:create
rails db:migrate
```

3. Start server:
```bash
rails server
```

## API Endpoints

### Authentication
- `POST /api/v1/signup` - User registration
- `POST /api/v1/login` - User login
- `DELETE /api/v1/logout` - User logout

### Users & Profiles
- `GET /api/v1/users/:id` - Get user details
- `PUT /api/v1/users/:id` - Update user
- `POST /api/v1/users/:id/profile_picture` - Upload profile picture

### Search & Matching
- `GET /api/v1/search` - Search profiles with filters
- `GET /api/v1/matches` - Get matches based on preferences
- `GET /api/v1/matches/suggested` - Get suggested matches

### Interests
- `POST /api/v1/interests` - Send interest
- `GET /api/v1/interests` - Get interests (sent/received)
- `PATCH /api/v1/interests/:id/accept` - Accept interest
- `PATCH /api/v1/interests/:id/reject` - Reject interest

### Favorites
- `POST /api/v1/favorites` - Add to favorites
- `GET /api/v1/favorites` - Get favorites list
- `DELETE /api/v1/favorites/:id` - Remove from favorites

### Messages
- `GET /api/v1/conversations` - Get conversations
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/:id/messages` - Get messages
- `POST /api/v1/conversations/:id/messages` - Send message

### Subscriptions
- `GET /api/v1/subscriptions` - Get subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `POST /api/v1/subscriptions/webhook` - Payment webhook

