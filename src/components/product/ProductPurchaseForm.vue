<template>
  <section v-if="fields.length" class="rounded-xl border border-primary/25 bg-primary/5 p-4">
    <h2 class="text-sm font-bold text-foreground">{{ t('productDetail.requiredInformation') }}</h2>
    <p v-if="hasComments" class="mt-1 text-xs text-muted-foreground">
      {{ t('productDetail.commentQuantityHint') }}
      <span class="font-semibold text-foreground">{{ commentQuantity }}</span>
    </p>
    <div class="mt-3 grid gap-3">
      <label v-for="field in fields" :key="field.key" class="grid gap-1.5 text-sm">
        <span class="font-semibold text-foreground">
          {{ fieldLabel(field) }}<span v-if="field.required" class="ml-1 text-destructive">*</span>
        </span>
        <textarea
          v-if="field.type === 'textarea'"
          :value="fieldValue(field.key)"
          rows="5"
          class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :placeholder="fieldPlaceholder(field)"
          @input="setField(field.key, ($event.target as HTMLTextAreaElement).value)"
        />
        <select
          v-else-if="field.type === 'select'"
          :value="fieldValue(field.key)"
          class="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          @change="setField(field.key, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('checkout.manualFormSelectPlaceholder') }}</option>
          <option v-for="option in field.options || []" :key="option" :value="option">{{ option }}</option>
        </select>
        <input
          v-else
          :type="inputType(field.type)"
          :value="fieldValue(field.key)"
          class="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :placeholder="fieldPlaceholder(field)"
          @input="setField(field.key, ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalized } from '../../composables/useProduct'

const props = defineProps<{
  fields: any[]
  modelValue: Record<string, any>
  commentQuantity: number
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: Record<string, any>): void
}>()

const { t } = useI18n()
const { getLocalizedText } = useLocalized()

const hasComments = computed(() => props.fields.some((field) => String(field?.key || '').trim() === 'comments'))

const fieldLabel = (field: any) => getLocalizedText(field?.label) || String(field?.label || field?.key || '')
const fieldPlaceholder = (field: any) => getLocalizedText(field?.placeholder) || String(field?.placeholder || '')
const fieldValue = (key: string) => props.modelValue?.[key] ?? ''
const inputType = (type: string) => ({ number: 'number', email: 'email', phone: 'tel', url: 'url' }[type] || 'text')

const setField = (key: string, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
