<template>
  <div class="mx-auto w-full max-w-[1240px] px-4 pb-10 sm:px-6">
    <div v-if="loading" class="grid gap-5 py-6 lg:grid-cols-[1.05fr_.95fr]">
      <div class="h-[620px] rounded-[26px] border bg-card"></div>
      <div class="h-[620px] rounded-[26px] border bg-card"></div>
    </div>

    <template v-else-if="product">
      <nav class="flex flex-wrap items-center gap-1.5 py-5 text-xs font-semibold text-muted-foreground">
        <RouterLink to="/" class="hover:text-primary">{{ t('nav.home') }}</RouterLink>
        <ChevronRight class="h-4 w-4 flex-none" />
        <RouterLink :to="catalogBackPath" class="hover:text-primary">{{ catalogBackLabel }}</RouterLink>
        <ChevronRight class="h-4 w-4 flex-none" />
        <span class="max-w-[42ch] truncate text-foreground">{{ getLocalizedText(product.title) }}</span>
      </nav>

      <!-- TGX accounts use a product-info sheet with the purchase controls kept together. -->
      <section v-if="isAccount" class="account-sheet overflow-hidden rounded-[26px] border bg-card shadow-[var(--shadow)]">
        <header class="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><ShoppingBag class="h-5 w-5" /></span><div><p class="text-lg font-extrabold">{{ t('productDetail.details') }}</p><p class="text-xs font-semibold text-muted-foreground">{{ t('storefront.catalog.accounts') }}</p></div></div>
          <RouterLink :to="catalogBackPath" class="grid h-10 w-10 place-items-center rounded-xl border border-violet-500/20 bg-violet-500/[.06] text-violet-700 transition hover:bg-violet-500/10 dark:text-violet-200" :aria-label="catalogBackLabel"><X class="h-5 w-5" /></RouterLink>
        </header>

        <div class="account-sheet-body p-5 sm:p-7">
          <div class="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5"><div class="min-w-0"><p class="text-xs font-bold uppercase tracking-[.12em] text-violet-600 dark:text-violet-300">{{ categoryName || t('products.categoryLabel') }}</p><h1 class="mt-2 max-w-[34ch] text-2xl font-extrabold leading-[1.25] tracking-[-.035em] sm:text-3xl">{{ getLocalizedText(product.title) }}</h1></div><span class="account-status"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>{{ getStockStatusLabel(product) }}</span></div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2"><div class="account-metric"><Tag class="h-4 w-4 text-violet-600 dark:text-violet-300" /><span>{{ t('products.price') }}</span><strong>{{ unitPrice }}</strong></div><div class="account-metric"><PackageCheck class="h-4 w-4 text-violet-600 dark:text-violet-300" /><span>{{ t('productDetail.fulfillmentLabel') }}</span><strong>{{ getFulfillmentTypeLabel(product.fulfillment_type) }}</strong></div></div>

          <div class="account-layout mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,.85fr)]">
            <div class="min-w-0 space-y-5">
              <section class="account-notice"><Clock3 class="h-5 w-5" /><div><strong>{{ t('productDetail.deliveryReassurance') }}</strong><p>{{ t('storefront.detail.accountGuideLede') }}</p></div></section>

              <RouterLink v-if="showAccountAccessGuide" to="/guides/account-access" class="account-guide"><CircleHelp class="h-5 w-5" /><span><strong>{{ t('accountAccessGuide.productLink') }}</strong><small>{{ t('storefront.detail.accountStepGuideBody') }}</small></span><ArrowRight class="ml-auto h-5 w-5" /></RouterLink>

              <section class="account-description"><div class="section-heading"><FileText class="h-5 w-5" /><h2>{{ t('productDetail.details') }}</h2></div><div v-if="accountDescriptionLines.length" class="account-copy"><p v-for="line in accountDescriptionLines" :key="line">{{ line }}</p></div><div v-else class="account-copy"><p>{{ t('storefront.detail.accountDescriptionFallback') }}</p></div><div v-if="product.content" class="account-rich-copy" v-html="processHtmlForDisplay(getLocalizedText(product.content))"></div></section>

              <section v-if="images.length" class="account-images"><div class="section-heading"><Layers3 class="h-5 w-5" /><h2>{{ t('storefront.detail.accountPreview') }}</h2></div><div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"><div class="grid min-h-44 place-items-center overflow-hidden rounded-xl bg-secondary"><img :src="currentImage" :alt="getLocalizedText(product.title)" class="h-full max-h-64 w-full" :class="isProviderCatalogImage(currentImage) ? 'object-contain' : 'object-cover'" /></div><div v-if="images.length > 1" class="flex gap-2 overflow-x-auto sm:max-h-64 sm:flex-col"><button v-for="(image, index) in images" :key="image" type="button" class="h-14 w-16 flex-none overflow-hidden rounded-lg border-2 bg-secondary" :class="image === currentImage ? 'border-violet-500' : 'border-border'" @click="currentImage = image"><img :src="image" :alt="String(index + 1)" class="h-full w-full" :class="isProviderCatalogImage(image) ? 'object-contain' : 'object-cover'" /></button></div></div></section>
            </div>

            <aside class="account-purchase-card lg:sticky lg:top-[92px] lg:self-start"><div class="flex items-center justify-between border-b border-border pb-4"><div><p class="text-xs font-bold uppercase tracking-[.12em] text-violet-600 dark:text-violet-300">{{ t('storefront.detail.accountOrder') }}</p><h2 class="mt-1 text-lg font-extrabold">{{ t('storefront.detail.accountOrderTitle') }}</h2></div><KeyRound class="h-6 w-6 text-violet-600 dark:text-violet-300" /></div>
              <div v-if="activeSkus.length" class="mt-5"><p class="field-label">{{ t('storefront.detail.accountSkuTitle') }}</p><div class="mt-2 grid gap-2"><button v-for="sku in activeSkus" :key="sku.id" type="button" class="account-sku" :class="[normalizeSkuId(sku.id) === selectedSkuId ? 'account-sku-selected' : '', !isSkuPurchasable(sku) ? 'cursor-not-allowed opacity-40' : '']" :disabled="!isSkuPurchasable(sku)" @click="selectedSkuId = normalizeSkuId(sku.id)"><span class="min-w-0"><strong>{{ skuDisplayText(sku) }}</strong><small>{{ skuStockText(sku) }}</small></span><span class="font-extrabold tabular-nums text-violet-700 dark:text-violet-200">{{ formatPriceForQuantity(sku.price_amount, quantity, sku.price_quantity_basis ?? product.price_quantity_basis, siteCurrency) }}</span></button></div></div>
              <div v-if="checkoutFields.length" class="mt-5"><p class="field-label">{{ t('storefront.list.accountForm') }}</p><ProductPurchaseForm class="mt-2" :show-heading="false" v-model="purchaseFormData" :fields="checkoutFields" :field-errors="purchaseFormFieldErrors" :comment-quantity="commentQuantity" /></div>
              <div v-if="!usesCommentQuantity" class="mt-5"><p class="field-label">{{ t('productDetail.quantity') }}</p><QuantityControl class="mt-2" :quantity="quantity" :minimum="quantityEffectiveMin" :maximum="quantityEffectiveLimit ?? undefined" @decrease="quantity = Math.max(quantityEffectiveMin, quantity - 1)" @increase="quantity += 1" @input="handleQuantityInput" /></div>
              <PurchaseAlerts :reason="cannotPurchaseReason" :warning="purchaseWarning" />
              <div class="account-total mt-5"><span>{{ t('storefront.detail.orderTotal') }}</span><strong>{{ purchasePricing.display }}</strong><small v-if="purchasePricing.original">{{ purchasePricing.original }}</small></div>
              <div ref="purchaseActionsRef" class="mt-4 grid gap-2"><Button v-if="requiresLogin" class="h-12 rounded-xl !bg-violet-600 text-base font-extrabold hover:!bg-violet-700" @click="goLogin">{{ t('productDetail.loginToBuy') }}</Button><template v-else><Button class="h-12 rounded-xl !bg-violet-600 text-base font-extrabold hover:!bg-violet-700" :disabled="!canPurchase" @click="buyNow"><Zap class="h-4 w-4" />{{ t('storefront.detail.accountBuy') }}</Button><Button variant="outline" class="h-11 rounded-xl font-bold" :disabled="!canPurchase" @click="addToCart"><ShoppingCart class="h-4 w-4" />{{ t('productDetail.addToCart') }}</Button></template></div>
            </aside>
          </div>
        </div>
      </section>

      <!-- FansGurus services use a dedicated terminal-like order console. -->
      <section v-else-if="isService" class="service-console overflow-hidden rounded-[26px] border">
        <header class="service-console-header"><div><span class="service-console-eyebrow"><TrendingUp class="h-4 w-4" />{{ t('storefront.catalog.services') }}</span><h1 class="mt-3 text-2xl font-extrabold tracking-[-.035em] sm:text-3xl">{{ getLocalizedText(product.title) }}</h1><div class="service-header-meta"><span><Layers3 class="h-3.5 w-3.5" />{{ categoryName || t('products.categoryLabel') }}</span><span v-for="fact in serviceDetailFacts.slice(0, 3)" :key="`${fact.label}-${fact.value}`"><strong>{{ fact.label }}</strong>{{ fact.value }}</span></div></div><RouterLink :to="catalogBackPath" class="console-close" :aria-label="catalogBackLabel"><X class="h-5 w-5" /></RouterLink></header>

        <div class="service-console-body grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
          <section class="console-config-card"><div class="console-card-heading"><span class="console-icon"><SlidersHorizontal class="h-5 w-5" /></span><div><p>{{ t('storefront.detail.serviceSetup') }}</p><h2>{{ t('storefront.detail.serviceSetupTitle') }}</h2></div></div>
            <div v-if="activeSkus.length" class="console-field"><p>{{ t('storefront.detail.serviceSkuTitle') }}</p><div class="mt-2 grid gap-2"><button v-for="sku in activeSkus" :key="sku.id" type="button" class="service-plan" :class="[normalizeSkuId(sku.id) === selectedSkuId ? 'service-plan-selected' : '', !isSkuPurchasable(sku) ? 'cursor-not-allowed opacity-40' : '']" :disabled="!isSkuPurchasable(sku)" @click="selectedSkuId = normalizeSkuId(sku.id)"><span class="grid h-9 w-9 place-items-center rounded-lg bg-indigo-400/10 text-indigo-300"><component :is="normalizeSkuId(sku.id) === selectedSkuId ? BadgeCheck : Layers3" class="h-4 w-4" /></span><span class="min-w-0 flex-1 text-left"><strong>{{ skuDisplayText(sku) }}</strong><small>{{ skuStockText(sku) }}</small></span><span class="service-plan-rate">{{ formatServiceRate(sku) }}</span></button></div></div>
            <div v-if="checkoutFields.length" class="console-field"><p>{{ t('storefront.detail.serviceFields') }}</p><ProductPurchaseForm class="terminal-purchase-form mt-2" :show-heading="false" v-model="purchaseFormData" :fields="checkoutFields" :field-errors="purchaseFormFieldErrors" :comment-quantity="commentQuantity" /></div>
            <div v-if="!usesCommentQuantity" class="console-field"><p>{{ t('productDetail.quantity') }}</p><div class="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(140px,.4fr)]"><QuantityControl :quantity="quantity" :minimum="quantityEffectiveMin" :maximum="quantityEffectiveLimit ?? undefined" @decrease="quantity = Math.max(quantityEffectiveMin, quantity - 1)" @increase="quantity += 1" @input="handleQuantityInput" /><div class="console-limit"><span>{{ t('productDetail.quantity') }}</span><strong>{{ quantityLimitText }}</strong></div></div></div>
            <section v-if="serviceDetailFacts.length || serviceNoteLines.length" class="service-notes"><div class="flex items-center gap-2"><FileText class="h-4 w-4 text-indigo-300" /><h3>{{ t('productDetail.details') }}</h3></div><div v-if="serviceDetailFacts.length" class="service-spec-grid"><div v-for="fact in serviceDetailFacts" :key="`${fact.label}-${fact.value}`" class="service-spec"><span>{{ fact.label }}</span><strong>{{ fact.value }}</strong></div></div><div v-if="serviceNoteLines.length" class="mt-4 grid gap-2"><div v-for="line in serviceNoteLines" :key="line" class="service-note"><span></span><p>{{ line }}</p></div></div></section>
          </section>

          <aside class="console-summary-card lg:sticky lg:top-[92px] lg:self-start"><div class="console-card-heading"><span class="console-icon"><ReceiptText class="h-5 w-5" /></span><div><p>{{ t('storefront.detail.serviceSummary') }}</p><h2>{{ t('storefront.detail.serviceSummaryTitle') }}</h2></div></div><div class="console-facts mt-5"><div v-for="fact in serviceSummaryFacts" :key="fact.label" class="console-fact"><span>{{ fact.label }}</span><strong>{{ fact.value }}</strong></div></div><div v-if="serviceDetailFacts.length" class="console-attribute-facts"><p>{{ t('productDetail.details') }}</p><div v-for="fact in serviceDetailFacts.slice(0, 4)" :key="`${fact.label}-${fact.value}`" class="console-fact"><span>{{ fact.label }}</span><strong>{{ fact.value }}</strong></div></div><div class="console-total"><span>{{ t('storefront.detail.orderTotal') }}</span><strong>{{ purchasePricing.display }}</strong><small v-if="purchasePricing.original">{{ purchasePricing.original }}</small></div><PurchaseAlerts :reason="cannotPurchaseReason" :warning="purchaseWarning" terminal /><div ref="purchaseActionsRef" class="mt-5 grid gap-2"><Button v-if="requiresLogin" class="h-12 rounded-xl !bg-indigo-500 text-base font-extrabold hover:!bg-indigo-400" @click="goLogin">{{ t('productDetail.loginToBuy') }}</Button><template v-else><Button class="h-12 rounded-xl !bg-indigo-500 text-base font-extrabold hover:!bg-indigo-400" :disabled="!canPurchase" @click="buyNow"><Zap class="h-4 w-4" />{{ t('storefront.detail.serviceBuy') }}</Button><Button variant="outline" class="h-11 rounded-xl border-slate-700 !bg-transparent text-slate-200 hover:!bg-slate-800" :disabled="!canPurchase" @click="addToCart"><ShoppingCart class="h-4 w-4" />{{ t('productDetail.addToCart') }}</Button></template></div><p class="console-help"><CircleHelp class="h-4 w-4" />{{ t('storefront.detail.serviceOrderHint') }}</p></aside>
        </div>
      </section>

      <section v-else class="rounded-[26px] border bg-card p-6"><h1 class="text-3xl font-extrabold">{{ getLocalizedText(product.title) }}</h1><p class="mt-4 text-muted-foreground">{{ getLocalizedText(product.description) }}</p></section>

      <section v-if="relatedPosts.length" class="mt-8"><h2 class="text-xl font-extrabold">{{ t('productDetail.relatedPosts') }}</h2><div class="mt-4 grid gap-4 md:grid-cols-3"><RouterLink v-for="post in relatedPosts" :key="post.id" class="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]" :to="`/blog/${post.slug}`"><span class="text-xs font-semibold text-muted-foreground">{{ formatRelatedPostDate(post.published_at) }}</span><h3 class="mt-3 line-clamp-2 font-extrabold">{{ getLocalizedText(post.title) }}</h3><p v-if="post.summary" class="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ getLocalizedText(post.summary) }}</p></RouterLink></div></section>

      <VaultProductMobileBar :visible="showMobileBar && !!product && !loading" :catalog="product.catalog" :requires-login="requiresLogin" :can-purchase="canPurchase" :show-member-price="mobileBarShowMemberPrice" :member-price-display="mobileBarMemberPriceDisplay" :show-sku-promotion-price="mobileBarShowSkuPromotionPrice" :sku-promotion-price-display="mobileBarSkuPromotionPriceDisplay" :show-sku-price="mobileBarShowSkuPrice" :sku-price-display="mobileBarSkuPriceDisplay" :show-product-promotion-price="mobileBarShowProductPromotionPrice" :product-promotion-price-display="mobileBarProductPromotionPriceDisplay" :product-price-display="mobileBarProductPriceDisplay" @add-to-cart="addToCart" @buy-now="buyNow" @go-login="goLogin" />
    </template>

    <div v-else class="my-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center text-muted-foreground"><AlertCircle class="h-12 w-12 opacity-60" /><p>{{ t('productDetail.notFound') }}</p><div class="mt-2 flex gap-2"><Button size="sm" class="rounded-full" @click="loadProduct"><RotateCw class="h-4 w-4" />{{ t('errorBoundary.retry') }}</Button><Button as-child variant="outline" size="sm" class="rounded-full"><RouterLink to="/products">{{ t('productDetail.backToProducts') }}</RouterLink></Button></div></div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertCircle, ArrowRight, BadgeCheck, ChevronRight, CircleHelp, Clock3, FileText, KeyRound, Layers3, Minus, PackageCheck, ReceiptText, RotateCw, ShoppingBag, ShoppingCart, SlidersHorizontal, Tag, TrendingUp, X, Zap } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { isProviderCatalogImage } from '../../utils/image'
