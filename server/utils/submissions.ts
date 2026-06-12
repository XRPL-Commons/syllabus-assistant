import { promises as fs } from 'node:fs'
import { join } from 'node:path'

/**
 * Tiny file-backed store for syllabus submissions.
 * This standalone app has no database, so submissions are persisted as a JSON
 * file under `.data/` (git-ignored). Swap for a real DB when needed.
 */

export interface Submission {
  id: string
  createdAt: string
  author: Record<string, any>
  answers: Record<string, any>
  syllabus: { name: string; description: string; blocks: Array<{ type: string; order: number; payload: Record<string, any> }> }
}

const DIR = join(process.cwd(), '.data')
const FILE = join(DIR, 'submissions.json')

export async function readSubmissions(): Promise<Submission[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf-8'))
  } catch {
    return []
  }
}

export async function addSubmission(submission: Submission): Promise<Submission> {
  const list = await readSubmissions()
  list.unshift(submission)
  await fs.mkdir(DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8')
  return submission
}
