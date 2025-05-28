# Avatar System Implementation

## Overview
This document describes the implementation of the automated user avatar system in the Evolution application. When a new user is created, a corresponding record is automatically inserted into the `user_avatars` table with a default avatar.

## Database Schema

### `user_avatars` Table Structure
```sql
CREATE TABLE user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) NOT NULL,
  avatar_url TEXT DEFAULT '/images/default-avatar.svg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Components

### 1. User Service Functions (`src/lib/supabase/user-service.ts`)

#### `createUserAvatar(userData: CreateUserAvatarData)`
- Creates a new user_avatars record when a user is created
- Automatically sets default avatar URL
- Returns success/error status

#### `updateUserAvatar(userId: string, avatarUrl: string)`
- Updates the avatar URL for an existing user
- Updates the `updated_at` timestamp
- Returns success/error status

#### `getUserAvatar(userId: string)`
- Retrieves the avatar URL for a specific user
- Returns avatar URL with fallback to default
- Handles errors gracefully

### 2. Signup Process Integration (`src/app/api/auth/signup/route.ts`)

The signup API route now automatically:
1. Creates the user in Supabase Auth
2. Creates the user profile in the `users` table
3. Assigns default roles
4. **Creates a user_avatars record with default avatar**

```typescript
// Create user_avatars record with default avatar
const avatarResult = await createUserAvatar({
  userId: authData.user.id,
  avatarUrl: '/images/default-avatar.svg'
});
```

### 3. Avatar Hook (`src/hooks/useUserData.ts`)

#### `useUserAvatar()`
A React hook that provides:
- `avatarUrl`: Current user's avatar URL
- `loading`: Loading state
- `error`: Error state if any
- `refreshAvatar()`: Function to reload avatar

### 4. Component Integration

#### UserMetaCard Component
- Displays user avatar with edit functionality
- Handles avatar upload and cropping
- Updates user_avatars table when new avatar is uploaded
- Uses toast notifications for user feedback

#### UserDropdown Component
- Displays user avatar in header dropdown
- Automatically loads from user_avatars table
- Updates when avatar changes

## User Flow

### New User Registration
1. User fills signup form
2. API creates auth user
3. API creates user profile
4. **API automatically creates user_avatars record**
5. User sees default avatar immediately

### Avatar Upload
1. User clicks on avatar in profile
2. User selects/crops image
3. Image uploads to Supabase storage
4. user_avatars table is updated with new URL
5. UI refreshes to show new avatar
6. Success notification is displayed

## Default Avatar

The system uses a modern, fashionable default avatar located at `/images/default-avatar.svg` featuring:
- Professional gradient background (purple to blue)
- Clean person silhouette
- Modern visual effects and highlights
- SVG format for scalability

## Error Handling

The system includes comprehensive error handling:
- Non-blocking: User creation succeeds even if avatar record creation fails
- Graceful fallbacks: Default avatar shown if custom avatar fails to load
- User feedback: Toast notifications for upload success/failure
- Logging: Detailed console logs for debugging

## Benefits

1. **Automatic Setup**: Every new user gets an avatar record automatically
2. **Consistent Experience**: All users have a professional default avatar
3. **Scalable**: Uses Supabase storage for avatar files
4. **User-Friendly**: Modern upload interface with cropping
5. **Reliable**: Comprehensive error handling and fallbacks

## Usage Examples

### Using the Avatar Hook
```typescript
import { useUserAvatar } from '@/hooks/useUserData';

function MyComponent() {
  const { avatarUrl, loading, refreshAvatar } = useUserAvatar();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <img src={avatarUrl} alt="User Avatar" />
  );
}
```

### Updating Avatar Programmatically
```typescript
import { updateUserAvatar } from '@/lib/supabase/user-service';

const result = await updateUserAvatar(userId, newAvatarUrl);
if (result.success) {
  console.log('Avatar updated successfully');
}
```

## Testing

To test the avatar system:
1. Create a new user account
2. Check that user_avatars table has a new record
3. Upload a custom avatar
4. Verify avatar appears in profile and header
5. Check that avatar persists across page refreshes

## Future Enhancements

- Avatar image compression before upload
- Multiple avatar size variants (thumbnail, medium, large)
- Avatar history/versioning
- Bulk avatar operations for admin users
- Integration with external avatar services (Gravatar, etc.) 