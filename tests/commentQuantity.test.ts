import test from 'node:test'
import assert from 'node:assert/strict'
import { countNonEmptyLines } from '../src/utils/commentQuantity.ts'

test('custom comment quantity counts only non-empty lines', () => {
  assert.equal(countNonEmptyLines('first\n\n second \r\n   \nthird'), 3)
  assert.equal(countNonEmptyLines(' \n\t'), 0)
})
