class UserService:
    """User service"""
    
    def get_all_users(self):
        """Get all users"""
        return []
    
    def get_user_by_id(self, user_id: int):
        """Get user by ID"""
        return {"id": user_id}
    
    def create_user(self, name: str, email: str, password: str):
        """Create a new user"""
        return {"name": name, "email": email}
    
    def update_user(self, user_id: int, name: str, email: str):
        """Update user"""
        return {"id": user_id, "name": name, "email": email}
    
    def delete_user(self, user_id: int):
        """Delete a user"""
        return {"id": user_id}
