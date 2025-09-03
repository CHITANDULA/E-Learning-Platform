# E-Learning Platform Backend

This is the backend API for the E-Learning Platform web application.  
Built with Node.js, Express.js, and MySQL.

## Prerequisites

- Node.js (v14 or above recommended)
- MySQL installed locally or access to a remote MySQL database
- Google Cloud Platform account (for Google Meet integration)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/GraceMonde/E-Learning-Platform
cd E-Learning-Platform/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
- Database credentials
- JWT secret
- Google service account details (for Meet integration)
- Port number

## Environment Variables

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=elearning_platform
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
PORT=5000
```

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MySQL connection setup
│   └── googleMeet.js      # Google Meet integration
├── models/
│   └── lectureStore.js    # Lecture data models
├── routes/
│   ├── analytics.js       # Analytics endpoints
│   ├── announcements.js   # Announcement management
│   ├── assignments.js     # Assignment handling
│   ├── auth.js           # Authentication
│   ├── classes.js        # Class management
│   ├── lectures.js       # Lecture scheduling
│   ├── materials.js      # Learning materials
│   ├── notifications.js  # User notifications
│   ├── profile.js        # User profiles
│   ├── threads.js        # Discussion threads
│   └── user.js           # User management
├── tests/
│   ├── auth.test.js      # Authentication tests
│   ├── profile.test.js   # Profile tests
│   └── user.test.js      # User tests
├── E-LearningDB.sql      # Database schema
├── server.js             # Main Express server
└── package.json          # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Lectures
- `GET /api/lectures` - List lectures
- `POST /api/lectures` - Schedule new lecture
- `GET /api/lectures/:id` - Get lecture details

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Materials
- `GET /api/materials` - List learning materials
- `POST /api/materials` - Upload material
- `GET /api/materials/:id` - Download material

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## Testing

Run the test suite:
```bash
npm test
```

## Google Meet Integration

### Setup

1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable the Google Calendar API and Google Meet API
   - Create a service account
   - Download the service account key (JSON)

2. **Environment Configuration**:
   - Extract the client email and private key from the JSON file
   - Add them to your `.env` file:
   ```bash
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   ```

### Available Endpoints

- `POST /api/lectures/meet` - Create a new Google Meet session
  ```json
  {
    "summary": "Math Class - Algebra",
    "startTime": "2025-09-03T14:00:00Z"
  }
  ```
  Response:
  ```json
  {
    "id": "meeting-id",
    "meetLink": "https://meet.google.com/xxx-yyyy-zzz"
  }
  ```

### Features
- Automatic Google Meet link generation
- Calendar integration for scheduled sessions
- Fallback to mock links in development
- 60-minute default meeting duration
- Unique meeting IDs for each session

### Error Handling
- Graceful fallback if Google credentials are missing
- Automatic token refresh
- Clear error messages for troubleshooting

### Development Notes
- Test mode generates mock meeting links
- Real Google Meet integration only works with proper credentials
- Meeting links are valid for 24 hours after creation

For more details about the implementation, check `config/googleMeet.js`.

