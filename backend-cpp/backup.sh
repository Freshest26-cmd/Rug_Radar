#!/bin/bash
# Database Backup Script for Rug Radar
# Usage: ./backup.sh [database_url]

DB_URL=${1:-$DATABASE_URL}
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/rugradar_backup_${TIMESTAMP}.sql"

mkdir -p ${BACKUP_DIR}

echo "Starting database backup at ${TIMESTAMP}..."

# Use pg_dump for backup
pg_dump ${DB_URL} > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "Backup successful: ${BACKUP_FILE}"
    # Keep only the last 7 days of backups
    find ${BACKUP_DIR} -name "rugradar_backup_*.sql" -mtime +7 -delete
else
    echo "Backup failed!"
    exit 1
fi
