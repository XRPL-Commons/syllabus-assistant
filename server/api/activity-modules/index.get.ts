import { ActivityModule } from '../../models/activityModule.model'

/**
 * The activity catalogue surfaced as "recommended activities".
 * Seeded into MongoDB on first startup (see server/plugins/mongoose.ts).
 */
export default defineEventHandler(async () => {
  return ActivityModule.find().sort({ createdAt: 1 }).lean()
})