import { processHtmlForDisplay } from '../../utils/content'
import { useProductDetail } from '../../composables/useProductDetail'
import ProductPurchaseForm from '../../components/product/ProductPurchaseForm.vue'
import VaultProductMobileBar from './components/VaultProductMobileBar.vue'

const { t } = useI18n()
const purchaseActionsRef = ref<HTMLElement | null>(null)
const showMobileBar = ref(false)
let observer: IntersectionObserver | null = null

const setupMobileBarObserver = () => {
  observer?.disconnect()
  if (!purchaseActionsRef.value) return
  observer = new IntersectionObserver(([entry]) => { showMobileBar.value = Boolean(entry && !entry.isIntersecting) }, { threshold: 0.1 })
  observer.observe(purchaseActionsRef.value)
}

const {
  getLocalizedText, siteCurrency, formatPrice, formatPriceForQuantity, getFulfillmentTypeLabel, getStockStatusLabel,
  hasPromotionPrice, getPromotionPriceAmount, hasSkuPromotionPrice, formatRelatedPostDate, normalizeSkuId,
  loading, product, relatedPosts, currentImage, selectedSkuId, quantity, purchaseWarning, purchaseFormData,
  activeSkus, selectedSku, checkoutFields, showAccountAccessGuide, purchaseFormFieldErrors,
  selectedSkuMemberPrice, hasMemberPrice, hasSelectedSkuWholesalePrice, selectedSkuWholesaleFinalIsMember,
  selectedSkuWholesaleFinalPrice, selectedSkuPromotionFinalIsMember, selectedSkuPromotionFinalPrice,
  isSkuPurchasable, skuDisplayText, skuStockText, quantityEffectiveLimit, quantityEffectiveMin,
  handleQuantityInput, usesCommentQuantity, commentQuantity, requiresLogin, canPurchase, cannotPurchaseReason,
  categoryName, images, addToCart, buyNow, goLogin, loadProduct,
  mobileBarShowMemberPrice, mobileBarMemberPriceDisplay, mobileBarShowSkuPromotionPrice,
  mobileBarSkuPromotionPriceDisplay, mobileBarShowSkuPrice, mobileBarSkuPriceDisplay,
  mobileBarShowProductPromotionPrice, mobileBarProductPromotionPriceDisplay, mobileBarProductPriceDisplay,
} = useProductDetail({ onLoaded: setupMobileBarObserver })

