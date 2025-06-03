# Automatic Role Assignment Implementation

## Overview
This document describes the implementation of automatic "Investigator" role assignment for newly created users in the Evolution application.

## How It Works

When a new user is created through the signup process, the system automatically:

1. **Creates the user** in Supabase Auth
2. **Creates the user profile** in the `users` table
3. **Automatically assigns the "Investigator" role** by inserting a record into the `user_roles` table

## Implementation Details

### Database Structure
- **`users` table**: Contains user profile information with `user_id` as primary key (UUID)
- **`roles` table**: Contains available roles with `role_id` as primary key (UUID) and `role_name` (text)
- **`user_roles` table**: Junction table linking users to roles with:
  - `id`: Primary key (UUID)
  - `user_id`: Foreign key referencing `users.user_id`
  - `role_id`: Foreign key referencing `roles.role_id`

### Key Components

#### 1. Service Role Client (`src/lib/supabase/server.ts`)
```typescript
export const createServiceSupabaseClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Elevated permissions
    // ... config
  )
}
```

#### 2. Role Service (`src/lib/auth/role-service.ts`)
```typescript
export async function assignDefaultRole(userId: string): Promise<RoleAssignmentResult> {
  // 1. Use service client for elevated permissions (bypasses RLS)
  // 2. Dynamically fetch "Investigator" role ID
  // 3. Insert user-role relationship
}
```

#### 3. Signup API Integration (`src/app/api/auth/signup/route.ts`)
```typescript
// After user profile creation:
const roleResult = await assignDefaultRole(authData.user.id)
```

### Environment Variables Required

Make sure you have the following in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Benefits of This Implementation

1. **Automatic**: No manual intervention required
2. **Dynamic**: Fetches role ID dynamically (no hardcoded values)
3. **Secure**: Uses service role key for elevated permissions
4. **Resilient**: Handles errors gracefully without failing the signup process
5. **Maintainable**: Clean separation of concerns with dedicated role service

## Security Considerations

- The `SUPABASE_SERVICE_ROLE_KEY` is used to bypass Row Level Security (RLS) policies
- This key should be kept secure and only used in server-side operations
- The service role key allows full access to the database, so it should only be used for trusted operations

## Testing the Implementation

1. Create a new user through the signup form
2. Check the `user_roles` table in your Supabase dashboard
3. Verify that a new record exists with:
   - `user_id`: The new user's UUID
   - `role_id`: The "Investigator" role's UUID

## Troubleshooting

If role assignment fails:

1. **Check environment variables**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is properly set
2. **Check role existence**: Verify "Investigator" role exists in the `roles` table
3. **Check database permissions**: Ensure the service role can access the tables
4. **Check logs**: Look for error messages in the server console

The user will still be created successfully even if role assignment fails - they can be assigned roles manually later. 