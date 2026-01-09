#!/bin/bash

# Database Backup Script for ISO Document Management System
# Run this daily via cron: 0 2 * * * /var/www/iso-document/backup-db.sh

BACKUP_DIR="/var/www/iso-document/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="iso_document_system"
DB_USER="iso_user"
DB_PASS="your-password-here"  # Change this!

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
