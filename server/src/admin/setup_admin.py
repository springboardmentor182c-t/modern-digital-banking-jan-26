#!/usr/bin/env python3
"""
Interactive script to set up or update admin credentials.
This script allows you to create a new admin or update existing admin password.

Usage:
    python setup_admin.py
"""

from src.database import SessionLocal, engine
import src.models
from src.auth import hash_password_bcrypt
import uuid

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

def setup_admin():
    db = SessionLocal()
    try:
        print("Choose an option:")
        print("1. Create new admin")
        print("2. Update existing admin password")
        choice = input("Enter choice (1 or 2): ").strip()
        
        if choice == "1":
            email = input("Enter admin email: ").strip()
            
            # Check if admin already exists
            existing = db.query(models.Admin).filter_by(email=email).first()
            if existing:
                print(f"✗ Admin with email '{email}' already exists!")
                return
            
            password = input("Enter admin password: ").strip()
            if not email or not password:
                print("✗ Email and password cannot be empty")
                return
            
            admin = models.Admin(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=hash_password_bcrypt(password),
                role="ADMIN",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"\n✓ Admin account created successfully!")
            print(f"  Email: {email}")
            print(f"  Status: Active")
            
        elif choice == "2":
            email = input("Enter admin email to update: ").strip()
            admin = db.query(models.Admin).filter_by(email=email).first()
            
            if not admin:
                print(f"✗ Admin with email '{email}' not found!")
                return
            
            password = input("Enter new password: ").strip()
            if not password:
                print("✗ Password cannot be empty")
                return
            
            admin.password_hash = hash_password_bcrypt(password)
            admin.is_active = True
            db.commit()
            print(f"\n✓ Admin password updated successfully!")
            print(f"  Email: {email}")
            print(f"  Status: Active")
        
        else:
            print("✗ Invalid choice")
            return
        
        # List all admins
        all_admins = db.query(models.Admin).all()
        print(f"\nAll admin accounts ({len(all_admins)} total):")
        for adm in all_admins:
            status = "✓ Active" if adm.is_active else "✗ Inactive"
            print(f"  {adm.email} - {status}")
    
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Admin Account Setup ===\n")
    setup_admin()
    print("\n")
