import asyncio
import os
import sys

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def wait_for_database() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")

    engine = create_async_engine(database_url, pool_pre_ping=True)

    try:
        for attempt in range(1, 31):
            try:
                async with engine.connect() as connection:
                    await connection.execute(text("SELECT 1"))
                print("Database is ready.")
                return
            except Exception as exc:  # pragma: no cover - runtime retry helper
                print(f"Database not ready yet (attempt {attempt}/30): {exc}")
                await asyncio.sleep(2)
    finally:
        await engine.dispose()

    raise RuntimeError("Database did not become ready in time")


if __name__ == "__main__":
    try:
        asyncio.run(wait_for_database())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