const isAccount = computed(() => product.value?.catalog === 'accounts')
const isService = computed(() => product.value?.catalog === 'services')
const catalogBackPath = computed(() => isAccount.value ? '/accounts' : isService.value ? '/services' : '/products')
const catalogBackLabel = computed(() => isAccount.value ? t('storefront.catalog.accounts') : isService.value ? t('storefront.catalog.services') : t('nav.products'))
const unitPrice = computed(() => {
  const source = selectedSku.value || product.value
  if (!source) return '-'
  return formatPriceForQuantity(source.price_amount, 1, source.price_quantity_basis ?? product.value?.price_quantity_basis, siteCurrency.value)
})
const quantityLimitText = computed(() => {
  const maximum = quantityEffectiveLimit.value
  return maximum ? `${quantityEffectiveMin.value} - ${maximum}` : `${quantityEffectiveMin.value}+`
})

const plainText = (value: string) => value
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .trim()
const accountDescriptionLines = computed(() => plainText(getLocalizedText(product.value?.description)).split(/\n+/).map((line) => line.trim()).filter(Boolean))
const serviceDetailLines = computed(() => {
  const values = [getLocalizedText(product.value?.description), getLocalizedText(product.value?.content)]
  const seen = new Set<string>()
  return values.flatMap((value) => plainText(value).split(/\n+/)).map((line) => line.trim()).filter((line) => {
    if (!line || seen.has(line)) return false
    seen.add(line)
    return true
  })
})
const serviceDetailFacts = computed(() => serviceDetailLines.value.reduce<{ label: string; value: string }[]>((facts, line) => {
  const matched = line.match(/^[•·📍\-\s]*([^：:]{1,16})[：:]\s*(.+)$/)
  if (matched?.[1] && matched[2]) facts.push({ label: matched[1].trim(), value: matched[2].trim() })
  return facts
}, []))
const serviceNoteLines = computed(() => serviceDetailLines.value.filter((line) => !/^[•·📍\-\s]*[^：:]{1,16}[：:]\s*.+$/.test(line)))
const serviceSummaryFacts = computed(() => {
  return [
    { label: t('products.categoryLabel'), value: categoryName.value || '-' },
    { label: t('productDetail.skuTitle'), value: selectedSku.value ? skuDisplayText(selectedSku.value) : '-' },
    { label: t('productDetail.quantity'), value: String(quantity.value) },
    { label: t('productDetail.fulfillmentLabel'), value: getFulfillmentTypeLabel(product.value?.fulfillment_type) },
  ]
})
const formatServiceRate = (sku: any) => {
  const basis = Math.max(1, Math.floor(Number(sku?.price_quantity_basis ?? product.value?.price_quantity_basis) || 1))
  const amount = formatPrice(sku?.price_amount, siteCurrency.value)
  return basis > 1 ? `${amount} / ${basis}` : amount
}
const purchasePricing = computed(() => {
  const basis = selectedSku.value?.price_quantity_basis ?? product.value?.price_quantity_basis
  const source = selectedSku.value || product.value
  const original = source ? formatPriceForQuantity(source.price_amount, quantity.value, basis, siteCurrency.value) : ''
  if (selectedSku.value && hasSelectedSkuWholesalePrice.value && selectedSkuWholesaleFinalPrice.value !== null) return { display: formatPriceForQuantity(selectedSkuWholesaleFinalPrice.value, quantity.value, basis, siteCurrency.value), original, badge: selectedSkuWholesaleFinalIsMember.value ? t('products.memberPriceTag') : t('products.wholesaleTag') }
  if (selectedSku.value && hasSkuPromotionPrice(selectedSku.value) && selectedSkuPromotionFinalPrice.value !== null) return { display: formatPriceForQuantity(selectedSkuPromotionFinalPrice.value, quantity.value, basis, siteCurrency.value), original, badge: selectedSkuPromotionFinalIsMember.value ? t('products.memberPriceTag') : t('products.promotionTag') }
  if (selectedSku.value && hasMemberPrice.value && selectedSkuMemberPrice.value !== null) return { display: formatPriceForQuantity(selectedSkuMemberPrice.value, quantity.value, basis, siteCurrency.value), original, badge: t('products.memberPriceTag') }
  if (product.value && !selectedSku.value && hasPromotionPrice(product.value)) return { display: formatPriceForQuantity(getPromotionPriceAmount(product.value), quantity.value, basis, siteCurrency.value), original, badge: t('products.promotionTag') }
  return { display: original, original: '', badge: '' }
})

