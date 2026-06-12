/**
 * Save a completed syllabus submission (author + question responses + the
 * generated syllabus) to MongoDB. Public: anyone finishing the flow records one.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const doc = await addSubmission({
    author: body?.author ?? {},
    answers: body?.answers ?? {},
    syllabus: body?.syllabus ?? { name: '', description: '', blocks: [] }
  })
  return { id: String(doc._id) }
})
