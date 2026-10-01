from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Shared Declarative Base for SQLAlchemy ORM models.
    NOTE: Base.metadata.create_all() must NEVER be automatically executed
    against the existing production/development database.
    """
    pass
