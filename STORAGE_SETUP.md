# Storage Setup Guide

## ✅ Setup Complete
The `avatar` bucket already exists and permissions have been enabled. The avatar upload system should work out of the box.

## How It Works
- Users can upload avatars through the profile page
- Files are stored in the `avatar` bucket in Supabase Storage
- Avatar URLs are saved to the `users.avatar_url` field in the database
- Default avatar is shown when no custom avatar is uploaded

## Testing
1. Go to your profile page
2. Click the camera icon on your avatar
3. Select an image file
4. The avatar should upload and display immediately

## Troubleshooting

### Common Issues:
1. **Permission denied**: Check that storage permissions are properly enabled
2. **File too large**: Default limit is typically 5MB
3. **Invalid file type**: Only images are allowed (jpeg, png, webp, gif)
4. **Network issues**: Check your internet connection

### Console Logs
The system provides detailed console logs:
- 🚀 Starting upload
- 📁 File details
- 📝 Upload filename
- ✅ Success messages
- ❌ Error details

### Manual Bucket Setup (Reference Only)
If you ever need to recreate the bucket:

1. **Go to Supabase Dashboard**
   - Navigate to **Storage** in the left sidebar

2. **Create Avatar Bucket**
   - Click **"New bucket"**
   - Name: `avatar`
   - Make it **Public** (check the public checkbox)
   - Click **"Create bucket"**

3. **Enable Permissions**
   - Allow authenticated users to upload
   - Allow public read access 