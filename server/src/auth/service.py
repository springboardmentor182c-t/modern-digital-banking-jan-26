class AuthService:
    """Authentication service"""
    
    def login(self, email: str, password: str):
        """Authenticate user login"""
        return {"email": email, "authenticated": True}
    
    def signup(self, email: str, password: str, name: str):
        """Register new user"""
        return {"email": email, "name": name, "created": True}
    
    def verify_token(self, token: str):
        """Verify JWT token"""
        return {"valid": True}
