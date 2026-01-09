# Demo Accounts

This document contains credentials for demonstrating the ISO Document Management System to customers.

## 🎯 Purpose

These accounts showcase the different roles and permissions in the system:
- **Admin Account**: Full system administration
- **Demo User Account**: View and download only (typical end-user)

---

## 👨‍💼 Admin Account

**Purpose:** Demonstrate full administrative capabilities

```
📧 Email:     admin@example.com
🔐 Password:  Admin@123
👤 Role:      Administrator
```

### What Admin Can Do:
✅ **Full Access to Everything:**
- Create, edit, delete document sets
- Upload, edit, delete documents
- Create and manage users
- Create and manage groups
- Assign permissions
- View audit logs
- All user capabilities (view, download)

### Use This Account To Show:
1. **Document Management**
   - Upload new document versions
   - Organize documents into sets
   - Manage document metadata

2. **User Management**
   - Create users for different departments
   - Assign roles (Admin/User)
   - Activate/deactivate accounts

3. **Access Control**
   - Create groups (e.g., "Management", "QA Team")
   - Assign users to groups
   - Control which groups can access which documents

4. **Audit & Compliance**
   - Track all system activities
   - View who accessed what and when
   - Export audit logs for compliance

---

## 👤 Demo User Account

**Purpose:** Demonstrate typical end-user experience (view/download only)

```
📧 Email:     demo@example.com
🔐 Password:  Demo@123
👤 Role:      User
📁 Groups:    All Staff
```

### What Demo User Can Do:
✅ **View & Download:**
- View documents in their assigned groups
- Download current versions of documents
- Search for documents
- View document information
- See version numbers and dates

❌ **Cannot Do:**
- Upload or modify documents
- Create document sets
- Manage users or groups
- Access admin pages
- View audit logs

### Use This Account To Show:
1. **Simple User Experience**
   - Clean, focused interface
   - Easy document browsing
   - Quick search functionality

2. **Group-Based Access**
   - Only sees documents assigned to "All Staff" group
   - Cannot see restricted documents
   - Automatic permission enforcement

3. **Download & View**
   - One-click download
   - In-browser preview (if supported)
   - Version information display

4. **Security**
   - No admin menu items visible
   - Cannot modify anything
   - Read-only access only

---

## 🎬 Demo Scenarios

### Scenario 1: Admin Creating Content
**Account:** Admin (admin@example.com)

1. Login as admin
2. Navigate to **Admin → Document Sets**
3. Create a new document set (e.g., "Quality Manual")
4. Navigate to **Admin → Documents**
5. Create a document in that set
6. Upload a PDF file
7. Show version tracking

**Message:** "Administrators can easily organize and upload documents"

---

### Scenario 2: Admin Managing Access
**Account:** Admin (admin@example.com)

1. Navigate to **Admin → Groups**
2. Create a new group (e.g., "Quality Team")
3. Navigate to **Admin → Users**
4. Create a new user or edit existing
5. Assign user to the new group
6. Navigate to **Admin → Document Sets**
7. Assign the document set to the group

**Message:** "Control exactly who can access which documents"

---

### Scenario 3: End-User Experience
**Account:** Demo User (demo@example.com)

1. Login as demo user
2. Navigate to **Dashboard**
   - Show clean interface
   - Show statistics
3. Navigate to **My Documents**
   - Show only accessible documents
   - Demonstrate search
4. Click on a document
   - View details
   - Download file
5. Show no admin menu items

**Message:** "Users get a simple, focused experience for finding and accessing documents"

---

### Scenario 4: Audit Trail
**Account:** Admin (admin@example.com)

1. Perform some actions with demo user (downloads, views)
2. Login as admin
3. Navigate to **Admin → Audit Logs**
4. Show all tracked activities:
   - Login events
   - Document access
   - Downloads
   - Admin changes
5. Demonstrate filters
6. Show detailed information (IP, timestamp, user agent)

**Message:** "Complete audit trail for compliance and security"

---

### Scenario 5: Multi-Language Support
**Account:** Either account

1. Show English interface
2. Click language selector (top-right)
3. Switch to Malay (Bahasa Malaysia)
4. Show all text is translated
5. Switch back to English

**Message:** "Full bilingual support for Malaysian organizations"

---

## 🎨 Key Features to Highlight

