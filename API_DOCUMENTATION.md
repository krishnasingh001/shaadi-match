# SwipeUpRight API Documentation

Complete API reference for the SwipeUpRight matching platform.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is obtained from the `/signup` or `/login` endpoints.

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Users](#users-endpoints)
3. [Profiles](#profiles-endpoints)
4. [Partner Preferences](#partner-preferences-endpoints)
5. [Search & Matching](#search--matching-endpoints)
6. [Interests](#interests-endpoints)
7. [Favorites](#favorites-endpoints)
8. [Conversations](#conversations-endpoints)
9. [Messages](#messages-endpoints)
10. [Notifications](#notifications-endpoints)
11. [Subscriptions](#subscriptions-endpoints)
12. [Admin](#admin-endpoints)

---

## Authentication Endpoints

### Sign Up

Create a new user account.

**Endpoint:** `POST /signup`

**Authentication:** Not required

**Request Body:**
```json
{
  "user": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "User created successfully. Please verify your email."
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "errors": ["Email has already been taken", "Password is too short"]
}
```

---

### Login

Authenticate and get JWT token.

**Endpoint:** `POST /login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "message": "Logged in successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

### Logout

Logout current user (client-side token removal).

**Endpoint:** `DELETE /logout`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Reset Password

Request password reset instructions.

**Endpoint:** `POST /password/reset`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset instructions sent to your email"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Email not found"
}
```

---

## Users Endpoints

### Get Current User Info

Get current authenticated user information.

**Endpoint:** `GET /users/current`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "profile": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "age": 28,
    "full_name": "John Doe"
  },
  "partner_preference": {
    "id": 1,
    "min_age": 25,
    "max_age": 35
  }
}
```

---

### Get Current User Profile

Get current user's profile with photos.

**Endpoint:** `GET /users/profile`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "full_name": "John Doe",
  "profile_picture_url": "https://example.com/profile.jpg",
  "photos_urls": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  "photos": [
    {
      "id": "signed_id_1",
      "url": "https://example.com/photo1.jpg"
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Profile not found"
}
```

---

### Get User by ID

Get user information by ID.

**Endpoint:** `GET /users/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "profile": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "age": 28,
    "full_name": "John Doe",
    "profile_picture_url": "https://example.com/profile.jpg",
    "photos_urls": ["https://example.com/photo1.jpg"]
  },
  "partner_preference": {
    "id": 1
  }
}
```

---

### Get User Profile by ID

Get a specific user's profile.

**Endpoint:** `GET /users/:id/profile`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "full_name": "John Doe",
  "profile_picture_url": "https://example.com/profile.jpg",
  "photos_urls": ["https://example.com/photo1.jpg"]
}
```

---

### Update Current User

Update current user information.

**Endpoint:** `PUT /users/:id` or `PATCH /users/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Must match current user ID

**Request Body:**
```json
{
  "user": {
    "email": "newemail@example.com"
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "newemail@example.com"
}
```

---

### Upload Profile Picture

Upload profile picture for current user.

**Endpoint:** `POST /users/:id/profile_picture`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Must match current user ID

**Request Body:** (multipart/form-data)
- `profile_picture` (file, required) - Image file

**Response (200 OK):**
```json
{
  "message": "Profile picture uploaded successfully"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "No file provided"
}
```

---

## Profiles Endpoints

### Create Profile

Create a new profile for current user.

**Endpoint:** `POST /profiles`

**Authentication:** Required

**Request Body:**
```json
{
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1995-01-15",
    "gender": "male",
    "height": 175,
    "religion": "Hindu",
    "caste": "Brahmin",
    "sub_caste": "Kashmiri Pandit",
    "marital_status": "never_married",
    "diet": "vegetarian",
    "drinking": "no",
    "smoking": "no",
    "education": "Bachelor's Degree",
    "profession": "Software Engineer",
    "annual_income": 500000,
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "about_me": "I am a software engineer...",
    "family_details": "Joint family...",
    "father_name": "Father Name",
    "mother_name": "Mother Name",
    "siblings": "1 brother",
    "native_place": "Delhi",
    "languages_spoken": "Hindi, English"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "full_name": "John Doe"
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "errors": ["Profile already exists"]
}
```

---

### Get Current Profile

Get current user's profile.

**Endpoint:** `GET /profiles/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Profile ID (must belong to current user)

**Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "full_name": "John Doe"
}
```

---

### Update Current Profile

Update current user's profile.

**Endpoint:** `PATCH /profiles/current` or `PUT /profiles/current`

**Authentication:** Required

**Request Body:** (Same as Create Profile)

**Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe Updated",
  "age": 28,
  "full_name": "John Doe Updated"
}
```

---

### Update Profile by ID

Update a specific profile.

**Endpoint:** `PUT /profiles/:id` or `PATCH /profiles/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Profile ID (must belong to current user)

**Request Body:** (Same as Create Profile)

**Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "full_name": "John Doe"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### Upload Photos

Upload multiple photos for current user's profile (max 6 total).

**Endpoint:** `POST /profiles/current/photos`

**Authentication:** Required

**Request Body:** (multipart/form-data)
- `photos[]` (file array, required) - Array of image files (max 6 total)

**Response (200 OK):**
```json
{
  "message": "Photos uploaded successfully",
  "count": 3
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "Maximum 6 photos allowed"
}
```

---

### Delete Photo

Delete a specific photo from current user's profile.

**Endpoint:** `DELETE /profiles/current/photos/:photo_id`

**Authentication:** Required

**Path Parameters:**
- `photo_id` (string, required) - Photo signed ID

**Response (200 OK):**
```json
{
  "message": "Photo deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Photo not found"
}
```

---

## Partner Preferences Endpoints

### Get Partner Preferences

Get current user's partner preferences.

**Endpoint:** `GET /partner_preferences/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Partner preference ID

**Response (200 OK):**
```json
{
  "id": 1,
  "min_age": 25,
  "max_age": 35,
  "min_height": 160,
  "max_height": 180,
  "religion": "Hindu",
  "caste": "Brahmin",
  "education": "Bachelor's Degree",
  "profession": "Engineer",
  "city": "Mumbai",
  "state": "Maharashtra",
  "marital_status": "never_married"
}
```

---

### Create Partner Preferences

Create partner preferences for current user.

**Endpoint:** `POST /partner_preferences`

**Authentication:** Required

**Request Body:**
```json
{
  "partner_preference": {
    "min_age": 25,
    "max_age": 35,
    "min_height": 160,
    "max_height": 180,
    "religion": "Hindu",
    "caste": "Brahmin",
    "education": "Bachelor's Degree",
    "profession": "Engineer",
    "city": "Mumbai",
    "state": "Maharashtra",
    "marital_status": "never_married"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "min_age": 25,
  "max_age": 35
}
```

---

### Update Partner Preferences

Update current user's partner preferences.

**Endpoint:** `PUT /partner_preferences/:id` or `PATCH /partner_preferences/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Partner preference ID

**Request Body:** (Same as Create)

**Response (200 OK):**
```json
{
  "id": 1,
  "min_age": 26,
  "max_age": 36
}
```

---

## Search & Matching Endpoints

### Search Profiles

Search and filter profiles with pagination.

**Endpoint:** `GET /search`

**Authentication:** Required

**Query Parameters:**
- `query` (string, optional) - General search term (searches name, profession, city, state, education, religion, caste)
- `gender` (string, optional) - Filter by gender (male/female/other). Defaults to opposite gender if not specified.
- `min_age` (integer, optional) - Minimum age filter
- `max_age` (integer, optional) - Maximum age filter
- `min_height` (float, optional) - Minimum height in cm
- `max_height` (float, optional) - Maximum height in cm
- `religion` (string, optional) - Filter by religion (case-insensitive partial match)
- `caste` (string, optional) - Filter by caste (case-insensitive partial match)
- `education` (string, optional) - Filter by education (case-insensitive partial match)
- `profession` (string, optional) - Filter by profession (case-insensitive partial match)
- `city` (string, optional) - Filter by city (case-insensitive partial match)
- `state` (string, optional) - Filter by state (case-insensitive partial match)
- `page` (integer, optional) - Page number (default: 1)
- `per_page` (integer, optional) - Items per page (default: 20)

**Example Request:**
```
GET /search?query=engineer&min_age=25&max_age=35&city=mumbai&page=1&per_page=20
```

**Response (200 OK):**
```json
{
  "profiles": [
    {
      "id": 1,
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "full_name": "Jane Smith",
      "age": 28,
      "height": 165,
      "education": "Bachelor's Degree",
      "profession": "Software Engineer",
      "city": "Mumbai",
      "state": "Maharashtra",
      "profile_picture_url": "https://example.com/profile.jpg",
      "photos_urls": ["https://example.com/photo1.jpg"],
      "is_active": true,
      "interest_accepted": false
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "per_page": 20
  }
}
```

**Notes:**
- Automatically excludes current user
- Excludes profiles where user has already sent pending interests
- Shows opposite gender by default (unless gender filter is specified)
- Includes accepted interests in results

---

### Get Matches

Get recommended matches based on partner preferences.

**Endpoint:** `GET /matches`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "matches": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Jane Smith",
      "age": 28,
      "height": 165,
      "education": "Bachelor's Degree",
      "profession": "Software Engineer",
      "city": "Mumbai",
      "state": "Maharashtra",
      "profile_picture_url": "https://example.com/profile.jpg",
      "is_active": true,
      "interest_accepted": false
    }
  ]
}
```

**Notes:**
- Filters by opposite gender
- Applies partner preference filters if set
- Excludes profiles where user has already sent interests

---

### Get Suggested Matches

Get top 10 suggested matches.

**Endpoint:** `GET /matches/suggested`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "matches": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Jane Smith",
      "age": 28,
      "height": 165,
      "education": "Bachelor's Degree",
      "profession": "Software Engineer",
      "city": "Mumbai",
      "state": "Maharashtra",
      "profile_picture_url": "https://example.com/profile.jpg",
      "is_active": true,
      "interest_accepted": false
    }
  ]
}
```

---

## Interests Endpoints

### Send Interest

Send an interest request to another user.

**Endpoint:** `POST /interests`

**Authentication:** Required

**Request Body:**
```json
{
  "receiver_id": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "status": "pending",
  "created_at": "2024-01-01T00:00:00.000Z",
  "sender": {
    "id": 1,
    "email": "sender@example.com"
  },
  "receiver": {
    "id": 2,
    "email": "receiver@example.com"
  }
}
```

**Response (200 OK) - If already sent:**
```json
{
  "interest": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "status": "pending"
  },
  "message": "Interest already sent"
}
```

**Notes:**
- Creates a notification for the receiver
- Returns existing interest if already sent

---

### Get Interests

Get interests (sent, received, or all).

**Endpoint:** `GET /interests`

**Authentication:** Required

**Query Parameters:**
- `type` (string, optional) - Filter by type: `sent`, `received`, or omit for all

**Example Requests:**
```
GET /interests?type=sent
GET /interests?type=received
GET /interests
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": 1,
      "email": "sender@example.com"
    },
    "receiver": {
      "id": 2,
      "email": "receiver@example.com"
    },
    "profile_data": {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "age": 28,
      "full_name": "Jane Smith",
      "profile_picture_url": "https://example.com/profile.jpg"
    }
  }
]
```

---

### Accept Interest

Accept a received interest request.

**Endpoint:** `PATCH /interests/:id/accept`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Interest ID (must be received by current user)

**Response (200 OK):**
```json
{
  "id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "status": "accepted",
  "sender": {
    "id": 1,
    "email": "sender@example.com"
  },
  "receiver": {
    "id": 2,
    "email": "receiver@example.com"
  }
}
```

**Notes:**
- Creates a notification for the sender
- Allows conversation to start between users

---

### Reject Interest

Reject a received interest request.

**Endpoint:** `PATCH /interests/:id/reject`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Interest ID (must be received by current user)

**Response (200 OK):**
```json
{
  "id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "status": "rejected",
  "sender": {
    "id": 1,
    "email": "sender@example.com"
  },
  "receiver": {
    "id": 2,
    "email": "receiver@example.com"
  }
}
```

---

### Cancel Interest

Cancel a sent interest request.

**Endpoint:** `DELETE /interests/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Interest ID (must be sent by current user)

**Response (200 OK):**
```json
{
  "message": "Interest request cancelled successfully"
}
```

---

## Favorites Endpoints

### Add to Favorites

Add a user to favorites.

**Endpoint:** `POST /favorites`

**Authentication:** Required

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "favorite_user_id": 2,
  "created_at": "2024-01-01T00:00:00.000Z",
  "favorite_user": {
    "id": 2,
    "email": "favorite@example.com",
    "profile": {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "age": 28,
      "full_name": "Jane Smith",
      "profile_picture_url": "https://example.com/profile.jpg",
      "photos_urls": ["https://example.com/photo1.jpg"],
      "is_active": true,
      "first_name": "Jane",
      "last_name": "Smith"
    }
  }
}
```

**Response (200 OK) - If already favorited:**
```json
{
  "favorite": {
    "id": 1,
    "user_id": 1,
    "favorite_user_id": 2
  },
  "message": "Already in favorites"
}
```

**Notes:**
- Creates a notification for the favorited user

---

### Get Favorites

Get all favorites for current user.

**Endpoint:** `GET /favorites`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "favorite_user_id": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "favorite_user": {
      "id": 2,
      "email": "favorite@example.com",
      "profile": {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "age": 28,
        "full_name": "Jane Smith",
        "profile_picture_url": "https://example.com/profile.jpg",
        "photos_urls": ["https://example.com/photo1.jpg"],
        "is_active": true,
        "first_name": "Jane",
        "last_name": "Smith"
      }
    }
  }
]
```

---

### Remove from Favorites

Remove a user from favorites.

**Endpoint:** `DELETE /favorites/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Favorite user ID (not favorite record ID)

**Response (200 OK):**
```json
{
  "message": "Removed from favorites"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Favorite not found"
}
```

---

## Conversations Endpoints

### Get Conversations

Get all conversations for current user.

**Endpoint:** `GET /conversations`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": 1,
      "email": "sender@example.com"
    },
    "receiver": {
      "id": 2,
      "email": "receiver@example.com"
    },
    "messages": [
      {
        "id": 1,
        "body": "Hello!",
        "created_at": "2024-01-01T00:00:00.000Z",
        "user_id": 1
      }
    ],
    "other_user_profile": {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "age": 28,
      "full_name": "Jane Smith",
      "profile_picture_url": "https://example.com/profile.jpg"
    },
    "other_user_active": true
  }
]
```

---

### Get Connections

Get accepted interests that haven't started conversations yet.

**Endpoint:** `GET /conversations/connections`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "connections": [
    {
      "user_id": 2,
      "email": "user@example.com",
      "profile": {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "age": 28,
        "full_name": "Jane Smith",
        "profile_picture_url": "https://example.com/profile.jpg"
      },
      "is_active": true
    }
  ]
}
```

