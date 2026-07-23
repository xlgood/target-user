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
          :class="fieldError(field) ? 'border-destructive' : ''"
          :placeholder="fieldPlaceholder(field)"
          :aria-invalid="Boolean(fieldError(field))"
          @input="setField(field.key, ($event.target as HTMLTextAreaElement).value)"
        />
        <select
          v-else-if="field.type === 'select'"
          :value="fieldValue(field.key)"
          class="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :class="fieldError(field) ? 'border-destructive' : ''"
          :aria-invalid="Boolean(fieldError(field))"
          @change="setField(field.key, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('checkout.manualFormSelectPlaceholder') }}</option>
          <option v-for="option in field.options || []" :key="option" :value="option">{{ option }}</option>
        </select>
        <div v-else-if="field.type === 'radio'" class="grid gap-2 rounded-md border bg-background p-3">
          <label v-for="option in field.options || []" :key="option" class="flex items-center gap-2 font-normal">
            <input
              :checked="fieldValue(field.key) === option"
              :name="`purchase-radio-${field.key}`"
              type="radio"
              :value="option"
              @change="setField(field.key, option)"
            />
            <span>{{ option }}</span>
          </label>
        </div>
        <div v-else-if="field.type === 'checkbox'" class="grid gap-2 rounded-md border bg-background p-3">
          <label v-for="option in field.options || []" :key="option" class="flex items-center gap-2 font-normal">
            <input
              :checked="isCheckboxChecked(field.key, option)"
              type="checkbox"
              :value="option"
              @change="toggleCheckboxValue(field.key, option, ($event.target as HTMLInputElement).checked)"
            />
            <span>{{ option }}</span>
          </label>
        </div>
        <input
          v-else
          :type="inputType(field.type)"
          :value="fieldValue(field.key)"
          class="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          :class="fieldError(field) ? 'border-destructive' : ''"
          :placeholder="fieldPlaceholder(field)"
          :aria-invalid="Boolean(fieldError(field))"
          @input="setField(field.key, ($event.target as HTMLInputElement).value)"
        />
        <span v-if="fieldError(field)" class="text-xs font-normal text-destructive">{{ fieldError(field) }}</span>
        <span v-if="fieldHelp(field)" class="text-xs font-normal leading-5 text-muted-foreground">
          {{ fieldHelp(field) }}
        </span>
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
  fieldErrors?: Record<string, string>
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
const fieldHelp = (field: any) => getLocalizedText(field?.help) || String(field?.help || '')
const fieldValue = (key: string) => props.modelValue?.[key] ?? ''
const fieldError = (field: any) => props.fieldErrors?.[String(field?.key || '').trim()] || ''
const inputType = (type: string) => ({ number: 'number', email: 'email', phone: 'tel', url: 'url' }[type] || 'text')

const setField = (key: string, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const isCheckboxChecked = (key: string, option: string) => {
  const value = fieldValue(key)
  return Array.isArray(value) && value.includes(option)
}

const toggleCheckboxValue = (key: string, option: string, checked: boolean) => {
  const current = fieldValue(key)
  const values = Array.isArray(current) ? [...current] : []
  if (checked && !values.includes(option)) values.push(option)
  if (!checked) values.splice(values.indexOf(option), 1)
  emit('update:modelValue', { ...props.modelValue, [key]: values })
}
</script>
