"""
Admin user initialization script
This script creates the initial admin user in the database
Run this script once to set up the admin account

Usage:
    python init_admin.py
"""

from src.database import SessionLocal, engine, Base
from src.models import Admin
from src.auth import hash_password_bcrypt
import uuid

def init_admin():
    """
    Initialize the database with the initial admin user
    - Email: admin@smartbank.com
    - Password: Admin@123 (hashed with bcrypt)
    - Role: ADMIN
    - Status: Active
    """
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(Admin).filter_by(email="admin@smartbank.com").first()
        
        if existing_admin:
            print("✓ Admin user already exists: admin@smartbank.com")
            return
        
        # Hash the password
        password = "Admin@123"
        password_hash = hash_password_bcrypt(password)
        
        # Create admin user
        admin = Admin(
            id=str(uuid.uuid4()),
            email="admin@smartbank.com",
            password_hash=password_hash,
            role="ADMIN",
            is_active=True
        )
        
        # Add to database
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("\n✓ Admin user created successfully!")
        print(f"  Email: admin@smartbank.com")
        print(f"  Password: Admin@123")
        print(f"  Role: ADMIN")
        print(f"  Status: Active")
        print(f"  Admin ID: {admin.id}\n")
        
    except Exception as e:
        print(f"✗ Error creating admin user: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("\n=== SmartBank Admin Initialization ===\n")
    init_admin()
    print("Initialization complete!\n")
