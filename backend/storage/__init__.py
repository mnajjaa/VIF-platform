"""
In-memory storage for development/prototyping
TODO: Replace with actual database (PostgreSQL, MongoDB, etc.)
"""

from .memory import InMemoryStorage

# Singleton storage instance
storage = InMemoryStorage()

__all__ = ["storage", "InMemoryStorage"]