---

### Get Conversation

Get a specific conversation with all messages.

**Endpoint:** `GET /conversations/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Conversation ID (must belong to current user)

**Response (200 OK):**
```json
{
  "id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "created_at": "2024-01-01T00:00:00.000Z",
  "sender": {
    "id": 1,
    "email": "sender@example.com",
    "profile": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "receiver": {
    "id": 2,
    "email": "receiver@example.com",
    "profile": {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith"
    }
  },
  "messages": [
    {
      "id": 1,
      "body": "Hello!",
      "created_at": "2024-01-01T00:00:00.000Z",
      "user_id": 1,
      "user": {
        "id": 1,
        "email": "sender@example.com"
      }
    }
  ]
}
```

---

### Create Conversation

Start a new conversation with a user (requires accepted interest).

**Endpoint:** `POST /conversations`

**Authentication:** Required

**Request Body:**
```json
{
  "receiver_id": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "sender_id": 1,
  "receiver_id": 2,
  "created_at": "2024-01-01T00:00:00.000Z",
  "sender": {
    "id": 1,
    "email": "sender@example.com"
  },
  "receiver": {
    "id": 2,
    "email": "receiver@example.com"
  },
  "other_user_profile": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "age": 28,
    "full_name": "Jane Smith",
    "profile_picture_url": "https://example.com/profile.jpg"
  }
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "Cannot start conversation. Interest request must be accepted first."
}
```

**Notes:**
- Requires an accepted interest between users
- Returns existing conversation if one already exists

---

## Messages Endpoints

### Get Messages

Get messages for a conversation.

**Endpoint:** `GET /conversations/:conversation_id/messages`

**Authentication:** Required

**Path Parameters:**
- `conversation_id` (integer, required) - Conversation ID (must belong to current user)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "body": "Hello!",
    "created_at": "2024-01-01T00:00:00.000Z",
    "user_id": 1,
    "user": {
      "id": 1,
      "email": "sender@example.com"
    }
  }
]
```