const QuantityControl = defineComponent({
  props: { quantity: { type: Number, required: true }, minimum: { type: Number, required: true }, maximum: { type: Number, default: null } },
  emits: ['decrease', 'increase', 'input'],
  setup(props, { emit }) { return () => h('div', { class: 'quantity-control' }, [h('button', { type: 'button', disabled: props.quantity <= props.minimum, onClick: () => emit('decrease') }, () => h(Minus, { class: 'h-4 w-4' })), h('input', { value: props.quantity, inputMode: 'numeric', onChange: (event: Event) => emit('input', event) }), h('button', { type: 'button', disabled: props.maximum !== null && props.quantity >= props.maximum, onClick: () => emit('increase') }, () => '+')]) },
})
const PurchaseAlerts = defineComponent({
  props: { reason: { type: String, default: '' }, warning: { type: String, default: '' }, terminal: Boolean },
  setup(props) { return () => h('div', { class: 'mt-4 grid gap-2' }, [props.reason ? h('p', { class: props.terminal ? 'terminal-alert' : 'purchase-alert' }, props.reason) : null, props.warning ? h('p', { class: props.terminal ? 'terminal-alert' : 'purchase-alert' }, props.warning) : null]) },
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.account-sheet { background:var(--surface); }.account-sheet-body { background:linear-gradient(180deg,color-mix(in srgb,var(--plum-soft) 34%,var(--surface)),var(--surface) 28%); }.account-status { display:inline-flex; align-items:center; gap:7px; border-radius:999px; background:#e8f9f0; padding:8px 11px; color:#087b68; font-size:12px; font-weight:800; }.dark .account-status { background:#123a34; color:#6ee4c9; }
.account-metric { display:grid; grid-template-columns:auto 1fr; column-gap:9px; align-items:center; min-height:100px; border:1px solid color-mix(in srgb,var(--plum) 20%,var(--border)); border-radius:14px; background:var(--surface); padding:16px; }.account-metric span { color:var(--ink-2); font-size:13px; font-weight:700; }.account-metric strong { grid-column:1 / -1; margin-top:9px; color:var(--red-strong); font-size:23px; font-weight:800; }
.account-notice { display:flex; gap:12px; border:1px solid #f5b525; border-radius:14px; background:#fff3c9; padding:14px 16px; color:#9a5315; }.account-notice strong { display:block; font-size:14px; }.account-notice p { margin-top:3px; font-size:12px; line-height:1.55; }.dark .account-notice { background:#3a2e12; color:#ffd278; }
.account-guide { display:flex; align-items:center; gap:12px; border:1px solid #a98dff; border-radius:14px; background:#f0ebff; padding:14px 16px; color:#6544cf; }.account-guide span { display:grid; gap:3px; }.account-guide strong { font-size:14px; }.account-guide small { color:var(--ink-2); font-size:12px; }.dark .account-guide { background:#33294d; color:#c7b7ff; }
.section-heading { display:flex; align-items:center; gap:9px; color:var(--ink); }.section-heading svg { color:var(--red); }.section-heading h2 { font-size:17px; font-weight:800; }.account-description,.account-images { overflow:hidden; border:1px solid var(--border); border-radius:16px; background:var(--surface); }.account-description .section-heading,.account-images .section-heading { border-bottom:1px solid var(--border); padding:15px 17px; background:color-mix(in srgb,var(--plum-soft) 32%,var(--surface)); }.account-copy { padding:17px; color:var(--ink); font-size:15px; line-height:1.85; }.account-copy p + p { margin-top:12px; }.account-rich-copy { border-top:1px solid var(--border); padding:17px; color:var(--ink-2); line-height:1.8; }.account-rich-copy :deep(p) { margin:0 0 14px; }.account-rich-copy :deep(img) { max-width:100%; border-radius:10px; }.account-images > div:last-child { padding:0 16px 16px; }
.account-purchase-card { border:1px solid color-mix(in srgb,var(--plum) 28%,var(--border)); border-radius:18px; background:var(--surface); padding:18px; box-shadow:0 16px 35px -28px rgba(50,37,105,.45); }.field-label { color:var(--ink-2); font-size:12px; font-weight:800; letter-spacing:.04em; }.account-sku { display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; border:1px solid var(--border); border-radius:12px; background:var(--surface); padding:12px; text-align:left; transition:.16s ease; }.account-sku:hover { border-color:var(--plum); }.account-sku strong { display:block; font-size:13px; }.account-sku small { display:block; margin-top:4px; color:var(--ink-3); font-size:11px; }.account-sku-selected { border-color:var(--plum); background:var(--plum-soft); box-shadow:0 0 0 3px color-mix(in srgb,var(--plum) 11%,transparent); }.account-total { display:grid; grid-template-columns:1fr auto; gap:2px 12px; align-items:end; border-radius:14px; background:var(--plum-soft); padding:15px; }.account-total span { color:var(--ink-2); font-size:12px; font-weight:800; }.account-total strong { color:var(--red-strong); font-size:26px; font-weight:800; line-height:1; }.account-total small { grid-column:2; color:var(--ink-3); font-size:11px; text-decoration:line-through; }
.quantity-control { display:flex; overflow:hidden; width:100%; border:1px solid var(--border); border-radius:12px; background:var(--surface); }.quantity-control button { display:grid; width:42px; place-items:center; border:0; background:var(--surface-2); color:var(--ink); font-size:21px; font-weight:700; }.quantity-control button:disabled { opacity:.35; }.quantity-control input { height:42px; min-width:0; flex:1; border:0; border-inline:1px solid var(--border); background:var(--surface); color:var(--ink); text-align:center; font-weight:800; outline:0; }.purchase-alert { border-radius:10px; background:color-mix(in srgb,var(--danger) 10%,transparent); padding:10px 12px; color:var(--danger); font-size:12px; font-weight:700; }
.service-console { background:#0b1220; color:#e8edf8; box-shadow:var(--shadow-lg); }.service-console-header { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; border-bottom:1px solid #26344c; padding:28px 28px 25px; background:radial-gradient(circle at 88% 0%,rgba(103,91,255,.22),transparent 32%),#10192a; }.service-console-header h1 { color:#f4f6ff; }.service-console-eyebrow { display:inline-flex; align-items:center; gap:7px; color:#abb5ff; font-size:12px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }.service-header-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }.service-header-meta > span { display:inline-flex; align-items:center; gap:6px; border:1px solid #32415e; border-radius:999px; background:rgba(11,18,32,.55); padding:6px 9px; color:#b9c5db; font-size:11px; font-weight:700; }.service-header-meta strong { color:#8190ad; font-weight:700; }.console-close { display:grid; flex:none; height:40px; width:40px; place-items:center; border:1px solid #33425e; border-radius:10px; color:#aebad2; transition:.16s ease; }.console-close:hover { background:#1a263a; color:white; }.service-console-body { background:radial-gradient(circle at 100% 100%,rgba(16,185,129,.06),transparent 34%),#0b1220; }.console-config-card,.console-summary-card { border:1px solid #26344c; border-radius:20px; background:#131d30; padding:22px; }.console-card-heading { display:flex; align-items:center; gap:12px; border-bottom:1px solid #26344c; padding-bottom:17px; }.console-icon { display:grid; height:40px; width:40px; place-items:center; border-radius:11px; background:rgba(99,102,241,.15); color:#aeb5ff; }.console-card-heading p { color:#98a6be; font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }.console-card-heading h2 { margin-top:3px; color:#f4f6ff; font-size:18px; font-weight:800; }.console-field { margin-top:22px; }.console-field > p { margin-bottom:7px; color:#b9c4d8; font-size:13px; font-weight:800; }.service-plan { display:flex; width:100%; align-items:center; gap:11px; border:1px solid #2c3b55; border-radius:12px; background:#0d1524; padding:12px; color:#e6edf9; transition:.16s ease; }.service-plan:hover { border-color:#626ce7; background:#111c30; }.service-plan-selected { border-color:#6b72f3; background:rgba(89,89,226,.14); box-shadow:0 0 0 3px rgba(99,102,241,.12); }.service-plan strong { display:block; font-size:13px; }.service-plan small { display:block; margin-top:4px; color:#8290a9; font-size:11px; }.service-plan-rate { flex:none; color:#6ee7c8; font-size:12px; font-weight:800; text-align:right; }.console-limit { border:1px solid #2c3b55; border-radius:12px; background:#0d1524; padding:10px 13px; }.console-limit span { display:block; color:#8290a9; font-size:11px; }.console-limit strong { display:block; margin-top:5px; color:#dce4f5; font-size:13px; }.service-console .quantity-control { border-color:#2c3b55; background:#0a1220; }.service-console .quantity-control button { background:#131d30; color:#dce4f5; }.service-console .quantity-control input { border-color:#2c3b55; background:#0a1220; color:#eef3ff; }.terminal-purchase-form :deep(section) { border-color:#2c3b55; background:#0d1524; }.terminal-purchase-form :deep(h2),.terminal-purchase-form :deep(span) { color:#dce4f5; }.terminal-purchase-form :deep(input),.terminal-purchase-form :deep(textarea),.terminal-purchase-form :deep(select) { border-color:#2c3b55; background:#0a1220; color:#eef3ff; }.terminal-purchase-form :deep(input::placeholder),.terminal-purchase-form :deep(textarea::placeholder) { color:#71809a; }.service-notes { margin-top:22px; border:1px solid #2c3b55; border-radius:14px; background:#0d1524; padding:16px; }.service-notes h3 { color:#eef3ff; font-size:14px; font-weight:800; }.service-spec-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:14px; }.service-spec { min-width:0; border:1px solid #283750; border-radius:10px; background:#111b2d; padding:10px 11px; }.service-spec span { display:block; color:#8491a9; font-size:11px; }.service-spec strong { display:block; overflow-wrap:anywhere; margin-top:4px; color:#e5ebf7; font-size:12px; line-height:1.35; }.service-note { display:flex; gap:9px; color:#c0c9da; font-size:13px; line-height:1.65; }.service-note + .service-note { margin-top:7px; }.service-note span { width:5px; height:5px; flex:none; margin-top:8px; border-radius:50%; background:#8b92ff; }.service-note p { margin:0; }.console-facts { display:grid; gap:0; border:1px solid #2c3b55; border-radius:14px; background:#0d1524; padding:0 15px; }.console-fact { display:flex; justify-content:space-between; gap:18px; border-bottom:1px solid #233149; padding:13px 0; font-size:12px; }.console-fact:last-child { border:0; }.console-fact span { color:#8e9bb2; }.console-fact strong { max-width:62%; color:#e8edf8; text-align:right; font-weight:700; }.console-attribute-facts { margin-top:18px; border-top:1px solid #26344c; padding-top:16px; }.console-attribute-facts > p { margin-bottom:2px; color:#98a6be; font-size:11px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }.console-total { display:grid; grid-template-columns:1fr auto; gap:2px 12px; align-items:end; margin-top:20px; border-top:1px solid #26344c; padding-top:20px; }.console-total span { color:#8e9bb2; font-size:12px; font-weight:800; }.console-total strong { color:#f3f5ff; font-size:31px; font-weight:800; line-height:1; }.console-total small { grid-column:2; color:#74819a; font-size:11px; text-decoration:line-through; }.terminal-alert { border:1px solid rgba(251,113,133,.35); border-radius:10px; background:rgba(251,113,133,.12); padding:10px 12px; color:#fecdd3; font-size:12px; font-weight:700; }.console-help { display:flex; gap:8px; margin-top:15px; color:#8e9bb2; font-size:12px; line-height:1.55; }.console-help svg { flex:none; margin-top:2px; color:#aeb5ff; }
@media (max-width:640px) { .account-sheet-body,.service-console-header { padding:18px; }.account-purchase-card,.console-config-card,.console-summary-card { padding:16px; }.account-metric { min-height:82px; }.service-console-header { gap:14px; }.service-console-header h1 { font-size:22px; }.service-header-meta { gap:6px; }.service-header-meta > span { max-width:100%; }.service-spec-grid { grid-template-columns:1fr; } }
</style>
