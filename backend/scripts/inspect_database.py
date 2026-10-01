"""
Database Inspection Utility for NAVIX (READ-ONLY)
Examines existing PostgreSQL tables, columns, constraints, foreign keys, row counts, and extensions.
DO NOT MUTATE THE DATABASE.
"""
import sys
import os
import json
from typing import Dict, Any, List

# Add parent directory to path so app modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, inspect, text
from app.core.config import settings

def inspect_db() -> Dict[str, Any]:
    engine = create_engine(settings.sync_database_url)
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        # 1. Version & User info
        version_res = conn.execute(text("SELECT version();")).scalar()
        db_user_res = conn.execute(text("SELECT current_database(), current_user;")).fetchone()
        
        # 2. Extensions
        extensions_res = conn.execute(text("SELECT extname, extversion FROM pg_extension;")).fetchall()
        extensions = [{"name": ext[0], "version": ext[1]} for ext in extensions_res]
        
        # 3. Application Tables
        all_tables = inspector.get_table_names(schema="public")
        
        # Exclude PostGIS system tables if present
        postgis_system_tables = {"spatial_ref_sys", "geometry_columns", "geography_columns"}
        app_tables = [t for t in all_tables if t not in postgis_system_tables]
        
        tables_info: Dict[str, Any] = {}
        gis_columns: List[Dict[str, Any]] = []
        
        for table in all_tables:
            # Columns
            columns = inspector.get_columns(table_name=table, schema="public")
            col_list = []
            for col in columns:
                col_type_str = str(col["type"])
                col_info = {
                    "name": col["name"],
                    "type": col_type_str,
                    "nullable": col["nullable"],
                    "default": str(col["default"]) if col.get("default") is not None else None
                }
                col_list.append(col_info)
                
                if "geometry" in col_type_str.lower() or "geography" in col_type_str.lower():
                    gis_columns.append({"table": table, "column": col["name"], "type": col_type_str})
                    
            if table in postgis_system_tables:
                continue
                
            # Primary Keys
            pk_constraint = inspector.get_pk_constraint(table_name=table, schema="public")
            pk_cols = pk_constraint.get("constrained_columns", [])
            
            # Foreign Keys
            fks = inspector.get_foreign_keys(table_name=table, schema="public")
            fk_list = []
            for fk in fks:
                fk_list.append({
                    "name": fk.get("name"),
                    "constrained_columns": fk.get("constrained_columns"),
                    "referred_table": fk.get("referred_table"),
                    "referred_columns": fk.get("referred_columns")
                })
                
            # Unique Constraints
            uniques = inspector.get_unique_constraints(table_name=table, schema="public")
            unique_list = [{"name": u.get("name"), "columns": u.get("column_names")} for u in uniques]
            
            # Indexes
            indexes = inspector.get_indexes(table_name=table, schema="public")
            index_list = [{"name": idx.get("name"), "columns": idx.get("column_names"), "unique": idx.get("unique")} for idx in indexes]
            
            # Row Count
            count_res = conn.execute(text(f'SELECT count(*) FROM "{table}";')).scalar()
            
            # Sample Data (Masking sensitive fields like password, hash, token)
            sample_rows = []
            sample_res = conn.execute(text(f'SELECT * FROM "{table}" LIMIT 5;')).mappings().fetchall()
            for r in sample_res:
                row_dict = dict(r)
                masked_row = {}
                for k, v in row_dict.items():
                    if any(s in k.lower() for s in ["password", "hash", "secret", "token"]):
                        masked_row[k] = "********"
                    else:
                        masked_row[k] = str(v) if v is not None else None
                sample_rows.append(masked_row)
                
            tables_info[table] = {
                "columns": col_list,
                "primary_keys": pk_cols,
                "foreign_keys": fk_list,
                "unique_constraints": unique_list,
                "indexes": index_list,
                "row_count": count_res,
                "sample_data": sample_rows
            }
            
        report = {
            "postgres_version": version_res,
            "database": db_user_res[0] if db_user_res else None,
            "user": db_user_res[1] if db_user_res else None,
            "extensions": extensions,
            "gis_columns_in_app_tables": gis_columns,
            "app_tables": tables_info,
            "postgis_system_tables_present": list(postgis_system_tables.intersection(set(all_tables)))
        }
        return report

if __name__ == "__main__":
    report = inspect_db()
    print(json.dumps(report, indent=2))
