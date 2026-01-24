import time
from functools import wraps

class RateLimiter:
    """Simple rate limiter implementation"""
    
    def __init__(self, calls: int, period: int):
        """
        Initialize rate limiter
        
        Args:
            calls: Number of allowed calls
            period: Time period in seconds
        """
        self.calls = calls
        self.period = period
        self.clock = time.time
        self.last_reset = self.clock()
        self.num_calls = 0
    
    def __call__(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = self.clock()
            time_passed = now - self.last_reset
            
            if time_passed > self.period:
                self.num_calls = 0
                self.last_reset = now
            
            self.num_calls += 1
            
            if self.num_calls > self.calls:
                raise Exception(f"Rate limit exceeded: {self.calls} calls per {self.period} seconds")
            
            return func(*args, **kwargs)
        
        return wrapper
