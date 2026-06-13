import { Submission } from '../models/submission.model'

/** Mongo-backed submission store (auto-imported by the API routes). */

export interface SubmissionInput {
  author: Record<string, any>
  answers: Record<string, any>
  syllabus: { name: string; description: string; blocks: Array<{ type: string; order: number; payload: Record<string, any> }> }
}

export async function readSubmissions() {
  await connectMongo()
  const docs = await Submission.find().sort({ createdAt: -1 }).lean()
  return docs.map(d => ({ ...d, id: String(d._id) }))
}

export async function addSubmission(input: SubmissionInput) {
  await connectMongo()
  return Submission.create(input)
}
