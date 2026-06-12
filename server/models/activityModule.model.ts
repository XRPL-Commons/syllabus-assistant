import mongoose, { Document, Schema, Types } from 'mongoose'

/** Academy activity catalogue surfaced as "recommended activities". */
export interface IActivityModule extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  type: string
  metadata?: { estimatedTime?: number }
  authors?: { username: string }[]
}

const ActivityModuleSchema = new Schema<IActivityModule>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'lesson' },
  metadata: {
    estimatedTime: { type: Number }
  },
  authors: { type: [{ username: String, _id: false }], default: [] }
}, { timestamps: true })

export const ActivityModule =
  (mongoose.models.ActivityModule as mongoose.Model<IActivityModule>) ||
  mongoose.model<IActivityModule>('ActivityModule', ActivityModuleSchema)
