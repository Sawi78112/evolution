# Evolution 1.0 - Security Management System

A modern, comprehensive security management platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. Features role-based access control, user management, division organization, and a clean, intuitive interface.

## 🚀 Features

### 🔐 Security Management
- **User Management**: Create, edit, delete users with comprehensive role assignments
- **Division Management**: Organize users into divisions with manager hierarchy
- **Role-Based Access Control**: 5-tier role system (Administrator → Divisional Manager → Analyst → Investigator → System Support)
- **Access Restrictions**: Division-based data filtering for managers
- **Real-time User Counts**: Dynamic calculation of users per division

### 👤 Profile Management
- **Avatar Upload**: Secure image upload with cropping and storage in Supabase
- **Personal Information**: Complete profile editing with social media links
- **Authentication Integration**: Seamless auth flow with Supabase Auth

### 🎨 User Experience
- **Dark Mode Support**: Complete theming system
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Global Loading System**: Smooth authentication and role-based loading
- **Real-time Notifications**: Success, error, and info notifications
- **Advanced Search**: Full-text search across all table fields

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context + Custom Hooks
- **UI Components**: Custom component library with Framer Motion
- **Authentication**: Supabase Auth with JWT tokens

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared components
│   ├── forms/             # Form components
│   ├── ui/                # Base UI components
│   └── user-profile/      # Profile management
├── features/              # Feature-based modules
│   └── security/          # Security management feature
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
├── context/               # React Context providers
└── types/                 # TypeScript type definitions
```

## 📚 Documentation

For detailed information about specific features:

- **[Profile System Documentation](./PROFILE_SYSTEM_DOCUMENTATION.md)** - Complete guide to user profile management
- **[Security System Documentation](./SECURITY_SYSTEM_DOCUMENTATION.md)** - Comprehensive security and RBAC guide

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd evolution

# Install dependencies
npm install

# Run development server
npm run dev
```

### Database Setup
The project requires specific Supabase tables and policies. See the documentation files for detailed schema information.

## 🔑 User Roles & Permissions

### Role Hierarchy
1. **Administrator** - Full system access
2. **Divisional Manager** - Division-specific management
3. **Analyst** - Data analysis capabilities
4. **Investigator** - Investigation tools access
5. **System Support** - Technical support functions

### Access Control
- **Administrators**: Full CRUD access to all users and divisions
- **Divisional Managers**: Limited to their assigned division's users
- **Other Roles**: Read-only access with specific feature permissions

## 🎯 Key Features Implemented

✅ **Complete User Management System**
- Advanced table with search, filtering, sorting
- Modal-based CRUD operations
- Real-time status updates
- Bulk operations support

✅ **Division Management**
- Dynamic user count calculation
- Manager assignment system
- Search across all fields
- Hierarchical organization

✅ **Profile System**
- Avatar upload with cropping
- Social media integration
- Real-time profile updates
- Secure file storage

✅ **Authentication & Security**
- Role-based route protection
- Secure API endpoints
- Session management
- Division-based data filtering

✅ **Enhanced UX**
- Global loading system
- Dark mode theming
- Responsive design
- Real-time notifications

## 🚦 Current Status

The application is **production-ready** with:
- Clean codebase (removed console logs, unused files)
- Comprehensive documentation
- Stable form editing (no field reversion issues)
- Fast search and filtering
- Correct user count calculations
- Secure authentication flow

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Maintain the feature-based architecture
4. Add tests for new functionality
5. Update documentation for new features

## 📝 License

This project is part of Evolution 1.0 security management system.

---

**Evolution 1.0** - Built with ❤️ for modern security management 