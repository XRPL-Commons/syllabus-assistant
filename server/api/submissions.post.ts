/**
 * Save a completed syllabus submission (author + question responses + the
 * generated syllabus). Public: anyone finishing the flow records one.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = `s_${Date.now().toString(36)}_${Math.round(Math.random() * 1e6).toString(36)}`
  await addSubmission({
    id,
    createdAt: new Date().toISOString(),
    author: body?.author ?? {},
    answers: body?.answers ?? {},
    syllabus: body?.syllabus ?? { name: '', description: '', blocks: [] }
  })
  return { id }
})
