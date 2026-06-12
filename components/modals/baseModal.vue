<template>
  <UModal v-model:open="isOpen" :prevent-close="preventClose">
    <slot name="trigger" />

    <template #content>
      <UCard>
        <template #header>
          <slot name="header">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold leading-6 dark:text-white">{{ title }}</h3>
                <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
              </div>
              <slot name="header-extra" />
            </div>
          </slot>
        </template>

        <slot />

        <template v-if="$slots.footer || showDefaultFooter" #footer>
          <slot name="footer">
            <div class="flex justify-end">
              <UButton variant="ghost" color="neutral" @click="isOpen = false">{{ closeLabel }}</UButton>
            </div>
          </slot>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
/**
 * Generic modal chrome: <UModal> + <UCard> with header / body / footer slots.
 * Used app-wide for view modals, confirmations and custom dialogs.
 */
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  preventClose?: boolean
  closeLabel?: string
  /** Render a default "Close" footer when no #footer slot is provided */
  showDefaultFooter?: boolean
}>(), {
  closeLabel: 'Close',
  preventClose: false,
  showDefaultFooter: false
})

const isOpen = defineModel<boolean>('open', { default: false })
</script>
