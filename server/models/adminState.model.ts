import mongoose, { Document, Schema } from 'mongoose'

/**
 * Singleton document (`key: 'admin'`) holding the admin auth lock state.
 * After too many failed password attempts `locked` flips to true and stays
 * true until reset (set locked:false / failedAttempts:0, or drop the doc).
 */
export interface IAdminState extends Document {
  key: string
  failedAttempts: number
  locked: boolean
}

const AdminStateSchema = new Schema<IAdminState>({
  key: { type: String, required: true, unique: true, default: 'admin' },
  failedAttempts: { type: Number, default: 0 },
  locked: { type: Boolean, default: false }
}, { timestamps: true })

export const AdminState =
  (mongoose.models.AdminState as mongoose.Model<IAdminState>) ||
  mongoose.model<IAdminState>('AdminState', AdminStateSchema)
