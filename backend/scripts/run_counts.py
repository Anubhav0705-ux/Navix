import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.database.session import SessionLocal
from sqlalchemy import text

session = SessionLocal()
tables = ['users', 'travelers', 'admins', 'trips', 'transit_nodes', 'transit_schedules', 'transit_segments', 'budget_allocations']
counts = {t: session.execute(text(f'SELECT count(*) FROM "{t}"')).scalar() for t in tables}
session.close()

print(counts)