**Notes:**
- Returns last 50 messages, ordered by created_at DESC

---

### Send Message

Send a message in a conversation.

**Endpoint:** `POST /conversations/:conversation_id/messages`

**Authentication:** Required

**Path Parameters:**
- `conversation_id` (integer, required) - Conversation ID (must belong to current user)

**Request Body:**
```json
{
  "body": "Hello! How are you?"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "body": "Hello! How are you?",
  "created_at": "2024-01-01T00:00:00.000Z",
  "user_id": 1,
  "user": {
    "id": 1,
    "email": "sender@example.com"
  }
}
```

**Notes:**
- Creates a notification for the receiver (if not the sender)

---

## Notifications Endpoints

### Get Notifications

Get recent notifications for current user.

**Endpoint:** `GET /notifications`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "actor_id": 2,
      "notification_type": "interest_received",
      "title": "New Connection Request",
      "message": "Jane sent you a connection request",
      "read": false,
      "metadata": {
        "interest_id": 1,
        "sender_id": 2,
        "sender_name": "Jane"
      },
      "created_at": "2024-01-01T00:00:00.000Z",
      "actor": {
        "id": 2,
        "name": "Jane Smith",
        "profile_picture_url": "https://example.com/profile.jpg"
      },
      "interest_status": "pending"
    }
  ],
  "unread_count": 5
}
```

**Notification Types:**
- `interest_received` - Someone sent you an interest
- `interest_accepted` - Your interest was accepted
- `new_message` - New message in a conversation
- `favorite` - Someone added you to favorites

---

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `POST /notifications/:id/mark_as_read`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Notification ID

**Response (200 OK):**
```json
{
  "message": "Notification marked as read"
}
```

---

### Mark All Notifications as Read

Mark all unread notifications as read.

**Endpoint:** `POST /notifications/mark_all_as_read`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read"
}
```

