<template>
  <div class="lesson-view space-y-6">
    <template v-for="(block, i) in blocks" :key="block._id ?? i">
      <!-- Markdown -->
      <div
        v-if="block.type === 'markdown'"
        :id="`block-${block._id ?? i}`"
        class="markdown-body scroll-mt-24"
        v-html="renderMarkdown(block.payload?.content ?? '')"
      />

      <!-- YouTube -->
      <div
        v-else-if="block.type === 'youtube'"
        :id="`block-${block._id ?? i}`"
        class="scroll-mt-24"
      >
        <div
          v-if="youtubeEmbedUrl(block.payload?.url ?? '')"
          class="relative w-full aspect-video rounded overflow-hidden bg-black"
        >
          <iframe
            :src="youtubeEmbedUrl(block.payload?.url ?? '') ?? ''"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
        <details v-if="block.payload?.transcript" class="text-sm mt-2">
          <summary class="cursor-pointer text-gray-600 dark:text-gray-300 select-none">
            Transcript
          </summary>
          <p class="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
            {{ block.payload.transcript }}
          </p>
        </details>
      </div>

      <!-- Link card -->
      <a
        v-else-if="block.type === 'link' && block.payload?.url"
        :id="`block-${block._id ?? i}`"
        :href="block.payload.url"
        target="_blank"
        rel="noopener"
        class="flex gap-3 border border-gray-200 dark:border-gray-700 rounded overflow-hidden hover:border-primary-400 transition scroll-mt-24"
      >
        <img
          v-if="block.payload?.image"
          :src="block.payload.image"
          :alt="block.payload?.title ?? ''"
          class="w-32 h-24 object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
        >
        <div class="flex-1 p-3 min-w-0">
          <p v-if="block.payload?.siteName" class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ block.payload.siteName }}
          </p>
          <p class="font-medium dark:text-white truncate">
            {{ block.payload?.title || block.payload.url }}
          </p>
          <p
            v-if="block.payload?.description"
            class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
          >
            {{ block.payload.description }}
          </p>
        </div>
      </a>

      <!-- PDF -->
      <div
        v-else-if="block.type === 'pdf' && block.payload?.url"
        :id="`block-${block._id ?? i}`"
        class="space-y-2 scroll-mt-24"
      >
        <p
          v-if="block.payload?.title"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {{ block.payload.title }}
        </p>
        <div class="w-full aspect-[4/3] border border-gray-200 dark:border-gray-700 rounded overflow-hidden bg-gray-50 dark:bg-gray-800">
          <iframe :src="block.payload.url" class="w-full h-full" title="PDF" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { renderMarkdown } from '~/utils/markdown'
import { youtubeEmbedUrl } from '~/utils/youtube'

interface Block {
  _id?: string
  type: 'markdown' | 'youtube' | 'link' | 'pdf'
  order?: number
  payload?: Record<string, any>
}

defineProps<{ blocks?: Block[] }>()
</script>

<style scoped>
.markdown-body :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 1.25rem 0 0.75rem;
}
.markdown-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 1.1rem 0 0.6rem;
}
.markdown-body :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}
.markdown-body :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}
.markdown-body :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.markdown-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.markdown-body :deep(li) { margin: 0.2rem 0; }
.markdown-body :deep(a) { color: rgb(59, 130, 246); text-decoration: underline; }
.markdown-body :deep(strong) { font-weight: 700; }
.markdown-body :deep(em) { font-style: italic; }
.markdown-body :deep(code) {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875em;
  background: rgba(156, 163, 175, 0.15);
  border: 1px solid rgba(156, 163, 175, 0.35);
  border-radius: 0.25rem;
  padding: 0.1em 0.35em;
}
.markdown-body :deep(pre) {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.875em;
  background: rgba(156, 163, 175, 0.12);
  border: 1px solid rgba(156, 163, 175, 0.3);
  border-radius: 0.375rem;
  padding: 0.75rem 0.9rem;
  margin: 0.75rem 0;
  overflow-x: auto;
}
.markdown-body :deep(pre code) {
  background: transparent; border: 0; padding: 0; border-radius: 0; font-size: inherit;
}
</style>
