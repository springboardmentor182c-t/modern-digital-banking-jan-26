# Admin Login Setup Guide

## ✓ Setup Complete

Your admin login system is now fully functional and linked with the database!

### Default Admin Credentials

**Email:** `admin@smartbank.com`  
**Password:** `Admin@123`

## How to Use

### Step 1: Start the Backend Server
Make sure the FastAPI backend is running:
```bash
cd src/backend
uvicorn main:app --reload --port 8080
```

### Step 2: Login via Admin Portal
1. Navigate to the admin login page
2. Enter email: `admin@smartbank.com`
3. Enter password: `Admin@123`
4. Click "Sign In"
5. You will be redirected to the admin dashboard with your credentials stored in localStorage

## How It Works

### Backend Integration
- **Endpoint:** `POST /auth/admin/login`
- **Database:** PostgreSQL admins table
- **Password Hashing:** SHA256
- **Response:**
  ```json
  {
    "message": "Login successful",
    "admin_id": "unique-uuid",
    "role": "ADMIN"
  }
  ```

### Frontend Integration
The AdminLogin.tsx component now:
1. Calls the correct backend endpoint (`/auth/admin/login`)
2. Validates email and password
3. Handles error responses (401, 403)
4. Stores admin credentials in localStorage
5. Redirects to admin dashboard on success

## Managing Admin Accounts

### Add a New Admin
Run the interactive setup script:
```bash
cd src/backend
python setup_admin.py
```

### Reset Admin Password
Edit reset_admin.py with new credentials, then run:
```bash
cd src/backend
python reset_admin.py
```

### View All Admins in Database
The scripts display all admin accounts with their status (Active/Inactive)

## Error Handling

| Status | Error Message | Cause |
|--------|---------------|-------|
| 401 | "Invalid email or password" | Wrong credentials |
| 403 | "Admin account is inactive" | Admin is_active = False |
| Connection Error | "Backend connection failed" | Server not running |

## Technical Details

### Database Schema
```
admins table:
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String, SHA256)
- role (String, default: "ADMIN")
- is_active (Boolean, default: True)
- created_at (DateTime)
```

### LocalStorage Keys
- `admin_id`: UUID of logged-in admin
- `admin_role`: Admin role ("ADMIN")

## Troubleshooting

### "Not Found" Error
✓ FIXED - Changed endpoint to `/auth/admin/login` (was `/admin/login`)

### Password Hashing Issues
✓ FIXED - Using SHA256 instead of bcrypt due to library compatibility

### Backend Connection Failed
- Check if uvicorn is running on port 8080
- Check firewall settings
- Verify database connection string in database.py

## Next Steps

You can now:
1. Customize the admin email/password with your own
2. Create additional admin accounts using setup_admin.py
3. Implement admin dashboard features
4. Add role-based access control for different admin types
