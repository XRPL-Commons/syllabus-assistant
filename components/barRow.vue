<template>
  <div class="flex items-center gap-3 py-1">
    <span class="w-36 sm:w-44 shrink-0 truncate text-sm text-gray-600 dark:text-gray-300" :title="label">{{ label }}</span>
    <div class="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div class="h-full bg-primary-500 rounded-full transition-all" :style="{ width: (max > 0 ? (count / max) * 100 : 0) + '%' }" />
    </div>
    <span class="w-6 shrink-0 text-right text-sm tabular-nums text-gray-500">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; count: number; max: number }>()
</script>
