/**
 * Mock "create draft" endpoint.
 *
 * The Syllabus Assistant POSTs the generated syllabus here when the teacher
 * clicks "Create syllabus draft". With no database in this standalone repo we
 * simply echo it back with a generated id. Persist it (DB, file, external API)
 * here when you wire up a backend.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = `local-${Date.now().toString(36)}`
  return { activityModule: { _id: id, ...body } }
})