### 1. **Modern UI/UX**
- Clean, professional design
- UUM's official colors (blue & yellow)
- Responsive design (show on different screen sizes)
- Intuitive navigation

### 2. **Security**
- Role-based access control
- Group-based permissions
- Secure authentication
- Password protection
- Session management

### 3. **Version Control**
- Track document versions
- Version history
- Rollback capability (admin only)
- Change notes

### 4. **Compliance**
- Complete audit logging
- Track all user actions
- Export capabilities
- Timestamp everything

### 5. **Ease of Use**
- Simple document upload
- Drag-and-drop support
- Quick search
- Clear organization

### 6. **Customization**
- Custom document codes
- Flexible categories
- Custom groups
- Configurable access

---

## 📊 Sample Data

The system comes pre-seeded with:

### Document Sets (4):
1. **ISO 9001:2015** - Quality Management
2. **Internal Audit** - Audit reports
3. **Meeting Minutes** - Management meetings
4. **Online Documents** - Public documents

### Groups (4):
1. **Management** - Senior management
2. **Quality Assurance** - QA team
3. **All Staff** - All employees
4. **Auditors** - Internal/external auditors

### Access Control Examples:
- ISO 9001 → Management, QA, Auditors
- Internal Audit → Management, Auditors
- Meeting Minutes → Management, All Staff
- Online Documents → Everyone

---

## 🎯 Customer Questions & Answers

### Q: Can we control who sees what documents?
**A:** Yes! Use groups to organize users and assign document sets to specific groups. Demo this with admin account.

### Q: Can we track who downloaded documents?
**A:** Yes! All downloads are logged in the audit trail with timestamp, user, IP address. Show in **Admin → Audit Logs**.

### Q: Can regular users upload documents?
**A:** No, only administrators can upload. This ensures quality control. Show the difference between admin and demo user accounts.

### Q: Can we organize documents by department/category?
**A:** Yes! Create document sets for different departments, then use groups to control access. Demo in **Admin → Document Sets**.

### Q: Is it available in Malay?
**A:** Yes! Full bilingual support (English & Malay). Use the language switcher to demonstrate.

### Q: Can we see previous versions?
**A:** Yes! Administrators can view full version history and rollback if needed. Demo in document management.

### Q: Is it secure?
**A:** Yes! Features include:
- Password authentication
- Role-based access control
- Group-based permissions
- Audit logging
- Session management

### Q: Can we add more users?
**A:** Yes! Administrators can create unlimited users. Demo in **Admin → Users**.

---

## 🚀 Quick Demo Script (5 minutes)

### Part 1: Admin Capabilities (2 minutes)
1. Login as admin@example.com
2. Show dashboard with statistics
3. Navigate through admin menu
4. Create a quick document set
5. Upload a sample document

### Part 2: User Experience (2 minutes)
1. Logout
2. Login as demo@example.com
3. Show user dashboard
4. Browse documents
5. Download a file
6. Show search

### Part 3: Security & Compliance (1 minute)
1. Switch back to admin
2. Show audit logs
3. Point out tracked activities
4. Show group-based access control

---

## 📝 Notes for Presentation

### Do's:
✅ Emphasize ease of use
✅ Show both admin and user perspectives
✅ Demonstrate access control
✅ Highlight audit logging for compliance
✅ Show the clean, professional interface
✅ Mention ISO compliance features

### Don'ts:
❌ Don't rush through the demo
❌ Don't focus too much on technical details
❌ Don't skip the user perspective (most important!)
❌ Don't forget to show the bilingual support
❌ Don't ignore questions about security

---

## 🔄 Resetting Demo Accounts

If you need to reset the passwords:

### Reset Admin Password:
```bash
cd backend
node fix-password.js
```

### Reset Demo User Password:
```bash
cd backend
node create-demo-user.js
```

---

## 📞 Support

For questions during the demo:
- Refer to `ADMIN_PAGES_GUIDE.md` for detailed features
- Check `README.md` for technical information
- See `TROUBLESHOOTING.md` for common issues

---

## 🎊 Final Tips

1. **Practice the demo** before showing to customers
2. **Prepare sample documents** to upload (PDFs work best)
3. **Know your audience** - technical vs. non-technical
4. **Focus on benefits** not just features
5. **Show, don't tell** - let them see it in action
6. **Be ready for questions** about security and compliance
7. **Have backup plan** in case of technical issues

---

**Good luck with your customer presentation! 🚀**
