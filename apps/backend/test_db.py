from sqlalchemy import create_engine, text

# Try direct connection to Supabase
db_url = 'postgresql://postgres:ViPgQBcgG3lPJoBe@db.mvxtdnqhhktvazucrurq.supabase.co:5432/postgres'
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT current_database()'))
        print('DB:', result.fetchone()[0])

        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [row[0] for row in result]
        print('Tables:', tables)
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')