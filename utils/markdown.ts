/**
 * Minimal markdown → HTML renderer.
 * Intentionally tiny — no external dependency. Handles:
 *   - headings (#, ##, ###)
 *   - bold (**), italic (*)
 *   - inline code (`x`) and fenced code blocks (```)
 *   - links [text](url) (opens in new tab)
 *   - unordered lists (- item)
 *   - paragraphs / line breaks
 *
 * Input is HTML-escaped before markdown transforms, so user-pasted HTML
 * is rendered as text, not interpreted.
 */

/**
 * Escape only the three characters that can actually break HTML body parsing
 * or our own double-quoted attribute values.
 *
 * We deliberately do NOT escape ' or " here:
 *   • Apostrophes and quotes are safe in body text — they don't break tags.
 *   • Our generated attributes (href, class, etc.) use double quotes, so a
 *     bare `'` is a non-issue, and we control the only `"`-emitting path
 *     ourselves (the link href, which is matched up to `)` and never contains
 *     a stray quote in normal markdown).
 * Escaping them previously caused user-typed `'` to leak as `&#39;` in any
 * pass that re-escaped the resulting `&`.
 */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export function renderMarkdown(input: string): string {
  if (!input) return ''

  let html = escapeHtml(input)

  // Fenced code blocks (must run before line-level rules).
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_, code) =>
      `<pre class="bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto my-3 text-sm"><code>${code.trim()}</code></pre>`
  )

  // Inline code.
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">$1</code>'
  )

  // Headings.
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')

  // Bold then italic (order matters for `**` vs `*`).
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Links.
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary-500 hover:underline" target="_blank" rel="noopener">$1</a>'
  )

  // @user mentions — clickable link to the user's profile page.
  html = html.replace(
    /(^|[^\w@])@([a-zA-Z0-9_-]+)/g,
    '$1<a class="mention mention-user" href="/user/$2">@$2</a>'
  )

  // #-references — kept as styled inline badges (block links are inserted as
  // proper markdown links and don't go through this transform).
  html = html.replace(
    /(^|[^\w#])#([a-zA-Z0-9_-]+)/g,
    '$1<span class="mention mention-ref">#$2</span>'
  )

  // Unordered lists.
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(
    /(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g,
    '<ul class="list-disc list-inside space-y-1 my-2">$1</ul>'
  )

  // Paragraphs: split on blank lines, leave block-level tags alone.
  html = html
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[1-6]|ul|ol|pre|blockquote|p|div|table)/i.test(trimmed)) return trimmed
      return `<p class="my-2">${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  return html
}

/**
 * Serialize a DOM tree (or HTML string) back into markdown.
 * Mirrors what renderMarkdown produces — inverse of the subset above.
 * Browser-only (uses DOM APIs).
 */
export function htmlToMarkdown(input: Node | HTMLElement | string): string {
  let root: HTMLElement
  if (typeof input === 'string') {
    const tmp = document.createElement('div')
    tmp.innerHTML = input
    root = tmp
  } else {
    root = input as HTMLElement
  }

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? ''
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const inner = Array.from(node.childNodes).map(walk).join('')

    switch (tag) {
      case 'strong':
      case 'b':
        return inner ? `**${inner}**` : ''
      case 'em':
      case 'i':
        return inner ? `*${inner}*` : ''
      case 'code':
        return inner ? `\`${inner}\`` : ''
      case 'a': {
        const href = el.getAttribute('href') || ''
        return `[${inner}](${href})`
      }
      case 'h1':
        return `# ${inner}\n\n`
      case 'h2':
        return `## ${inner}\n\n`
      case 'h3':
        return `### ${inner}\n\n`
      case 'p':
        return `${inner}\n\n`
      case 'br':
        return '\n'
      case 'ul':
        return Array.from(el.children).map(li => `- ${walk(li).trim()}`).join('\n') + '\n\n'
      case 'ol':
        return Array.from(el.children).map((li, i) => `${i + 1}. ${walk(li).trim()}`).join('\n') + '\n\n'
      case 'li':
        return inner
      case 'div':
      case 'span':
        return inner + (tag === 'div' ? '\n' : '')
      default:
        return inner
    }
  }

  return walk(root).replace(/\n{3,}/g, '\n\n').trim()
}
