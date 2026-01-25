# Judge Panel - Hackathon Evaluation Portal

This is the frontend for the Judge Panel of the GLA University Hackathon Evaluation System.

## Features

- **Secure Authentication**: Judges can log in using credentials stored in the database
- **Protected Routes**: All judge portal pages are protected and require authentication
- **JWT Token Management**: Secure token-based authentication with automatic logout
- **Responsive Design**: Modern UI that works on all devices

## Setup Instructions

### 1. Backend Setup

First, ensure your backend server is running:

```bash
cd Backend
# Activate virtual environment (if using one)
# .venv/Scripts/activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start MongoDB (if not already running)
# On Windows, you can use the provided batch file:
start_mongodb.bat

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Create Test Judge

Before testing the frontend, create a test judge in the database:

```bash
cd Backend
python create_test_judge.py
```

This will create a test judge with:
- **Email**: judge@test.com
- **Password**: test123

### 3. Frontend Setup

```bash
cd "judge panel"
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing the Authentication

1. **Open the application** in your browser at `http://localhost:3000`
2. **Use the test credentials**:
   - Username: `testjudge`
   - Password: `test123`
3. **Or use your existing database credentials**:
   - Username: `judge01`, Password: `GLA_01`
   - Username: `judge02`, Password: `GLA_02`
4. **Click Sign In** - you should be redirected to the dashboard
5. **Test protected routes** - try accessing `/evaluate`, `/my-evaluations`, etc.
6. **Test logout** - click the logout button in the header

## How It Works

### Authentication Flow

1. **Login**: User enters username/password
2. **Backend Validation**: Credentials are sent to `/auth/judge/login`
3. **Database Lookup**: Backend searches for judge by username in `judges` collection
4. **Password Verification**: Plain text password comparison (as per your DB structure)
5. **JWT Token**: Backend returns a JWT token on successful authentication
6. **Token Storage**: Token is stored in localStorage
7. **Protected Routes**: All judge portal routes check for valid token
8. **Automatic Logout**: Token expiration or logout clears credentials

### Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Tokens**: Secure, time-limited authentication tokens
- **Protected Routes**: Unauthenticated users are redirected to login
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

## API Endpoints Used

- `POST /auth/judge/login` - Judge authentication
- `GET /judge/profile` - Get judge profile
- `GET /judge/assigned-teams` - Get teams assigned to judge
- `POST /judge/evaluate/{team_id}` - Submit evaluation
- `GET /judge/evaluations` - Get submitted evaluations

## File Structure

```
judge panel/src/
├── components/
│   ├── SignIn.jsx          # Login form with backend authentication
│   ├── ProtectedRoute.jsx  # Route protection component
│   ├── Header.jsx          # Header with logout functionality
│   └── ...                 # Other components
├── utils/
│   └── api.js              # API utility functions
└── App.jsx                 # Main app with protected routes
```

## Troubleshooting

### Common Issues

1. **"Database connection not available"**
   - Ensure MongoDB is running
   - Check environment variables in `.env` file

2. **"Login failed"**
   - Verify backend server is running on port 8000
   - Check if test judge was created successfully
   - Verify credentials: `judge@test.com` / `test123`

3. **CORS errors**
   - Backend CORS is configured for `http://localhost:3000`
   - Ensure frontend is running on the correct port

4. **"Network error"**
   - Check if backend server is accessible
   - Verify network connectivity

### Debug Mode

To see detailed error messages, check the browser console and backend server logs.

## Production Considerations

For production deployment:

1. **Use HTTPS** for all communications
2. **Implement httpOnly cookies** instead of localStorage for tokens
3. **Add token refresh** mechanism
4. **Implement rate limiting** on authentication endpoints
5. **Add logging** for security events
6. **Use environment variables** for API URLs

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify backend server logs
3. Ensure all dependencies are installed
4. Check MongoDB connection status 