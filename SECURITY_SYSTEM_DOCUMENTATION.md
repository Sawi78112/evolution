# Evolution 1.0 - Security System Documentation

## Overview

The Evolution 1.0 Security System provides comprehensive user and division management with role-based access control (RBAC). It ensures secure access to system resources based on user roles and maintains organizational hierarchy through division management.

## Architecture

### Core Components

```
Security System/
├── features/
│   └── security/
│       ├── components/
│       │   ├── user-management/
│       │   │   ├── SecurityTable.tsx          # Main user management table
│       │   │   ├── AddUserModal.tsx           # Add new user modal
│       │   │   ├── EditUserModal.tsx          # Edit user modal
│       │   │   ├── DeleteModal.tsx            # Delete confirmation modal
│       │   │   ├── ActionButtons.tsx          # User action buttons
│       │   │   └── SearchAndFilters.tsx       # Search and filter controls
│       │   └── division-management/
│       │       ├── DivisionTable.tsx          # Main division table
│       │       ├── AddDivisionModal.tsx       # Add division modal
│       │       ├── EditDivisionModal.tsx      # Edit division modal
│       │       ├── DeleteDivisionModal.tsx    # Delete division modal
│       │       └── components/
│       │           ├── DivisionTableRow.tsx   # Division table row
│       │           ├── DivisionMobileCard.tsx # Mobile division card
│       │           └── DivisionTableHeader.tsx # Table header
│       ├── hooks/
│       │   ├── useSecurityTable.ts           # User table state management
│       │   ├── useDivisions.ts               # Division data management
│       │   ├── useUsersList.ts               # User list management
│       │   ├── useDivisionManagers.ts        # Division manager users
│       │   ├── useDivisionsList.ts           # Division list for forms
│       │   └── useCurrentUserDivision.ts     # Current user context
│       ├── types/
│       │   └── index.ts                      # TypeScript interfaces
│       ├── constants/
│       │   └── index.ts                      # Role and status configurations
│       ├── utils/
│       │   └── index.ts                      # Utility functions
│       └── index.ts                          # Feature exports
├── context/
│   ├── AuthContext.tsx                       # Authentication context
│   └── RoleContext.tsx                       # Role-based access context
├── components/
│   └── auth/
│       └── RoleGuard.tsx                     # Role-based component protection
└── api/
    ├── users/
    │   └── route.ts                          # User management API
    └── divisions/
        └── route.ts                          # Division management API
```

## Role-Based Access Control (RBAC)

### 1. Role Hierarchy

The system implements a hierarchical role structure with the following roles:

#### Administrator (Highest Privilege)
- **Access Level**: Global system access
- **Permissions**:
  - Manage all users and divisions
  - Create, edit, delete any user
  - Create, edit, delete any division
  - Assign any role to users
  - View all system data
  - System configuration access

#### Divisional Manager
- **Access Level**: Division-specific access
- **Permissions**:
  - Manage users within assigned division only
  - Create users in their division
  - Edit users in their division (except Administrators)
  - View division-specific data only
  - Cannot manage divisions or other division's users

#### Analyst
- **Access Level**: Limited operational access
- **Permissions**:
  - View assigned cases and data
  - Create and edit case reports
  - Access analytical tools
  - Cannot manage users or divisions

#### Investigator
- **Access Level**: Field operations access
- **Permissions**:
  - View and update case investigations
  - Access field data collection tools
  - Submit investigation reports
  - Cannot manage users or divisions

#### System Support
- **Access Level**: Technical support access
- **Permissions**:
  - View system logs and diagnostics
  - Access support tools
  - Cannot access case data or manage users

### 2. Role Implementation

#### Role Type Definition
```typescript
type RoleType = 
  | "Administrator"
  | "Divisional Manager" 
  | "Analyst"
  | "Investigator"
  | "System Support";
```

#### Role Configuration
```typescript
const ROLE_COLORS = {
  "Administrator": { color: "bg-red-500", abbr: "AD" },
  "Divisional Manager": { color: "bg-blue-500", abbr: "DM" },
  "Analyst": { color: "bg-green-500", abbr: "AN" },
  "Investigator": { color: "bg-yellow-500", abbr: "IN" },
  "System Support": { color: "bg-purple-500", abbr: "SS" }
};
```

#### Role Guard Component
```typescript
interface RoleGuardProps {
  allowedRoles: RoleType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback 
}) => {
  const { userRoles } = useRoleContext();
  
  const hasPermission = allowedRoles.some(role => 
    userRoles.includes(role)
  );
  
  return hasPermission ? children : (fallback || null);
};
```

## User Management System

### 1. User Data Structure

#### User Interface
```typescript
interface UserData {
  id: string;
  username: string;
  abbreviation: string;
  avatar_url?: string;
  division: string;
  manager: string;
  lastLogin?: string;
  status: StatusType;
  email: string;
  roles: RoleType[];
  officePhone: string;
  homePhone?: string;
  homeAddress?: string;
}
```

