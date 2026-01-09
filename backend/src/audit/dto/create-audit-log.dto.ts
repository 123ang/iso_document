export class CreateAuditLogDto {
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}
