#!/bin/bash
# ── ProjectFlow SQLite Daily Backup ──
# Add to crontab: 0 2 * * * /path/to/scripts/backup.sh

set -euo pipefail

DB_PATH="/app/data/projectflow.db"
BACKUP_DIR="/app/data/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy database using SQLite backup API
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/projectflow_${TIMESTAMP}.db'"

# Compress backup
gzip "$BACKUP_DIR/projectflow_${TIMESTAMP}.db"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "projectflow_*.db.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] ✅ Backup complete: projectflow_${TIMESTAMP}.db.gz"
echo "[$(date)] 📁 Backups in directory: $(ls -1 $BACKUP_DIR | wc -l) files"
