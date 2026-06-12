import mongoose, { Document, Schema, Types } from 'mongoose'

/** A completed syllabus submission: who, their answers, and the result. */

const AuthorSchema = new Schema({
  firstName: String,
  lastName: String,
  name: String,
  university: String,
  github: String,
  researchProfile: String,
  publications: String,
  expertise: { type: [String], default: [] },
  cv: { type: String, default: null }
}, { _id: false })

const SectionSchema = new Schema({
  number: String,
  level: Number,
  text: String
}, { _id: false })

const AnswersSchema = new Schema({
  title: String,
  topics: { type: [String], default: [] },
  students: { type: [String], default: [] },
  weeks: Number,
  hoursPerSession: Number,
  prerequisites: { type: [String], default: [] },
  objectives: { type: [String], default: [] },
  evaluate: { type: Boolean, default: null },
  evaluationMethods: { type: [String], default: [] },
  sections: { type: [SectionSchema], default: [] },
  resourceFiles: { type: [String], default: [] },
  resourceLinks: { type: [String], default: [] },
  format: String,
  teacherServices: { type: [String], default: [] },
  studentServices: { type: [String], default: [] }
}, { _id: false })

const SyllabusBlockSchema = new Schema({
  type: String,
  order: Number,
  payload: { type: Schema.Types.Mixed, default: {} }
}, { _id: false })

const SyllabusSchema = new Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  blocks: { type: [SyllabusBlockSchema], default: [] }
}, { _id: false })

export interface ISubmission extends Document {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  author: Record<string, any>
  answers: Record<string, any>
  syllabus: { name: string; description: string; blocks: any[] }
}

const SubmissionSchema = new Schema<ISubmission>({
  author: { type: AuthorSchema, default: () => ({}) },
  answers: { type: AnswersSchema, default: () => ({}) },
  syllabus: { type: SyllabusSchema, default: () => ({}) }
}, { timestamps: true })

SubmissionSchema.index({ createdAt: -1 })

export const Submission =
  (mongoose.models.Submission as mongoose.Model<ISubmission>) ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema)