---

### Get Unread Count

Get count of unread notifications.

**Endpoint:** `GET /notifications/unread_count`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "unread_count": 5
}
```

---

### Delete Notification

Delete a specific notification.

**Endpoint:** `DELETE /notifications/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Notification ID

**Response (200 OK):**
```json
{
  "message": "Notification dismissed"
}
```

---

## Subscriptions Endpoints

### Get Subscriptions

Get all subscriptions for current user.

**Endpoint:** `GET /subscriptions`

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "plan_type": "premium",
    "status": "active",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Create Subscription

Create a new subscription (currently creates test subscription).

**Endpoint:** `POST /subscriptions`

**Authentication:** Required

**Request Body:**
```json
{
  "subscription": {
    "plan_type": "premium"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "plan_type": "premium",
  "status": "active",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

**Notes:**
- In production, integrate with Stripe/Razorpay
- Currently creates a 30-day active subscription

---

### Get Subscription

Get a specific subscription.

**Endpoint:** `GET /subscriptions/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (integer, required) - Subscription ID (must belong to current user)

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "plan_type": "premium",
  "status": "active",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

---

### Webhook

Handle payment webhook (for production integration).

**Endpoint:** `POST /subscriptions/webhook`

**Authentication:** Not required (webhook secret validation should be added)

