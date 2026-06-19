<template>
  <div>
    <span v-if="label" class="mb-2 block text-xs font-medium text-muted-foreground">{{ label }}</span>
    <div class="flex items-center gap-2">
      <label
        class="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input transition-shadow hover:shadow-sm"
      >
        <span class="absolute inset-0" :style="swatchStyle"></span>
        <input
          type="color"
          :value="pickerValue"
          class="absolute -left-1 -top-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)] cursor-pointer opacity-0"
          @input="onPick"
        />
      </label>
      <Input
        :model-value="modelValue"
        :placeholder="placeholder"
        class="font-mono"
        maxlength="9"
        @update:model-value="(v: string | number) => emit('update:modelValue', String(v))"
      />
      <button
        v-if="modelValue"
        type="button"
        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        :aria-label="clearLabel"
        @click="emit('update:modelValue', '')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  clearLabel?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const normalizeHex = (raw: string): string | null => {
  const v = (raw || '').trim()
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return (
      '#' +
      v
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
        .toLowerCase()
    )
  }
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase()
  return null
}

const pickerValue = computed(() => normalizeHex(props.modelValue) || '#2563eb')

const swatchStyle = computed(() => {
  const hex = normalizeHex(props.modelValue)
  if (hex) return { backgroundColor: hex }
  return {
    backgroundImage: 'conic-gradient(#cbd5e1 0 25%, #fff 0 50%, #cbd5e1 0 75%, #fff 0)',
    backgroundSize: '10px 10px',
  }
})

const onPick = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>
