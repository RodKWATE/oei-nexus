"""Alembic migration environment — uses the sync engine from database.py."""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Load app settings + models for autogenerate
from app.core.config import settings
from app.core.database import Base, sync_engine
import app.models  # noqa: F401 — registers all models with Base

config = context.config

# Inject runtime DB URL (overrides alembic.ini value)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL_SYNC)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = sync_engine
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
