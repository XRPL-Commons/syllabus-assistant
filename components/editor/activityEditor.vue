<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Build the chapter as a sequence of blocks. Add markdown, a YouTube video, or an external link.
        </p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-left" @click="$emit('cancel')">
        Back
      </UButton>
    </div>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Chapter details</h2>
      </template>

      <div class="space-y-4">
        <UInput
          v-model="form.name"
          label="Name"
          placeholder="Lesson 1 — What is the XRP Ledger?"
          required
          :disabled="saving"
          class="w-full"
        />
        <UTextarea
          v-model="form.description"
          label="Description"
          placeholder="One or two sentences summarizing this chapter."
          :rows="3"
          :disabled="saving"
          class="w-full"
        />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Content</h2>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ form.blocks.length }} item{{ form.blocks.length === 1 ? '' : 's' }}
          </span>
        </div>
      </template>

      <div v-if="!form.blocks.length" class="text-sm text-gray-500 dark:text-gray-400 py-6 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded">
        No content yet. Click the + button below to add the first item.
      </div>

      <ul v-else class="space-y-4">
        <li
          v-for="(block, index) in form.blocks"
          :key="block.localId"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver($event, index)"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
          :class="[
            'border rounded p-4 bg-white dark:bg-gray-900 transition',
            dragOverIndex === index ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800' : 'border-gray-200 dark:border-gray-700',
            draggedIndex === index ? 'opacity-40' : ''
          ]"
        >
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-heroicons-bars-3" class="text-gray-400 cursor-grab" />
            <span class="text-xs text-gray-500 tabular-nums">{{ index + 1 }}</span>
            <UBadge variant="subtle" color="neutral" size="xs" class="uppercase tracking-wide">
              {{ blockLabel(block.type) }}
            </UBadge>
            <div class="ml-auto flex items-center gap-1">
              <UButton
                icon="i-heroicons-chevron-up"
                size="xs"
                variant="ghost"
                color="neutral"
                square
                :disabled="index === 0"
                @click="move(index, index - 1)"
              />
              <UButton
                icon="i-heroicons-chevron-down"
                size="xs"
                variant="ghost"
                color="neutral"
                square
                :disabled="index === form.blocks.length - 1"
                @click="move(index, index + 1)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="xs"
                variant="ghost"
                color="error"
                square
                @click="removeBlock(index)"
              />
            </div>
          </div>

          <EditorBlockMarkdown
            v-if="block.type === 'markdown'"
            v-model="block.payload"
          />
          <EditorBlockYoutube
            v-else-if="block.type === 'youtube'"
            v-model="block.payload"
          />
          <EditorBlockLink
            v-else-if="block.type === 'link'"
            v-model="block.payload"
          />
          <EditorBlockPdf
            v-else-if="block.type === 'pdf'"
            v-model="block.payload"
          />
        </li>
      </ul>

      <template #footer>
        <div class="flex justify-center">
          <UDropdownMenu :items="addItemMenu" :popper="{ placement: 'top' }">
            <UButton
              icon="i-heroicons-plus"
              variant="outline"
              color="neutral"
              size="sm"
              class="rounded-full"
              aria-label="Add content"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UCard>

    <div class="flex items-center justify-end gap-3">
      <UButton color="neutral" variant="ghost" :disabled="saving" @click="$emit('cancel')">
        Cancel
      </UButton>
      <UButton :loading="saving" :disabled="!isFormValid" @click="onSubmit">
        {{ submitLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type BlockType = 'markdown' | 'youtube' | 'link' | 'pdf'

interface EditorBlock {
  localId: string
  type: BlockType
  payload: Record<string, any>
}

interface ActivityForm {
  name: string
  description: string
  blocks: EditorBlock[]
}

interface InitialActivity {
  name?: string
  description?: string
  blocks?: Array<{ type: BlockType; payload?: Record<string, any> }>
}

const props = defineProps<{
  initial?: InitialActivity | null
  saving?: boolean
  title?: string
  submitLabel?: string
}>()

const emit = defineEmits<{
  (e: 'submit', value: { name: string; description: string; blocks: Array<{ type: BlockType; order: number; payload: Record<string, any> }> }): void
  (e: 'cancel'): void
}>()

const title = computed(() => props.title ?? 'Activity')
const submitLabel = computed(() => props.submitLabel ?? 'Save')

const makeLocalId = () => `b_${Math.random().toString(36).slice(2, 10)}`

const form = reactive<ActivityForm>({
  name: '',
  description: '',
  blocks: []
})

// Hydrate from initial.
watch(
  () => props.initial,
  initial => {
    if (!initial) return
    form.name = initial.name ?? ''
    form.description = initial.description ?? ''
    form.blocks = (initial.blocks ?? []).map(b => ({
      localId: makeLocalId(),
      type: b.type,
      payload: b.payload ? { ...b.payload } : {}
    }))
  },
  { immediate: true }
)

const isFormValid = computed(() => Boolean(form.name.trim()))

const addBlock = (type: BlockType) => {
  form.blocks.push({ localId: makeLocalId(), type, payload: {} })
}

const removeBlock = (index: number) => {
  form.blocks.splice(index, 1)
}

const move = (from: number, to: number) => {
  if (to < 0 || to >= form.blocks.length) return
  const [moved] = form.blocks.splice(from, 1)
  form.blocks.splice(to, 0, moved)
}

const blockLabel = (type: BlockType) => ({
  markdown: 'Text',
  youtube: 'Video',
  link: 'Link',
  pdf: 'PDF'
}[type])

const addItemMenu = computed(() => [
  [
    { label: 'Text', icon: 'i-heroicons-document-text', onSelect: () => addBlock('markdown') },
    { label: 'Video', icon: 'i-heroicons-play', onSelect: () => addBlock('youtube') },
    { label: 'Link', icon: 'i-heroicons-link', onSelect: () => addBlock('link') },
    { label: 'PDF', icon: 'i-heroicons-document', onSelect: () => addBlock('pdf') }
  ]
])

// Drag-and-drop reordering.
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const onDragStart = (e: DragEvent, index: number) => {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}
const onDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  dragOverIndex.value = index
}
const onDrop = (_e: DragEvent, dropIndex: number) => {
  const from = draggedIndex.value
  draggedIndex.value = null
  dragOverIndex.value = null
  if (from === null || from === dropIndex) return
  move(from, dropIndex)
}
const onDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

const onSubmit = () => {
  if (!isFormValid.value) return
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim(),
    blocks: form.blocks.map((b, index) => ({
      type: b.type,
      order: index,
      payload: b.payload
    }))
  })
}
</script>
