<template>
  <div class="space-y-3">
    <UInput
      :model-value="modelValue.url ?? ''"
      @update:model-value="onUrlChange"
      placeholder="Paste a YouTube URL (https://www.youtube.com/watch?v=… or https://youtu.be/…)"
      class="w-full"
    />

    <div
      v-if="embedUrl"
      class="relative w-full aspect-video rounded overflow-hidden bg-black"
    >
      <iframe
        :src="embedUrl"
        class="absolute inset-0 w-full h-full"
        frameborder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
    <p
      v-else-if="modelValue.url"
      class="text-sm text-amber-600 dark:text-amber-400"
    >
      That URL doesn't look like a YouTube link.
    </p>

    <details class="text-sm">
      <summary class="cursor-pointer text-gray-600 dark:text-gray-300 select-none">
        Transcript (optional)
      </summary>
      <UTextarea
        class="w-full mt-2 font-mono text-sm"
        :model-value="modelValue.transcript ?? ''"
        @update:model-value="onTranscriptChange"
        placeholder="Paste the video transcript here so learners can read along."
        :rows="6"
      />
    </details>
  </div>
</template>

<script setup lang="ts">
import { youtubeEmbedUrl } from '~/utils/youtube'

interface YoutubePayload {
  url?: string
  transcript?: string
}

const props = defineProps<{ modelValue: YoutubePayload }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: YoutubePayload): void }>()

const embedUrl = computed(() => youtubeEmbedUrl(props.modelValue.url ?? ''))

const onUrlChange = (value: string | number) => {
  emit('update:modelValue', { ...props.modelValue, url: String(value) })
}
const onTranscriptChange = (value: string | number) => {
  emit('update:modelValue', { ...props.modelValue, transcript: String(value) })
}
</script>
