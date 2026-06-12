<template>
  <div class="space-y-3">
    <div class="flex items-center gap-1 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-2">
      <UButton
        icon="i-heroicons-bold"
        size="xs"
        variant="ghost"
        color="neutral"
        square
        aria-label="Bold (⌘B)"
        title="Bold (⌘B)"
        @mousedown.prevent
        @click="exec('bold')"
      />
      <UButton
        icon="i-heroicons-italic"
        size="xs"
        variant="ghost"
        color="neutral"
        square
        aria-label="Italic (⌘I)"
        title="Italic (⌘I)"
        @mousedown.prevent
        @click="exec('italic')"
      />
      <span class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
      <UButton size="xs" variant="ghost" color="neutral" title="Heading 1" @mousedown.prevent @click="setBlock('H1')">H1</UButton>
      <UButton size="xs" variant="ghost" color="neutral" title="Heading 2" @mousedown.prevent @click="setBlock('H2')">H2</UButton>
      <UButton size="xs" variant="ghost" color="neutral" title="Heading 3" @mousedown.prevent @click="setBlock('H3')">H3</UButton>
      <UButton size="xs" variant="ghost" color="neutral" title="Paragraph" @mousedown.prevent @click="setBlock('P')">¶</UButton>
      <span class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
      <UButton
        icon="i-heroicons-link"
        size="xs"
        variant="ghost"
        color="neutral"
        square
        aria-label="Link (⌘K)"
        title="Link (⌘K)"
        @mousedown.prevent
        @click="insertLink"
      />
      <UButton
        icon="i-heroicons-list-bullet"
        size="xs"
        variant="ghost"
        color="neutral"
        square
        aria-label="Bulleted list"
        title="Bulleted list"
        @mousedown.prevent
        @click="exec('insertUnorderedList')"
      />
      <UButton
        icon="i-heroicons-numbered-list"
        size="xs"
        variant="ghost"
        color="neutral"
        square
        aria-label="Numbered list"
        title="Numbered list"
        @mousedown.prevent
        @click="exec('insertOrderedList')"
      />
      <UButton
        icon="i-heroicons-code-bracket"
        size="xs"
        variant="ghost"
        color="neutral"
        square
        aria-label="Inline code"
        title="Inline code"
        @mousedown.prevent
        @click="wrapInlineCode"
      />
    </div>

    <div
      ref="editorRef"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      class="markdown-editor max-w-none min-h-[8rem] p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      :data-placeholder="placeholder"
      @input="onInput"
      @keydown="onKeyDown"
      @paste="onPaste"
    />
  </div>
</template>

<script setup lang="ts">
import { renderMarkdown, htmlToMarkdown } from '~/utils/markdown'

interface MarkdownPayload {
  content?: string
}

const props = defineProps<{ modelValue: MarkdownPayload }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: MarkdownPayload): void }>()

const placeholder = 'Write your text here. Use the toolbar or ⌘B / ⌘I / ⌘K.'

const editorRef = ref<HTMLDivElement | null>(null)
// Last markdown we emitted — used to skip re-rendering when the parent
// echoes our own change back through modelValue.
const lastEmitted = ref<string>('')

const setEditorHtml = (markdown: string) => {
  if (!editorRef.value) return
  editorRef.value.innerHTML = renderMarkdown(markdown)
}

onMounted(() => {
  setEditorHtml(props.modelValue.content ?? '')
  lastEmitted.value = props.modelValue.content ?? ''
})

// External changes to modelValue (e.g. when loading an existing activity)
// should refresh the editor's HTML; our own emits should not.
watch(
  () => props.modelValue.content,
  newContent => {
    if (newContent === lastEmitted.value) return
    setEditorHtml(newContent ?? '')
    lastEmitted.value = newContent ?? ''
  }
)

const emitFromEditor = () => {
  if (!editorRef.value) return
  const markdown = htmlToMarkdown(editorRef.value)
  lastEmitted.value = markdown
  emit('update:modelValue', { ...props.modelValue, content: markdown })
}

const onInput = () => {
  emitFromEditor()
}

const exec = (command: string, value?: string) => {
  editorRef.value?.focus()
  document.execCommand(command, false, value)
  emitFromEditor()
}

const setBlock = (tag: 'H1' | 'H2' | 'H3' | 'P') => {
  exec('formatBlock', tag)
}

const insertLink = () => {
  const url = window.prompt('Link URL', 'https://')
  if (!url) return
  exec('createLink', url)
}

const wrapInlineCode = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  if (range.collapsed) return
  const code = document.createElement('code')
  try {
    range.surroundContents(code)
  } catch {
    // Selection spans multiple block parents — fall back to plain extract+wrap.
    const fragment = range.extractContents()
    code.appendChild(fragment)
    range.insertNode(code)
  }
  emitFromEditor()
}

const onKeyDown = (e: KeyboardEvent) => {
  const meta = e.metaKey || e.ctrlKey
  if (!meta) return
  const key = e.key.toLowerCase()
  if (key === 'k') {
    e.preventDefault()
    insertLink()
  }
  // ⌘B and ⌘I are handled natively by contenteditable; we let the browser run them.
}

// Paste as plain text so external formatting (Word, web pages, etc.) doesn't leak in.
const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') ?? ''
  if (!text) return
  document.execCommand('insertText', false, text)
}
</script>

<style scoped>
/* Placeholder when the editor is empty. */
.markdown-editor[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

/* Style the bare semantic tags that document.execCommand inserts.
   :deep() lets scoped styles reach contenteditable's dynamic children. */
.markdown-editor :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 1.25rem 0 0.75rem;
}
.markdown-editor :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 1.1rem 0 0.6rem;
}
.markdown-editor :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}
.markdown-editor :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.5;
}
.markdown-editor :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.markdown-editor :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.markdown-editor :deep(li) {
  margin: 0.2rem 0;
}
.markdown-editor :deep(a) {
  color: rgb(59, 130, 246);
  text-decoration: underline;
}
.markdown-editor :deep(strong) {
  font-weight: 700;
}
.markdown-editor :deep(em) {
  font-style: italic;
}
/* Inline code — discreet grey background + border. */
.markdown-editor :deep(code) {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875em;
  background: rgba(156, 163, 175, 0.15);
  border: 1px solid rgba(156, 163, 175, 0.35);
  border-radius: 0.25rem;
  padding: 0.1em 0.35em;
}
/* Fenced code blocks — same grey treatment, no inner padding for nested code. */
.markdown-editor :deep(pre) {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875em;
  background: rgba(156, 163, 175, 0.12);
  border: 1px solid rgba(156, 163, 175, 0.3);
  border-radius: 0.375rem;
  padding: 0.75rem 0.9rem;
  margin: 0.75rem 0;
  overflow-x: auto;
  white-space: pre;
}
.markdown-editor :deep(pre code) {
  background: transparent;
  border: 0;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}
</style>
