<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        icon="i-heroicons-arrow-up-tray"
        size="sm"
        variant="soft"
        color="neutral"
        :loading="isUploading"
        @click="triggerUpload"
      >
        {{ modelValue.url ? 'Replace PDF' : 'Upload PDF' }}
      </UButton>
      <span v-if="modelValue.filename" class="text-xs text-gray-500 dark:text-gray-400 truncate">
        {{ modelValue.filename }}
      </span>
      <UButton
        v-if="modelValue.url"
        icon="i-heroicons-x-mark"
        size="xs"
        variant="ghost"
        color="error"
        square
        class="ml-auto"
        aria-label="Remove PDF"
        @click="clear"
      />
    </div>

    <UInput
      :model-value="modelValue.title ?? ''"
      @update:model-value="onTitleChange"
      placeholder="Caption (optional) — e.g. Lecture 1 slides"
      class="w-full"
    />

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <div
      v-if="modelValue.url"
      class="w-full aspect-[4/3] border border-gray-200 dark:border-gray-700 rounded overflow-hidden bg-gray-50 dark:bg-gray-800"
    >
      <iframe
        :src="modelValue.url"
        class="w-full h-full"
        title="PDF preview"
      />
    </div>
    <div
      v-else
      class="text-sm text-gray-500 dark:text-gray-400 py-8 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded"
    >
      No PDF attached yet.
    </div>

    <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="onFileSelected">
  </div>
</template>

<script setup lang="ts">
interface PdfPayload {
  url?: string
  filename?: string
  size?: number
  title?: string
}

const props = defineProps<{ modelValue: PdfPayload }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: PdfPayload): void }>()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const error = ref('')

const triggerUpload = () => {
  error.value = ''
  fileInput.value?.click()
}

const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-selecting the same file later
  if (!file) return

  isUploading.value = true
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const data = await $fetch<{ url: string; filename: string; size: number }>('/api/upload/pdf', {
      method: 'POST',
      body: fd
    })
    emit('update:modelValue', {
      ...props.modelValue,
      url: data.url,
      filename: data.filename,
      size: data.size
    })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Upload failed.'
  } finally {
    isUploading.value = false
  }
}

const onTitleChange = (value: string | number) => {
  emit('update:modelValue', { ...props.modelValue, title: String(value) })
}
const clear = () => {
  emit('update:modelValue', {})
}
</script>
