from passlib.context import CryptContext

# Use Argon2 for hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

password = "Admin@123"  # Can be any length, special chars are fine
hashed = pwd_context.hash(password)

print("Hashed password:", hashed)
