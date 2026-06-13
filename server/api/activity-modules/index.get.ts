import { ActivityModule } from '../../models/activityModule.model'

/**
 * The activity catalogue surfaced as "recommended activities".
 * Seeded into MongoDB on first connection (see server/utils/mongo.ts).
 */
export default defineEventHandler(async () => {
  await connectMongo()
  return ActivityModule.find().sort({ createdAt: 1 }).lean()
})
