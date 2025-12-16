#!/bin/bash
# Backup script for Rallly Docker data

echo "Creating backup directory..."
mkdir -p ~/rallly-backup-$(date +%Y%m%d)

BACKUP_DIR=~/rallly-backup-$(date +%Y%m%d)

echo "Backing up database..."
docker exec rallly-app-rallly_db-1 pg_dump -U postgres rallly > "$BACKUP_DIR/database.sql" 2>/dev/null || echo "Database backup failed - container may not be running"

echo "Backing up Docker volumes info..."
docker volume inspect rallly-app_db-data > "$BACKUP_DIR/db-volume-info.json" 2>/dev/null
docker volume inspect rallly-app_redis-data > "$BACKUP_DIR/redis-volume-info.json" 2>/dev/null
docker volume inspect rallly-app_s3-data > "$BACKUP_DIR/s3-volume-info.json" 2>/dev/null

echo "Backup location: $BACKUP_DIR"
echo "Note: To restore, you'll need Docker running and can use:"
echo "  docker exec -i rallly-app-rallly_db-1 psql -U postgres rallly < $BACKUP_DIR/database.sql"
