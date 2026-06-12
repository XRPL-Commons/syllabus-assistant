<template>
  <ModalsBaseModal v-model:open="isOpen" :title="title" :prevent-close="loading">
    <p v-if="!$slots.default && message" class="text-sm text-gray-600 dark:text-gray-400">{{ message }}</p>
    <div v-else class="text-sm text-gray-600 dark:text-gray-400">
      <slot />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" type="button" :disabled="loading" @click="onCancel">
          {{ cancelLabel }}
        </UButton>
        <UButton :color="confirmColor" type="button" :loading="loading" @click="$emit('confirm')">
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </ModalsBaseModal>
</template>

<script setup lang="ts">
/**
 * Generic confirmation dialog. Use for delete, reset, archive, etc.
 * Pass the body via `message` prop or the default slot.
 */
withDefaults(defineProps<{
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
  loading?: boolean
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmColor: 'primary',
  loading: false
})

const isOpen = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

const onCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>