#### Status Types
```typescript
type StatusType = "Active" | "Transferred" | "Inactive" | "Canceled";
```

### 2. User Management Features

#### Create New User
- **Form Validation**: Real-time validation of all required fields
- **Role Assignment**: Multi-role selection with role restrictions
- **Division Assignment**: Automatic manager assignment based on division
- **Password Generation**: Secure password generation or custom password
- **Contact Information**: Email, phone, and address management

#### Edit Existing User
- **Selective Editing**: Edit specific user attributes
- **Role Modification**: Update user roles based on permissions
- **Status Management**: Change user status (Active, Inactive, etc.)
- **Division Transfer**: Move users between divisions
- **Contact Updates**: Update contact information

#### User Search and Filtering
- **Multi-field Search**: Search across username, email, division, roles
- **Advanced Filters**: Filter by status, role, division, manager
- **Real-time Results**: Instant search results as user types
- **Pagination**: Efficient pagination for large user lists

### 3. Access Control Implementation

#### Permission Checking
```typescript
const useRoleContext = () => {
  const context = useContext(RoleContext);
  
  const hasRole = (role: RoleType): boolean => {
    return context.userRoles.includes(role);
  };
  
  const isAdmin = (): boolean => {
    return context.userRoles.includes("Administrator");
  };
  
  const isDivisionalManager = (): boolean => {
    return context.userRoles.includes("Divisional Manager");
  };
  
  return {
    userRoles: context.userRoles,
    hasRole,
    isAdmin,
    isDivisionalManager
  };
};
```

#### Division-Based Filtering
```typescript
// Divisional Managers see only their division's users
if (currentUserRole === 'Divisional Manager') {
  if (currentUserDivision) {
    query = query.eq('division_id', currentUserDivision);
  } else {
    // No division assigned - show no users
    return { data: [], pagination: { ... }, };
  }
}
```

## Division Management System

### 1. Division Data Structure

#### Division Interface
```typescript
interface DivisionData {
  id: string;
  name: string;
  abbreviation: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  manager: {
    id: string;
    name: string;
    abbreviation: string;
    image: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    abbreviation: string;
  } | null;
  totalUsers: number;
}
```

### 2. Division Management Features

#### Create Division
- **Division Information**: Name, abbreviation, description
- **Manager Assignment**: Assign division manager from eligible users
- **Status Setting**: Set initial division status
- **Creator Tracking**: Track who created the division

#### Edit Division
- **Update Information**: Change division name, abbreviation
- **Manager Reassignment**: Change division manager
- **Status Management**: Activate or deactivate divisions
- **Audit Trail**: Track all changes with timestamps

#### Division Metrics
- **User Count**: Real-time count of users in each division
- **Manager Information**: Display assigned manager details
- **Status Tracking**: Monitor division activity status
- **Creation History**: Track when and by whom divisions were created

### 3. Division-User Relationships

#### Manager Assignment
- **Eligible Managers**: Only users with "Divisional Manager" role
- **Single Manager**: Each division can have one active manager
- **Manager Transfer**: Transfer management between users
- **Manager Removal**: Remove manager assignment if needed

#### User Assignment
- **Division Membership**: Users belong to specific divisions
- **User Count Calculation**: Real-time count of division members
- **Transfer Process**: Move users between divisions
- **Access Control**: Division-based data access restrictions

## Security Features

### 1. Authentication Security

#### Session Management
- **Secure Sessions**: HTTP-only cookies for session storage
- **Session Timeout**: Automatic timeout for inactive sessions
- **Session Refresh**: Automatic session renewal for active users
- **Multi-device Support**: Manage sessions across multiple devices

#### Password Security
- **Password Policies**: Minimum complexity requirements
- **Password Hashing**: Secure bcrypt hashing
- **Password Reset**: Secure password reset flow
- **Password History**: Prevent password reuse

### 2. Authorization Security

#### Role-Based Access
- **Granular Permissions**: Fine-grained permission control
- **Role Inheritance**: Hierarchical permission inheritance
- **Dynamic Permissions**: Runtime permission evaluation
- **Permission Caching**: Efficient permission lookup

#### Data Access Control
- **Row-Level Security**: Database-level access control
- **Column-Level Security**: Field-specific access restrictions
- **API Endpoint Protection**: Secured API endpoints
- **Resource Isolation**: Prevent unauthorized data access

### 3. Audit and Logging

#### Activity Logging
- **User Actions**: Log all user management actions
- **Data Changes**: Track all data modifications
- **Access Attempts**: Log successful and failed access attempts
- **System Events**: Log system-level security events

#### Audit Trail
- **Change History**: Complete history of all changes
- **User Attribution**: Track who made each change
- **Timestamp Tracking**: Precise timing of all actions
- **Compliance Reporting**: Generate compliance reports

