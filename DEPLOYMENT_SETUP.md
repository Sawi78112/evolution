# Deployment Setup Guide

## Environment Variables

For production deployment, make sure to set the following environment variables in your Vercel dashboard:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables
```
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

**Note:** If `NEXT_PUBLIC_SITE_URL` is not set, the application will automatically detect the correct domain from request headers in production.

## Email Confirmation Fix

The email confirmation links will now automatically use the correct production domain instead of localhost:3000.

### How it works:
1. **Server-side (API routes)**: Uses request headers to detect the production domain
2. **Client-side (auth service)**: Uses `window.location.origin` to get the current domain
3. **Fallback**: Uses `NEXT_PUBLIC_SITE_URL` environment variable if available
4. **Development**: Falls back to `http://localhost:3000`

## Supabase Configuration

Make sure your Supabase project is configured with the correct redirect URLs:

1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Add your production domain to the "Site URL" field: `https://your-domain.com`
4. Add your auth callback URL to "Redirect URLs": `https://your-domain.com/auth/callback`

## Testing

After deployment:
1. Try creating a new account
2. Check that the confirmation email contains the correct production URL
3. Click the confirmation link to verify it redirects properly
4. Ensure the auth callback page loads correctly

## Troubleshooting

If you still see localhost:3000 in emails:
1. Check that environment variables are set correctly in Vercel
2. Verify Supabase URL configuration
3. Check browser network tab for the actual request being made during signup 