**Response (200 OK):**
```json
{
  "message": "Webhook received"
}
```

---

## Admin Endpoints

All admin endpoints require admin role.

### Admin Dashboard

Get admin dashboard statistics.

**Endpoint:** `GET /admin/dashboard`

**Authentication:** Required (Admin only)

**Response (200 OK):**
```json
{
  "total_users": 1000,
  "active_subscriptions": 250,
  "total_profiles": 950,
  "pending_interests": 150
}
```

---

### Admin - Get Users

Get paginated list of all users.

**Endpoint:** `GET /admin/users`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "profile": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe"
    },
    "subscriptions": []
  }
]
```

**Notes:**
- Returns 20 users per page

---

### Admin - Get User

Get a specific user.

**Endpoint:** `GET /admin/users/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (integer, required) - User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "profile": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  },
  "subscriptions": []
}
```

---

### Admin - Update User

Update a user (email or role).

**Endpoint:** `PUT /admin/users/:id` or `PATCH /admin/users/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (integer, required) - User ID

**Request Body:**
```json
{
  "user": {
    "email": "newemail@example.com",
    "role": "admin"
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "role": "admin"
}
```

---

### Admin - Delete User

Delete a user.

**Endpoint:** `DELETE /admin/users/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (integer, required) - User ID

**Response (200 OK):**
```json
{
  "message": "User deleted"
}
```

---

### Admin - Get Subscriptions

Get paginated list of all subscriptions.

**Endpoint:** `GET /admin/subscriptions`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "plan_type": "premium",
    "status": "active",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
]
```

