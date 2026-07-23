export type PurchaseFieldValidationError = 'required' | 'invalid' | 'option_invalid' | 'number_invalid' | 'number_range' | 'max_length'

type PurchaseField = {
  key?: unknown
  type?: unknown
  required?: unknown
  options?: unknown
  min?: unknown
  max?: unknown
  max_len?: unknown
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9\-()\s]{6,20}$/

const isEmpty = (value: unknown) => {
  if (Array.isArray(value)) return value.length === 0
  return String(value ?? '').trim() === ''
}

export function validatePurchaseField(field: PurchaseField, value: unknown): PurchaseFieldValidationError | null {
  const type = String(field?.type || 'text').trim().toLowerCase()
  if (isEmpty(value)) return field?.required ? 'required' : null

  const text = String(value).trim()
  const maxLength = Number(field?.max_len)
  if (Number.isInteger(maxLength) && maxLength > 0 && Array.from(text).length > maxLength) return 'max_length'

  if (type === 'email') return emailPattern.test(text) ? null : 'invalid'
  if (type === 'phone') return phonePattern.test(text) ? null : 'invalid'
  if (type === 'url') {
    try {
      const url = new URL(text)
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : 'invalid'
    } catch {
      return 'invalid'
    }
  }
  if (type === 'number') {
    const number = Number(text)
    if (!Number.isFinite(number)) return 'number_invalid'
    const min = Number(field?.min)
    const max = Number(field?.max)
    if ((Number.isFinite(min) && number < min) || (Number.isFinite(max) && number > max)) return 'number_range'
    return null
  }
  if (type === 'select' || type === 'radio') {
    const options = Array.isArray(field?.options) ? field.options.map(String) : []
    return options.includes(text) ? null : 'option_invalid'
  }
  return null
}

export function validatePurchaseFields(fields: unknown[], values: Record<string, unknown>): Record<string, PurchaseFieldValidationError> {
  const errors: Record<string, PurchaseFieldValidationError> = {}
  for (const field of fields) {
    if (!field || typeof field !== 'object') continue
    const key = String((field as PurchaseField).key || '').trim()
    if (!key) continue
    const error = validatePurchaseField(field as PurchaseField, values[key])
    if (error) errors[key] = error
  }
  return errors
}
