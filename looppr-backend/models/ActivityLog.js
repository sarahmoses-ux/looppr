import mongoose from 'mongoose'

export const ACTIVITY_ACTOR_TYPES = ['system', 'admin', 'rider', 'partner', 'client']

export const ACTIVITY_ENTITY_TYPES = ['PickupRequest', 'Rider', 'LaundryPartner', 'User']

// Append-only log — nothing here is ever updated or deleted, only inserted.
// No `ref` on actorId/entityId: which collection they point to depends on
// actorType/entityType, so a single static ref wouldn't be meaningful.
const activityLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, enum: ACTIVITY_ACTOR_TYPES, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    entityType: { type: String, enum: ACTIVITY_ENTITY_TYPES, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

// "Show me this entity's history, newest first" is the primary access
// pattern (admin activity feed, an order's assignment trail, etc.).
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)
