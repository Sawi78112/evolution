# Supabase Integration Setup

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase public anon key (safe to use in the browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Your Supabase service role key (server-side only, keep secret)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Database Setup

Your database should already have the following tables based on your user_roles structure:

### Required Tables:
- **users table**: `user_id` (UUID), `username` (VARCHAR), `user_abbreviation` (VARCHAR), etc.
- **roles table**: `role_id` (UUID), `role_name` (VARCHAR), `role_description` (TEXT), `is_active` (BOOL), etc.
- **user_roles table**: `id` (UUID), `user_id` (UUID - references users.user_id), `role_id` (UUID - references roles.role_id)

### SQL Query Used:
The API endpoint uses the following logic to fetch Administrator users:

```sql
SELECT users.user_id, users.username, users.user_abbreviation 
FROM users 
JOIN user_roles ON users.user_id = user_roles.user_id 
JOIN roles ON user_roles.role_id = roles.role_id 
WHERE roles.role_name = 'Administrator'
ORDER BY users.username ASC
```

## Alternative: Database Function (Optional)

If the multi-step approach in the API doesn't work well, you can create a database function in Supabase:

```sql
CREATE OR REPLACE FUNCTION get_administrators()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  user_abbreviation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT users.user_id, users.username, users.user_abbreviation 
  FROM users 
  JOIN user_roles ON users.user_id = user_roles.user_id 
  JOIN roles ON user_roles.role_id = roles.role_id 
  WHERE roles.role_name = 'Administrator'
  ORDER BY users.username ASC;
END;
$$ LANGUAGE plpgsql;
```

Then update the API endpoint to use:
```javascript
const { data, error } = await supabase.rpc('get_administrators');
```

## Integration Complete

The division management modals now:

1. **Fetch real Administrator users** from your Supabase database
2. **Display format**: `username + user_abbreviation` (e.g., "Isabella Davis - ISDA")
3. **Handle loading states** with "Loading administrators..." message
4. **Handle errors** with proper error messages
5. **Support search** through the administrator list
6. **Allow "No Manager"** selection (optional field)

## Files Updated:

- `src/app/api/users/administrators/route.ts` - API endpoint to fetch administrators
- `src/features/security/hooks/useAdministratorUsers.ts` - Custom hook for data fetching
- `src/features/security/components/division-management/AddDivisionModal.tsx` - Updated to use real data
- `src/features/security/components/division-management/EditDivisionModal.tsx` - Updated to use real data

## Next Steps:

1. Add your Supabase environment variables to `.env.local`
2. Test the administrator dropdown in both Add and Edit division modals
3. Verify that the correct users with Administrator role are displayed
4. The format should be: "username - user_abbreviation" (e.g., "Isabella Davis - ISDA")

## Database Schema (Corrected):

Based on your actual database structure:

### Table: `users`
- `user_id` (UUID) - Primary key
- `username` (VARCHAR)
- `user_abbreviation` (VARCHAR)
- Other columns...

### Table: `roles`
- `role_id` (UUID) - Primary key
- `role_name` (VARCHAR) - e.g., "Administrator"
- `role_description` (TEXT)
- `is_active` (BOOL)
- Other columns...

### Table: `user_roles`
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users.user_id
- `role_id` (UUID) - Foreign key to roles.role_id
- Other columns... 