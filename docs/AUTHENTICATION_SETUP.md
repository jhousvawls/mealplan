# Authentication Setup Guide

## Overview

The Meal Planning App now includes a complete authentication system using Google OAuth via Supabase. This document outlines the implementation and setup process.

## Authentication Architecture

### Components

1. **AuthContext** (`frontend/src/contexts/AuthContext.tsx`)
   - Centralized authentication state management
   - Google OAuth integration with Supabase
   - Session persistence and real-time auth state changes
   - Sign in/out functionality with proper error handling

2. **LoginPage** (`frontend/src/components/features/auth/LoginPage.tsx`)
   - Beautiful Apple-inspired design
   - Google OAuth "Continue with Google" button
   - Feature highlights and branding
   - Error handling and loading states

3. **ProtectedRoute** (`frontend/src/components/features/auth/ProtectedRoute.tsx`)
   - Route protection for authenticated users only
   - Automatic redirect to login for unauthenticated users
   - Loading states during authentication checks

4. **AuthCallback** (`frontend/src/components/features/auth/AuthCallback.tsx`)
   - Handles OAuth redirect flow
   - Processes authentication tokens
   - Error handling for failed authentication

### Authentication Flow

```
1. User visits protected route
2. ProtectedRoute checks authentication status
3. If not authenticated → redirect to /login
4. User clicks "Continue with Google"
5. Redirect to Google OAuth
6. Google redirects to Supabase
7. Supabase redirects to /auth/callback
8. AuthCallback processes tokens
9. User redirected to intended destination
10. User profile automatically created in database
```

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and People API
4. Configure OAuth consent screen:
   - App name: "Meal Planner"
   - User support email: Your email
   - Developer contact email: Your email
5. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: "Meal Planner Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5177` (development)
     - `https://your-domain.com` (production)
   - Authorized redirect URIs:
     - `https://zgxhwqvmbhpdvegqqndk.supabase.co/auth/v1/callback`
     - `http://localhost:5177/auth/callback`

### 2. Supabase Configuration

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
4. Save configuration

### 3. Database Setup

The authentication system requires the database schema to be set up:

```sql
-- User profiles are automatically created via trigger
-- See database/migrations/001_initial_schema.sql for complete schema
```

### 4. Environment Variables

Ensure your `frontend/.env.local` contains:

```bash
VITE_SUPABASE_URL=https://zgxhwqvmbhpdvegqqndk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

## Features

### Implemented Features

- ✅ Google OAuth authentication
- ✅ Protected routes
- ✅ User session management
- ✅ Automatic user profile creation
- ✅ Real-time auth state changes
- ✅ Beautiful login UI
- ✅ Error handling
- ✅ Loading states
- ✅ Sign out functionality

### User Experience

- **Seamless Login**: One-click Google authentication
- **Session Persistence**: Users stay logged in across browser sessions
- **Protected Content**: Automatic redirect to login for unauthenticated users
- **User Display**: Real user information shown in sidebar
- **Graceful Errors**: User-friendly error messages

## Security Features

### Row Level Security (RLS)

All database tables have RLS policies ensuring users can only access their own data:

```sql
-- Users can only see their own recipes
CREATE POLICY "Users can view own recipes" ON recipes
    FOR SELECT USING (auth.uid() = owner_id);
```

### Authentication Checks

- All routes except `/login` and `/auth/callback` are protected
- Authentication state is checked on app load
- Real-time auth state changes are handled
- Proper token management via Supabase

## Testing

### Manual Testing Checklist

- [ ] Visit app when not authenticated → redirected to login
- [ ] Click "Continue with Google" → Google OAuth opens
- [ ] Complete Google authentication → redirected to dashboard
- [ ] User info displays correctly in sidebar
- [ ] Sign out works and redirects to login
- [ ] Refresh page while authenticated → stays logged in
- [ ] Database user profile created automatically

### Development Testing

```bash
# Start the development server
cd frontend
npm run dev

# Visit http://localhost:5177/
# Test authentication flow
```

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**
   - Check Google Cloud Console redirect URIs match exactly
   - Ensure no trailing slashes

2. **"invalid_client"**
   - Verify Client ID and Secret in Supabase
   - Check Google OAuth credentials are correct

3. **Authentication not persisting**
   - Check Supabase configuration
   - Verify environment variables

4. **User profile not created**
   - Check database trigger is set up
   - Verify RLS policies allow user creation

### Debug Mode

Enable debug logging in AuthContext:

```typescript
// Add to AuthContext for debugging
console.log('Auth state changed:', event, session?.user?.email);
```

## Next Steps

With authentication complete, you can now:

1. **Implement Real Data**: Replace mock data with Supabase queries
2. **Add User Preferences**: Store user settings and preferences
3. **Implement Sharing**: Use user IDs for meal plan sharing
4. **Add Profile Management**: Allow users to update their profiles
5. **Implement Households**: Multi-user household functionality

## API Integration

The authentication system provides the authenticated user context throughout the app:

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  // user.id - for database queries
  // user.email - user's email
  // user.user_metadata.full_name - user's name
  // user.user_metadata.avatar_url - user's avatar
}
```

This enables all future features to be user-specific and secure.
