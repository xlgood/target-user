import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePurchaseFields } from '../src/utils/productPurchaseFieldValidation.ts'

test('email purchase fields require a valid address before purchase', () => {
  const fields = [{ key: 'contact', type: 'email', required: true }]
  assert.deepEqual(validatePurchaseFields(fields, { contact: '123' }), { contact: 'invalid' })
  assert.deepEqual(validatePurchaseFields(fields, { contact: 'buyer@example.com' }), {})
})

test('optional typed fields remain empty but reject invalid values', () => {
  const fields = [{ key: 'website', type: 'url', required: false }]
  assert.deepEqual(validatePurchaseFields(fields, {}), {})
  assert.deepEqual(validatePurchaseFields(fields, { website: 'not-a-url' }), { website: 'invalid' })
})

test('radio and checkbox purchase fields accept only configured options', () => {
  const fields = [
    { key: 'region', type: 'radio', required: true, options: ['US', 'EU'] },
    { key: 'features', type: 'checkbox', required: true, options: ['A', 'B'] },
  ]
  assert.deepEqual(validatePurchaseFields(fields, { region: 'US', features: ['A', 'B'] }), {})
  assert.deepEqual(validatePurchaseFields(fields, { region: 'APAC', features: ['A', 'C'] }), {
    region: 'option_invalid', features: 'option_invalid',
  })
})
