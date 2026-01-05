# ✨ Shaadi Matching Platform

A full-stack marriage matching web application inspired by Shaadi.com and Jeevansathi.com, with UI design following vivahbio.com templates.

## 🚀 Tech Stack

- **Backend:** Ruby on Rails (API-only)
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Storage:** AWS S3 (for images)
- **Payments:** Stripe/Razorpay (structure ready)

## 📁 Project Structure

```
shaadi-matching-platform/
├── backend/          # Rails API
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── ...
│   ├── config/
│   ├── db/
│   └── Gemfile
└── frontend/         # React + Vite
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── utils/
    └── package.json
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
bundle install
```

3. Setup database:
```bash
rails db:create
rails db:migrate
```

4. Start Rails server:
```bash
rails server
```

The API will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with API URL:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

5. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## ✨ Features

### User Features
- ✅ User authentication (signup/login with JWT)
- ✅ Profile creation wizard (multi-step form)
- ✅ Profile picture upload
- ✅ Search and filter matches
- ✅ Smart match suggestions
- ✅ Send/receive interests
- ✅ Favorites management
- ✅ Messaging system
- ✅ Subscription plans

### Admin Features
- ✅ Admin dashboard
- ✅ User management
- ✅ Subscription tracking

## 🎨 Design

The UI follows the **vivahbio.com** aesthetic:
- Soft pastel color palette (pink/rose gradients)
- Elegant typography (Playfair Display for headings)
- Smooth card layouts with hover effects
- Responsive design (mobile + desktop)
- Modern gradient CTAs

## 📡 API Endpoints

### Authentication
- `POST /api/v1/signup` - User registration
- `POST /api/v1/login` - User login
- `DELETE /api/v1/logout` - User logout

### Profiles
- `GET /api/v1/users/:id` - Get user profile
- `POST /api/v1/profiles` - Create profile
- `PUT /api/v1/profiles/:id` - Update profile
- `POST /api/v1/users/:id/profile_picture` - Upload profile picture

### Search & Matching
- `GET /api/v1/search` - Search profiles with filters
- `GET /api/v1/matches` - Get matches based on preferences
- `GET /api/v1/matches/suggested` - Get suggested matches

### Interests
- `POST /api/v1/interests` - Send interest
- `GET /api/v1/interests` - Get interests
- `PATCH /api/v1/interests/:id/accept` - Accept interest
- `PATCH /api/v1/interests/:id/reject` - Reject interest

### Favorites
- `POST /api/v1/favorites` - Add to favorites
- `GET /api/v1/favorites` - Get favorites
- `DELETE /api/v1/favorites/:id` - Remove from favorites

### Messages
- `GET /api/v1/conversations` - Get conversations
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/:id/messages` - Get messages
- `POST /api/v1/conversations/:id/messages` - Send message

### Subscriptions
- `GET /api/v1/subscriptions` - Get subscriptions
- `POST /api/v1/subscriptions` - Create subscription

### Admin
- `GET /api/v1/admin/dashboard` - Admin dashboard stats
- `GET /api/v1/admin/users` - List users

## 🔐 Environment Variables

### Backend
Create `config/credentials.yml.enc` or use environment variables:
- `SECRET_KEY_BASE` - Rails secret key
- `DATABASE_URL` - PostgreSQL connection string
- `AWS_ACCESS_KEY_ID` - For S3 uploads
- `AWS_SECRET_ACCESS_KEY` - For S3 uploads
- `AWS_REGION` - S3 region
- `AWS_BUCKET` - S3 bucket name

### Frontend
Create `.env` file:
- `VITE_API_BASE_URL` - Backend API URL

## 🚢 Deployment

### Backend (Render/Heroku/Railway)
1. Set environment variables
2. Run migrations: `rails db:migrate`
3. Deploy

### Frontend (Netlify/Vercel)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set environment variables

## 📝 Next Steps

1. Configure AWS S3 for image uploads
2. Integrate Stripe/Razorpay for payments
3. Add email verification
4. Implement real-time messaging (WebSockets)
5. Add more advanced matching algorithms
6. Set up production database

## 📄 License

This project is for educational purposes.

