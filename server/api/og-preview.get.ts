/**
 * Minimal link-preview stub for the editor's "Link" block.
 * The real app scrapes Open Graph tags; here we derive a basic card from the
 * URL itself (no network), which is enough to render a non-broken preview.
 */
export default defineEventHandler((event) => {
  const url = String(getQuery(event).url ?? '').trim()
  if (!url) throw createError({ statusCode: 400, statusMessage: 'Missing url' })

  let siteName = url
  let title = url
  try {
    const u = new URL(url)
    siteName = u.hostname.replace(/^www\./, '')
    title = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || u.hostname) || u.hostname
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid url' })
  }

  return { url, title, description: '', image: '', siteName }
})
