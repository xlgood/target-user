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