---

### Admin - Get Subscription

Get a specific subscription.

**Endpoint:** `GET /admin/subscriptions/:id`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (integer, required) - Subscription ID

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "plan_type": "premium",
  "status": "active",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
- Missing or invalid authentication token
- User doesn't have required permissions

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```
- Requested resource doesn't exist

### 422 Unprocessable Entity
```json
{
  "errors": ["Validation error message 1", "Validation error message 2"]
}
```
- Validation errors
- Business logic errors

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
- Server-side errors

---

## Usage Examples

### Example: Complete User Flow

```javascript
// 1. Sign Up
const signupResponse = await fetch('http://localhost:3000/api/v1/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: {
      email: 'user@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    }
  })
});
const { token } = await signupResponse.json();

// 2. Create Profile
await fetch('http://localhost:3000/api/v1/profiles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    profile: {
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '1995-01-15',
      gender: 'male',
      height: 175
    }
  })
});

// 3. Search Profiles
const searchResponse = await fetch(
  'http://localhost:3000/api/v1/search?min_age=25&max_age=35&city=mumbai',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { profiles, pagination } = await searchResponse.json();

// 4. Send Interest
await fetch('http://localhost:3000/api/v1/interests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ receiver_id: 2 })
});

// 5. Get Notifications
const notificationsResponse = await fetch(
  'http://localhost:3000/api/v1/notifications',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { notifications, unread_count } = await notificationsResponse.json();
```

### Example: Upload Profile Picture

```javascript
const formData = new FormData();
formData.append('profile_picture', fileInput.files[0]);

await fetch('http://localhost:3000/api/v1/users/1/profile_picture', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Example: Upload Multiple Photos

```javascript
const formData = new FormData();
Array.from(fileInput.files).forEach((file, index) => {
  formData.append('photos[]', file);
});

await fetch('http://localhost:3000/api/v1/profiles/current/photos', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## Notes

1. **Authentication**: Most endpoints require JWT token in Authorization header
2. **Pagination**: Search endpoints support pagination with `page` and `per_page` parameters
3. **File Uploads**: Use `multipart/form-data` for file uploads
4. **Date Format**: Use ISO 8601 format (YYYY-MM-DD) for dates
5. **Gender Filtering**: Search automatically filters by opposite gender unless specified
6. **Interest Status**: 
   - `pending` - Waiting for response
   - `accepted` - Interest accepted, can start conversation
   - `rejected` - Interest rejected
7. **Active Status**: Users are considered active if `last_seen_at` is within last 5 minutes
8. **Photo Limits**: Maximum 6 photos per profile (including profile picture)
9. **Case-Insensitive Search**: Text filters use case-insensitive partial matching
10. **Admin Access**: Admin endpoints require user role to be `admin`

---

## Support

For API support, contact: support@swipeupright.com

