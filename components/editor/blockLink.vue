<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <UInput
        :model-value="modelValue.url ?? ''"
        @update:model-value="onUrlChange"
        placeholder="https://example.com/article"
        class="flex-1"
      />
      <UButton
        :loading="isFetching"
        :disabled="!modelValue.url"
        color="neutral"
        variant="soft"
        @click="fetchPreview"
      >
        Fetch preview
      </UButton>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <a
      v-if="hasPreview"
      :href="modelValue.url"
      target="_blank"
      rel="noopener"
      class="flex gap-3 border border-gray-200 dark:border-gray-700 rounded overflow-hidden hover:border-primary-400 transition"
    >
      <img
        v-if="modelValue.image"
        :src="modelValue.image"
        :alt="modelValue.title ?? ''"
        class="w-32 h-24 object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
      />
      <div class="flex-1 p-3 min-w-0">
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ modelValue.siteName }}</p>
        <p class="font-medium dark:text-white truncate">{{ modelValue.title }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{{ modelValue.description }}</p>
      </div>
    </a>
    <p v-else-if="modelValue.url" class="text-xs text-gray-500 dark:text-gray-400">
      No preview yet — click <em>Fetch preview</em> to load the title, description, and thumbnail.
    </p>
  </div>
</template>

<script setup lang="ts">
interface LinkPayload {
  url?: string
  title?: string
  description?: string
  image?: string
  siteName?: string
}

const props = defineProps<{ modelValue: LinkPayload }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: LinkPayload): void }>()

const isFetching = ref(false)
const error = ref('')

const hasPreview = computed(() => Boolean(props.modelValue.title))

const onUrlChange = (value: string | number) => {
  emit('update:modelValue', { ...props.modelValue, url: String(value) })
}

const fetchPreview = async () => {
  if (!props.modelValue.url) return
  isFetching.value = true
  error.value = ''
  try {
    const data = await $fetch<{
      url: string
      title: string
      description: string
      image: string
      siteName: string
    }>('/api/og-preview', { query: { url: props.modelValue.url } })
    emit('update:modelValue', {
      url: data.url,
      title: data.title,
      description: data.description,
      image: data.image,
      siteName: data.siteName
    })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Could not fetch preview.'
  } finally {
    isFetching.value = false
  }
}
</script>
