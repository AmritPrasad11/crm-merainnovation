import { db } from './db';

export interface AuditLogInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export async function logAuditAction(input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        previousValue: input.previousValue ? JSON.stringify(input.previousValue) : null,
        newValue: input.newValue ? JSON.stringify(input.newValue) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}
