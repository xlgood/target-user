export interface ManualFormField {
  key: string
  type: string
  required: boolean
  label?: Record<string, string>
  placeholder?: Record<string, string>
  regex?: string
  min?: number
  max?: number
  max_len?: number
  options: string[]
}

export interface ManualFormPayloadProduct {
  itemKey: string
  fields: ManualFormField[]
}

const supportedManualFormTypes = new Set([
  'text', 'textarea', 'phone', 'email', 'url', 'number', 'select', 'radio', 'checkbox',
])

export function normalizeManualFormSchema(rawSchema: unknown): ManualFormField[] {
  const rawFields = Array.isArray((rawSchema as { fields?: unknown })?.fields)
    ? (rawSchema as { fields: unknown[] }).fields
    : []

  return rawFields
    .map((rawField: any) => {
      const key = String(rawField?.key || '').trim()
      const type = String(rawField?.type || '').trim()
      if (!key || !supportedManualFormTypes.has(type)) return null

      const options = Array.isArray(rawField?.options)
        ? rawField.options.map((item: any) => String(item || '').trim()).filter(Boolean)
        : []
      const minValue = Number(rawField?.min)
      const maxValue = Number(rawField?.max)
      const maxLenValue = Number(rawField?.max_len)
      return {
        key,
        type,
        required: Boolean(rawField?.required),
        label: rawField?.label || undefined,
        placeholder: rawField?.placeholder || undefined,
        regex: String(rawField?.regex || '').trim() || undefined,
        min: Number.isFinite(minValue) ? minValue : undefined,
        max: Number.isFinite(maxValue) ? maxValue : undefined,
        max_len: Number.isFinite(maxLenValue) ? maxLenValue : undefined,
        options: Array.from(new Set(options)),
      } as ManualFormField
    })
    .filter(Boolean) as ManualFormField[]
}

export function buildManualFormDataPayload(
  products: ManualFormPayloadProduct[],
  valuesByProduct: Record<string, Record<string, unknown>>,
) {
  const payload: Record<string, Record<string, string | string[]>> = {}
  for (const product of products) {
    const values = valuesByProduct[product.itemKey] || {}
    const row: Record<string, string | string[]> = {}
    for (const field of product.fields) {
      const rawValue = values[field.key]
      if (field.type === 'checkbox') {
        const values = Array.isArray(rawValue)
          ? rawValue.map((item) => String(item).trim()).filter(Boolean)
          : []
        if (values.length > 0) row[field.key] = values
        continue
      }
      const value = rawValue == null ? '' : String(rawValue).trim()
      if (value) row[field.key] = value
    }
    payload[product.itemKey] = row
  }
  return payload
}
