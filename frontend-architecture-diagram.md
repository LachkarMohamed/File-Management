# EPGDocs Frontend - Diagramme de Conception

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                        EPGDocs Frontend                         │
│                     (React + TypeScript)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   AuthProvider  │  │  Router Setup   │  │  Notifications  │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Routing Structure                         │
│                                                                 │
│  /login ──────────► LoginPage                                  │
│  / ───────────────► MainLayout ──┐                             │
│  /group/:id ──────► │             ├─► GroupsPage               │
│  /favorites ──────► │             ├─► FolderContentsPage       │
│  /admin ──────────► │             ├─► FavoritesPage            │
│                     │             └─► AdminPage                │
│                     └─────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Structure des Composants

### 1. Layout Components
```
MainLayout
├── Header
│   ├── Logo/Brand
│   ├── Navigation Menu
│   ├── User Profile Dropdown
│   └── Admin Panel Access
└── Sidebar
    ├── All Files
    ├── Favorites
    └── Archive
```

### 2. Page Components
```
Pages/
├── LoginPage
│   ├── Login Form
│   ├── Input Components
│   └── Authentication Logic
│
├── GroupsPage
│   └── GroupCard (multiple)
│
├── FolderContentsPage
│   ├── Breadcrumb Navigation
│   ├── Search & Filters
│   ├── View Toggle (Grid/Table)
│   ├── Upload Functionality
│   ├── FileGrid
│   │   └── FileCard (multiple)
│   └── FileTable
│
├── FavoritesPage
│   └── (Reuses FolderContentsPage)
│
└── AdminPage
    ├── Tabs (Users/Groups)
    ├── UserManagement
    │   ├── User Table
    │   ├── UserEditModal
    │   └── PermissionModal
    └── GroupManagement
        ├── Group Table
        └── GroupEditModal
```

## 🔧 Architecture Technique

### 1. State Management
```
Context API
├── AuthContext
│   ├── User Authentication State
│   ├── Login/Logout Functions
│   └── User Permissions
└── (Pas d'autres contexts globaux)

Local State (useState)
├── Component-specific state
├── Form data
├── UI state (loading, errors)
└── Local data caching
```

### 2. API Layer
```
API Client (src/api/)
├── client.ts (Base API client)
├── auth.ts (Authentication)
├── files.ts (File operations)
├── groups.ts (Group management)
└── users.ts (User management)

Features:
├── Centralized error handling
├── Token management
├── Upload progress tracking
└── Response transformation
```

### 3. Notification System
```
NotificationCenter
├── Toast Notifications
├── Upload Progress
├── Error Messages
└── Success Confirmations

Notification Types:
├── Upload (with progress)
├── Success
├── Error
└── Info
```

## 📱 UI/UX Design Pattern

### 1. Design System
```
Components (src/components/ui/)
├── Button (variants: primary, secondary, outline, ghost)
├── Input (with validation states)
├── Alert (success, warning, error, info)
├── Breadcrumb
├── Tabs
└── ProgressBar

Styling:
├── Tailwind CSS
├── Responsive Design
├── Consistent Color Palette
└── Modern Animations (Framer Motion)
```

### 2. File Management Interface
```
File Operations
├── Grid View (FileGrid → FileCard)
├── Table View (FileTable)
├── Upload (Drag & Drop + Click)
├── Download
├── Favorites Toggle
└── Search & Filter

File Types Support:
├── Documents (PDF, DOC, etc.)
├── Images
├── Videos
├── Audio
└── Archives
```

## 🔐 Security & Permissions

### 1. Authentication Flow
```
Login Process
├── Username/Password Input
├── JWT Token Reception
├── Token Storage (localStorage)
├── Auto-redirect on success
└── Error handling

Protected Routes
├── Route Guards
├── Role-based Access
├── Admin Panel Restrictions
└── Automatic logout on token expiry
```

### 2. Role-based Access Control
```
User Roles
├── Superadmin (Full access)
├── Admin (User management)
└── User (File access only)

Permissions
├── Upload/Download rights
├── Group membership
├── Admin panel access
└── User management rights
```

## 📊 Data Flow

### 1. File Upload Flow
```
User Action → File Selection → Progress Tracking → API Call → Success/Error → UI Update
     │              │               │              │            │           │
     ▼              ▼               ▼              ▼            ▼           ▼
File Input → FormData Creation → Notification → Backend → Response → Refresh List
```

### 2. Authentication Flow
```
Login Form → API Call → Token Storage → Context Update → Route Redirect
     │          │           │              │               │
     ▼          ▼           ▼              ▼               ▼
Credentials → Backend → localStorage → AuthContext → Protected Pages
```

## 🎯 Key Features

### 1. File Management
- ✅ Upload avec progress tracking
- ✅ Download direct
- ✅ Favorites system
- ✅ Search et filtering
- ✅ Grid/Table view toggle
- ✅ Breadcrumb navigation

### 2. User Management (Admin)
- ✅ User CRUD operations
- ✅ Permission management
- ✅ Group assignment
- ✅ Role-based access

### 3. Group Management (Superadmin)
- ✅ Group CRUD operations
- ✅ Group archiving
- ✅ User assignment

### 4. Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop full features
- ✅ Touch-friendly interface

## 🔄 Component Lifecycle

```
App Initialization
├── AuthProvider Setup
├── Route Configuration
├── Global State Initialization
└── Notification System Setup

Page Load Sequence
├── Authentication Check
├── Route Protection
├── Data Fetching
├── Component Rendering
└── User Interaction Handling
```

## 📈 Performance Optimizations

### 1. Code Organization
- ✅ Component modularity
- ✅ Lazy loading potential
- ✅ Efficient re-renders
- ✅ Memoization where needed

### 2. API Efficiency
- ✅ Request deduplication
- ✅ Error retry logic
- ✅ Progress tracking
- ✅ Optimistic updates

---

**Technologies Utilisées:**
- React 19.1.0
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router DOM
- Headless UI
- Lucide React Icons

**Architecture Pattern:** 
Component-based architecture avec Context API pour l'état global et hooks personnalisés pour la logique métier.