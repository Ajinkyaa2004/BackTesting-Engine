"""
Password hashing utilities using bcrypt.
"""
import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)
    
    # Bcrypt has a 72-byte limit - encode and truncate if necessary
    password_bytes = password.encode('utf-8')
    password_length = len(password_bytes)
    
    if password_length > 72:
        password_bytes = password_bytes[:72]
    
    # Use bcrypt directly to avoid passlib's validation
    # This bypasses passlib's 72-byte check
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    except ValueError as e:
        # If bcrypt still complains, raise a clearer error
        raise ValueError(f"Password hashing failed: {str(e)}. Password length: {password_length} bytes")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    # Ensure password is a string
    if not isinstance(plain_password, str):
        plain_password = str(plain_password)
    
    # Bcrypt has a 72-byte limit - encode and truncate if necessary
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Use bcrypt directly for verification
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)
