class BankingException(Exception):
    """Base exception for banking operations"""
    pass

class AuthenticationException(BankingException):
    """Exception for authentication errors"""
    pass

class ValidationException(BankingException):
    """Exception for validation errors"""
    pass

class DatabaseException(BankingException):
    """Exception for database errors"""
    pass
