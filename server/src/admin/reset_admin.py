#!/usr/bin/env python3
"""
Direct admin credential setup script.
This sets up a default admin account with credentials:
- Email: admin@smartbank.com
- Password: Admin@123
"""

from src.database import SessionLocal, engine
import src.models
from src.auth import hash_password_bcrypt
import uuid

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

def setup_default_admin():
    db = SessionLocal()
    try:
        email = "admin@smartbank.com"
        password = "Admin@123"
        
        # Check if admin exists
        admin = db.query(models.Admin).filter_by(email=email).first()
        
        if admin:
            # Update password with bcrypt hash
            admin.password_hash = hash_password_bcrypt(password)
            admin.is_active = True
            db.commit()
            print(f"✓ Updated admin credentials:")
        else:
            # Create new admin
            admin = models.Admin(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=hash_password_bcrypt(password),
                role="ADMIN",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✓ Created new admin account:")
        
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"  Status: Active")
        print(f"  ID: {admin.id}")
        
        # Show all admins
        all_admins = db.query(models.Admin).all()
        print(f"\nTotal admin accounts: {len(all_admins)}")
        for adm in all_admins:
            status = "Active" if adm.is_active else "Inactive"
            print(f"  - {adm.email} ({status})")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Admin Account Setup ===\n")
    setup_default_admin()
