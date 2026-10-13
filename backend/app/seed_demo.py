"""
Entry point for NAVIX Demo Data Seeding.
Run with: python -m app.seed_demo
"""
from app.seed.seed_demo_data import seed_data, get_catalog_counts


def main():
    print("Seeding NAVIX Presentation Demo Dataset...")
    result = seed_data()
    print("Demo Seeding Finished.")
    print(f"Newly Added Records: {result}")
    totals = get_catalog_counts()
    print("Database Catalog Totals:")
    for key, count in totals.items():
        print(f"  {key.ljust(15)}: {count}")
    return totals


if __name__ == "__main__":
    main()
