import test from 'node:test'
import assert from 'node:assert/strict'
import { buildManualFormDataPayload, normalizeManualFormSchema } from '../src/utils/manualForm.ts'

test('checkout retains URL, radio, and checkbox purchase fields', () => {
  const fields = normalizeManualFormSchema({
    fields: [
      { key: 'link', type: 'url', required: true },
      { key: 'region', type: 'radio', required: true, options: ['US', 'EU'] },
      { key: 'features', type: 'checkbox', required: false, options: ['A', 'B'] },
    ],
  })

  assert.deepEqual(buildManualFormDataPayload([{ itemKey: '42', fields }], {
    42: {
      link: ' https://example.com/post/1 ', region: 'US', features: ['A', ' B ', ''],
    },
  }), {
    42: {
      link: 'https://example.com/post/1', region: 'US', features: ['A', 'B'],
    },
  })
})
