# Admin Pages Guide

## Overview

This guide covers all the admin pages that have been implemented in the ISO Document Management System.

## Features Implemented

### 1. Persistent Login State ✅
- Login state is automatically saved to localStorage
- Users remain logged in even after closing the browser
- Token is automatically included in all API requests
- Auto-logout on 401 (Unauthorized) responses

### 2. Admin Pages

All admin pages are protected and only accessible to users with the `admin` role.

#### Document Sets (`/admin/document-sets`)
- View all document sets in a table
- Create new document sets
- Edit existing document sets
- Delete document sets
- Assign access groups to document sets
- Features:
  - Title, category, description
  - Sort order for organizing sets
  - Group-based access control

#### Documents (`/admin/documents`)
- View all documents across all sets
- Create new documents
- Edit document metadata
- Delete documents
- Upload new versions
- View/download current version
- Features:
  - Document title and code
  - Association with document sets
  - Version tracking
  - File upload with version notes

#### Users (`/admin/users`)
- View all users in the system
- Create new users
- Edit user details
- Delete users (except yourself)
- Assign users to groups
- Features:
  - Name, email, password
  - Role selection (Admin/User)
  - Active/Inactive status
  - Group membership management
  - Password protection (leave blank to keep current when editing)

#### Groups (`/admin/groups`)
- View all groups
- Create new groups
- Edit group details
- Delete groups
- Features:
  - Group name
  - Description
  - Used for access control to document sets

#### Audit Logs (`/admin/audit-logs`)
- View all system activities
- Track user actions
- Filter by action type
- Filter by entity type
- Expandable rows to view details
- Features:
  - Timestamp tracking
  - User identification
  - Action type (color-coded)
  - Entity type and ID
  - IP address logging
  - User agent tracking
  - Detailed JSON payload view

## Navigation

The sidebar menu is organized as:

### For All Users:
- Dashboard
- My Documents

### For Admin Users (Additional):
- **Administration Section**
  - Document Sets
  - Documents
  - Users
  - Groups
  - Audit Logs

## Translation Support

All pages support both English and Malay languages:
- English (en)
- Malay (ms)

Switch language using the language selector in the top-right corner.

## User Experience Features

### 1. Responsive Design
- Mobile-friendly layout
- Collapsible sidebar
- Responsive tables

### 2. Error Handling
- User-friendly error messages
- Snackbar notifications for success/error
- Form validation

### 3. Loading States
- Loading spinners for async operations
- Disabled buttons during operations

### 4. Confirmation Dialogs
- Confirm before deleting items
- Prevent accidental data loss

### 5. Smart Forms
- Auto-trim whitespace
- Number validation
- Email validation
- Required field indicators

## Color Scheme

The system uses UUM's official colors:
- **Primary (Blue)**: `#003366` - Navigation, headers, primary buttons
- **Secondary (Yellow)**: `#FFD700` - Accents, highlights, secondary elements

## How to Use Each Page

### Document Sets Management

1. **Create a Document Set:**
   - Click "Create Document Set"
   - Enter title (required)
   - Add category and description (optional)
   - Set sort order (default: 0)
   - Select which groups can access this set
   - Click "Create"

2. **Edit a Document Set:**
   - Click the edit icon (pencil) on any row
   - Modify the fields
   - Click "Update"

3. **Delete a Document Set:**
   - Click the delete icon (trash) on any row
   - Confirm the deletion

### Documents Management

1. **Create a Document:**
   - Click "Create Document"
   - Enter title and document code (both required)
   - Select which document set it belongs to
   - Click "Create"

2. **Upload a Version:**
   - Click the upload icon on any document row
   - Select a file (up to 1GB, any file type)
   - Optionally add version notes
   - Click "Upload"

3. **View/Download:**
   - Click the eye icon to view in browser
   - Click the download icon to download the file

### Users Management

1. **Create a User:**
   - Click "Create User"
   - Enter name, email, and password (all required)
   - Select role (User or Admin)
   - Set active status
   - Click "Create"

2. **Manage User Groups:**
   - Click the group icon on any user row
   - Select/deselect groups
   - Click "Save"

3. **Edit a User:**
   - Click the edit icon
   - Modify fields
   - Leave password blank to keep current
   - Click "Update"

### Groups Management

1. **Create a Group:**
   - Click "Create Group"
   - Enter name (required)
   - Add description (optional)
   - Click "Create"

2. **Edit/Delete:**
   - Use the edit/delete icons on each row

### Audit Logs

1. **View Logs:**
   - All logs are displayed in chronological order
   - Click the expand arrow to view details

2. **Filter Logs:**
   - Use "Filter by Action" dropdown to see specific actions
   - Use "Filter by Entity Type" to see specific entities
   - Clear filters by selecting "All"

3. **Pagination:**
   - Use the pagination controls at the bottom
   - Change rows per page (10, 25, 50, 100)

## Action Color Codes

Audit log actions are color-coded:
- **Green** (Success): LOGIN, UPLOAD_VERSION
- **Blue** (Primary): CREATE operations
- **Info** (Cyan): UPDATE operations, VIEW_DOCUMENT
- **Red** (Error): DELETE operations
- **Gray** (Default): LOGOUT, DOWNLOAD_DOCUMENT

## Best Practices

1. **Security:**
   - Change default admin password immediately
   - Use strong passwords for all users
   - Deactivate users instead of deleting them (preserves audit trail)

2. **Organization:**
   - Use meaningful document codes
   - Set logical sort orders for document sets
   - Add descriptions to help users understand content

3. **Access Control:**
   - Create groups based on departments/roles
   - Assign users to appropriate groups
   - Assign document sets to relevant groups only

4. **Audit Tracking:**
   - Regularly review audit logs
   - Look for unusual patterns
   - Keep logs for compliance purposes

## Troubleshooting

### Can't see admin menu items
- Check if logged in user has "admin" role
- Try logging out and back in

### Upload fails
- Check file size (max 1GB)
- Ensure backend storage folder has write permissions
- Check browser console for errors

### Changes not saving
- Check for validation errors (red text)
- Ensure all required fields are filled
- Check browser console for errors

## Technical Details

### State Management
- Zustand for global state
- React Query for server state
- localStorage for persistence

### API Integration
- Axios for HTTP requests
- Automatic token injection
- Error interceptors for 401 handling

### Form Handling
- Material-UI components
- Client-side validation
- Server-side error display

## Next Steps

For production deployment, see:
- `DEPLOYMENT_VPS.md` - VPS deployment guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `README.md` - General system documentation
