import test from 'node:test'
import assert from 'node:assert/strict'
import {
  blankLocalizedText,
  getLocalizedText,
  normalizeFooterLinksForForm,
  canEditResellerSiteConfig,
} from '../src/utils/resellerSiteConfig.ts'

test('blank localized text includes all supported storefront locales', () => {
  assert.deepEqual(blankLocalizedText(), { 'zh-CN': '', 'zh-TW': '', 'en-US': '' })
})

test('localized text fallback follows current locale then zh-CN then first non-empty', () => {
  const value = { 'zh-CN': '简体', 'zh-TW': '繁體', 'en-US': 'English' }
  assert.equal(getLocalizedText(value, 'en-US'), 'English')
  assert.equal(getLocalizedText({ 'zh-CN': '简体' }, 'zh-TW'), '简体')
  assert.equal(getLocalizedText({ 'en-US': 'English' }, 'zh-TW'), 'English')
})

test('footer links normalize missing localized names', () => {
  assert.deepEqual(
    normalizeFooterLinksForForm([{ name: { 'zh-CN': '客服' }, url: 'https://example.test' }]),
    [{ name: { 'zh-CN': '客服', 'zh-TW': '', 'en-US': '' }, url: 'https://example.test' }],
  )
})

test('site config editing requires opened and editable snapshot', () => {
  assert.equal(canEditResellerSiteConfig({ opened: true, can_edit: true }), true)
  assert.equal(canEditResellerSiteConfig({ opened: true, can_edit: false }), false)
  assert.equal(canEditResellerSiteConfig(null), false)
})
