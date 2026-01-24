import { Router, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index";
import { auditEntityEnum, auditLogs, type AuditEntityType } from "../db/schema";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req: Request, res: Response) => {
    console.log("Accessing Audit Logs as Manager");
    try {
      const page = req.query.page
        ? Math.max(parseInt(String(req.query.page), 10), 1)
        : 1;
      const limit = req.query.limit
        ? Math.max(parseInt(String(req.query.limit), 10), 1)
        : 50;
      const offset = (page - 1) * limit;
      const entityTypeParam = req.query.entityType
        ? String(req.query.entityType)
        : undefined;
      const entityId = req.query.entityId
        ? String(req.query.entityId)
        : undefined;

      let entityType: AuditEntityType | undefined;
      if (entityTypeParam) {
        if (
          !auditEntityEnum.enumValues.includes(
            entityTypeParam as AuditEntityType,
          )
        ) {
          return res.status(400).json({ error: "Invalid entityType" });
        }
        entityType = entityTypeParam as AuditEntityType;
      }

      if (entityType && entityId) {
        const rows = await db
          .select({
            id: auditLogs.id,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            action: auditLogs.action,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
            actorUserId: auditLogs.actorUserId,
          })
          .from(auditLogs)
          .where(
            and(
              eq(auditLogs.entityType, entityType),
              eq(auditLogs.entityId, entityId),
            ),
          )
          .orderBy(auditLogs.createdAt)
          .limit(limit)
          .offset(offset);

        res.json({ page, limit, data: rows });
        return;
      }

      if (entityType) {
        const rows = await db
          .select({
            id: auditLogs.id,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            action: auditLogs.action,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
            actorUserId: auditLogs.actorUserId,
          })
          .from(auditLogs)
          .where(eq(auditLogs.entityType, entityType))
          .orderBy(auditLogs.createdAt)
          .limit(limit)
          .offset(offset);

        res.json({ page, limit, data: rows });
        return;
      }

      if (entityId) {
        const rows = await db
          .select({
            id: auditLogs.id,
            entityType: auditLogs.entityType,
            entityId: auditLogs.entityId,
            action: auditLogs.action,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
            actorUserId: auditLogs.actorUserId,
          })
          .from(auditLogs)
          .where(eq(auditLogs.entityId, entityId))
          .orderBy(auditLogs.createdAt)
          .limit(limit)
          .offset(offset);

        res.json({ page, limit, data: rows });
        return;
      }

      const rows = await db
        .select({
          id: auditLogs.id,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          action: auditLogs.action,
          details: auditLogs.details,
          createdAt: auditLogs.createdAt,
          actorUserId: auditLogs.actorUserId,
        })
        .from(auditLogs)
        .orderBy(auditLogs.createdAt)
        .limit(limit)
        .offset(offset);

      res.json({ page, limit, data: rows });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

export default router;