## API Architecture

### 1. User Management API

#### Endpoints
```typescript
// Get users with filtering and pagination
GET /api/users
Query: page, limit, search, status, role, division
Response: { data: UserData[], pagination: PaginationData }

// Create new user
POST /api/users
Body: UserFormData
Response: { success: boolean, user: UserData }

// Update user
PATCH /api/users/:id
Body: Partial<UserFormData>
Response: { success: boolean, user: UserData }

// Delete user
DELETE /api/users/:id
Response: { success: boolean, message: string }
```

#### Role-Based API Protection
```typescript
// Middleware to check user permissions
const requireRole = (allowedRoles: RoleType[]) => {
  return async (req: NextRequest, res: NextResponse) => {
    const userRoles = await getCurrentUserRoles(req);
    const hasPermission = allowedRoles.some(role => 
      userRoles.includes(role)
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }
    
    // Continue to next handler
  };
};
```

### 2. Division Management API

#### Endpoints
```typescript
// Get divisions with filtering and pagination
GET /api/divisions
Query: page, limit, search, status, sortField, sortDirection
Response: { data: DivisionData[], pagination: PaginationData }

// Create new division
POST /api/divisions
Body: { name, abbreviation, managerId, createdById }
Response: { success: boolean, division: DivisionData }

// Update division
PATCH /api/divisions
Body: { divisionId, name?, abbreviation?, managerId?, status? }
Response: { success: boolean, division: DivisionData }

// Delete division
DELETE /api/divisions
Body: { divisionId }
Response: { success: boolean, message: string }
```

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  user_abbreviation VARCHAR(10) NOT NULL,
  office_email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  division_id UUID REFERENCES divisions(division_id),
  manager_user_id UUID REFERENCES users(user_id),
  user_status VARCHAR(20) DEFAULT 'Active',
  office_phone VARCHAR(20),
  home_phone VARCHAR(20),
  home_address TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Divisions Table
```sql
CREATE TABLE divisions (
  division_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  abbreviation VARCHAR(10) NOT NULL UNIQUE,
  manager_user_id UUID REFERENCES users(user_id),
  status VARCHAR(20) DEFAULT 'Active',
  created_by UUID REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. User Roles Table
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(user_id),
  role_name VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(user_id),
  PRIMARY KEY (user_id, role_name)
);
```

## Performance Optimization

### 1. Query Optimization
- **Indexed Searches**: Database indexes on frequently searched fields
- **Pagination**: Efficient pagination with offset/limit
- **Selective Loading**: Load only required data fields
- **Caching Strategy**: Redis caching for frequently accessed data

### 2. Frontend Optimization
- **Virtual Scrolling**: Handle large datasets efficiently
- **Debounced Search**: Prevent excessive API calls
- **Memoization**: Cache computed values and components
- **Lazy Loading**: Load components only when needed

## Error Handling

### 1. Validation Errors
- **Client-Side Validation**: Real-time form validation
- **Server-Side Validation**: Backend data validation
- **User-Friendly Messages**: Clear error communication
- **Field-Level Feedback**: Specific field error indicators

### 2. Security Errors
- **Authentication Failures**: Handle login/session errors
- **Authorization Failures**: Permission denied handling
- **Rate Limiting**: Prevent abuse with rate limiting
- **Input Sanitization**: Prevent injection attacks

## Monitoring and Analytics

### 1. System Metrics
- **User Activity**: Track user engagement and usage
- **Performance Metrics**: Monitor system performance
- **Error Rates**: Track and analyze error occurrences
- **Security Events**: Monitor security-related activities

### 2. Business Metrics
- **User Growth**: Track user registration and activation
- **Division Metrics**: Monitor division activity and health
- **Role Distribution**: Analyze role assignment patterns
- **Access Patterns**: Understand system usage patterns

## Future Enhancements

### 1. Advanced Features
- **Single Sign-On (SSO)**: Integration with external identity providers
- **Multi-Factor Authentication (MFA)**: Enhanced security with MFA
- **Advanced Auditing**: Enhanced audit trails and compliance
- **API Rate Limiting**: Advanced rate limiting and throttling

### 2. Scalability Improvements
- **Microservices Architecture**: Break down into smaller services
- **Event-Driven Architecture**: Implement event sourcing
- **Advanced Caching**: Implement distributed caching
- **Load Balancing**: Implement load balancing strategies

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check user roles and permissions
2. **Division Manager Assignment**: Ensure user has correct role
3. **User Search Not Working**: Verify search parameters and filters
4. **Division User Count Incorrect**: Check division assignment data

### Support and Maintenance
- **Log Analysis**: Comprehensive logging for troubleshooting
- **Health Checks**: System health monitoring endpoints
- **Backup Procedures**: Regular data backup and recovery
- **Update Procedures**: Safe system update processes 