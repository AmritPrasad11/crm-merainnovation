#!/bin/bash

# Mera Innovation CRM - PostgreSQL Database Backup Script
# Usage: ./scripts/db-backup.sh

BACKUP_DIR="/var/backups/merainnovation-crm"
DATE=$(date +'%Y-%m-%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/crm_backup_${DATE}.sql.gz"

# Create backup directory if not exists
mkdir -p ${BACKUP_DIR}

# Perform pg_dump
echo "Starting PostgreSQL database backup at ${DATE}..."
pg_dump -U postgres merainnovation_crm | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "Backup successful: ${BACKUP_FILE}"
    # Retain backups for last 30 days
    find ${BACKUP_DIR} -type f -name "crm_backup_*.sql.gz" -mtime +30 -delete
else
    echo "Backup failed!"
    exit 1
fi
