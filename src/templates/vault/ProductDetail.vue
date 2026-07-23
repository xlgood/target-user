<template>
  <div class="mx-auto w-full max-w-[1240px] px-4 pb-8 sm:px-6">
    <div v-if="loading" class="grid gap-6 py-6 lg:grid-cols-[1.08fr_.92fr]">
      <div class="h-[420px] rounded-[28px] border bg-card"></div>
      <div class="h-[560px] rounded-[28px] border bg-card"></div>
    </div>

    <template v-else-if="product">
      <nav class="flex flex-wrap items-center gap-1.5 py-5 text-xs font-semibold text-muted-foreground">
        <RouterLink to="/" class="hover:text-primary">{{ t('nav.home') }}</RouterLink>
        <ChevronRight class="h-4 w-4 flex-none" />
        <RouterLink :to="catalogBackPath" class="hover:text-primary">{{ catalogBackLabel }}</RouterLink>
        <ChevronRight class="h-4 w-4 flex-none" />
        <span class="max-w-[36ch] truncate text-foreground">{{ getLocalizedText(product.title) }}</span>
      </nav>

      <section v-if="isAccount" class="account-detail-grid grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)]">
        <div class="min-w-0">
          <div class="account-product-hero relative overflow-hidden rounded-[28px] border p-6 text-white sm:p-9">
            <div class="relative z-10 max-w-[52ch]">
              <div class="flex flex-wrap items-center gap-2"><span class="detail-kicker detail-kicker-account"><ShieldCheck class="h-3.5 w-3.5" />{{ t('storefront.catalog.accounts') }}</span><span class="detail-kicker bg-white/10 text-white/70">{{ categoryName || t('products.categoryLabel') }}</span></div>
              <h1 class="mt-5 text-3xl font-extrabold leading-[1.12] tracking-[-.045em] sm:text-4xl">{{ getLocalizedText(product.title) }}</h1>
              <p class="mt-4 text-sm leading-7 text-white/66 sm:text-base">{{ getLocalizedText(product.description) || t('storefront.detail.accountDescriptionFallback') }}</p>
              <div class="mt-6 flex flex-wrap gap-2"><span class="detail-kicker bg-emerald-300/15 text-emerald-100"><span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>{{ getStockStatusLabel(product) }}</span><span class="detail-kicker bg-white/10 text-white/75"><component :is="product.fulfillment_type === 'auto' ? Zap : Pencil" class="h-3.5 w-3.5" />{{ getFulfillmentTypeLabel(product.fulfillment_type) }}</span></div>
            </div>
            <div class="account-product-orb"></div><KeyRound class="absolute -bottom-8 -right-7 h-48 w-48 text-emerald-200/[.09] sm:right-4" />
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-3">
            <div v-for="step in accountSteps" :key="step.title" class="account-step-card"><component :is="step.icon" class="h-5 w-5 text-emerald-600 dark:text-emerald-300" /><p class="mt-5 text-sm font-extrabold">{{ step.title }}</p><p class="mt-1.5 text-xs leading-5 text-muted-foreground">{{ step.body }}</p></div>
          </div>

          <div v-if="images.length" class="mt-5 rounded-2xl border bg-card p-4 shadow-[var(--shadow-sm)]">
            <div class="mb-3 flex items-center justify-between"><span class="text-sm font-extrabold">{{ t('storefront.detail.accountPreview') }}</span><span class="text-xs font-semibold text-muted-foreground">{{ images.length }}</span></div>
            <div class="grid gap-3 sm:grid-cols-[1fr_auto]"><div class="relative h-[210px] overflow-hidden rounded-xl bg-secondary"><img :src="currentImage" :alt="getLocalizedText(product.title)" class="h-full w-full" :class="isProviderCatalogImage(currentImage) ? 'object-contain' : 'object-cover'" /></div><div v-if="images.length > 1" class="flex gap-2 overflow-x-auto sm:max-h-[210px] sm:flex-col"><button v-for="(img, idx) in images" :key="img" type="button" class="h-14 w-16 flex-none overflow-hidden rounded-lg border-2 bg-secondary" :class="img === currentImage ? 'border-emerald-500' : 'border-border'" @click="currentImage = img"><img :src="img" :alt="`${idx + 1}`" class="h-full w-full" :class="isProviderCatalogImage(img) ? 'object-contain' : 'object-cover'" /></button></div></div>
          </div>

          <RouterLink v-if="showAccountAccessGuide" to="/guides/account-access" class="account-guide-card mt-5"><CircleHelp class="h-5 w-5" /><span><strong>{{ t('accountAccessGuide.productLink') }}</strong><small>{{ t('storefront.detail.accountGuideLede') }}</small></span><ArrowRight class="ml-auto h-5 w-5" /></RouterLink>
        </div>

        <aside class="account-order-card lg:sticky lg:top-[92px] lg:self-start">
          <div class="flex items-start justify-between gap-3 border-b border-border pb-5"><div><p class="detail-section-label text-emerald-700 dark:text-emerald-300">{{ t('storefront.detail.accountOrder') }}</p><h2 class="mt-1 text-xl font-extrabold">{{ t('storefront.detail.accountOrderTitle') }}</h2></div><span class="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">#{{ product.id }}</span></div>

          <div v-if="activeSkus.length" class="mt-6"><div class="mb-3 flex items-center justify-between gap-3"><p class="text-sm font-extrabold">{{ t('storefront.detail.accountSkuTitle') }}</p><span class="text-xs font-semibold text-muted-foreground">{{ activeSkus.length }} {{ t('storefront.detail.options') }}</span></div><div class="grid gap-2"><button v-for="sku in activeSkus" :key="sku.id" type="button" class="account-sku-option" :class="[normalizeSkuId(sku.id) === selectedSkuId ? 'account-sku-option-active' : '', !isSkuPurchasable(sku) ? 'cursor-not-allowed opacity-45' : '']" :disabled="!isSkuPurchasable(sku)" @click="selectedSkuId = normalizeSkuId(sku.id)"><span class="min-w-0"><strong class="block truncate">{{ skuDisplayText(sku) }}</strong><small>{{ skuStockText(sku) }}</small></span><span class="text-sm font-extrabold tabular-nums">{{ formatPriceForQuantity(sku.price_amount, quantity, sku.price_quantity_basis ?? product.price_quantity_basis, siteCurrency) }}</span></button></div></div>

          <div v-if="checkoutFields.length" class="account-form-wrap mt-5"><div class="mb-3 flex items-center gap-2"><KeyRound class="h-4 w-4 text-emerald-600 dark:text-emerald-300" /><p class="text-sm font-extrabold">{{ t('storefront.list.accountForm') }}</p></div><ProductPurchaseForm v-model="purchaseFormData" :fields="checkoutFields" :field-errors="purchaseFormFieldErrors" :comment-quantity="commentQuantity" /></div>

          <div v-if="!usesCommentQuantity" class="mt-5 flex items-center justify-between rounded-xl bg-secondary px-4 py-3"><span class="text-sm font-bold">{{ t('productDetail.quantity') }}</span><div class="inline-flex items-center overflow-hidden rounded-lg border border-border bg-card"><button type="button" class="grid h-9 w-9 place-items-center disabled:opacity-35" :disabled="quantity <= quantityEffectiveMin" @click="quantity = Math.max(quantityEffectiveMin, quantity - 1)"><Minus class="h-4 w-4" /></button><input inputmode="numeric" class="h-9 w-11 border-x border-border bg-card text-center text-sm font-extrabold tabular-nums outline-none" :value="quantity" @change="handleQuantityInput($event)" /><button type="button" class="grid h-9 w-9 place-items-center disabled:opacity-35" :disabled="quantityEffectiveLimit !== null && quantity >= quantityEffectiveLimit" @click="quantity += 1"><Plus class="h-4 w-4" /></button></div></div>

          <div class="mt-5 border-t border-border pt-5"><div class="flex items-end justify-between gap-4"><div><p class="text-xs font-semibold text-muted-foreground">{{ t('storefront.detail.orderTotal') }}</p><p class="mt-1 text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">{{ purchasePricing.display }}</p></div><span v-if="purchasePricing.badge" class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">{{ purchasePricing.badge }}</span></div><p v-if="purchasePricing.original" class="mt-1 text-xs font-semibold text-muted-foreground line-through">{{ purchasePricing.original }}</p></div>
          <div v-if="selectedSkuWholesaleRules.length" class="mt-4 rounded-xl bg-emerald-500/[.07] p-3"><p class="text-xs font-extrabold text-emerald-800 dark:text-emerald-200">{{ t('products.wholesaleRulesTitle') }}</p><div class="mt-2 flex flex-wrap gap-1.5"><span v-for="tier in selectedSkuWholesaleRules" :key="`${tier.sku_id || tier.sku_code || 'all'}-${tier.min_quantity}`" class="rounded-full bg-card px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">{{ formatWholesaleTier(tier) }}</span></div></div>
          <div v-if="cannotPurchaseReason" class="mt-4 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm font-semibold text-destructive">{{ cannotPurchaseReason }}</div><div v-if="purchaseWarning" class="mt-4 rounded-xl bg-warning/10 px-3.5 py-3 text-sm font-semibold text-warning">{{ purchaseWarning }}</div>
          <div ref="purchaseActionsRef" class="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]"><Button v-if="requiresLogin" class="h-12 rounded-xl !bg-emerald-600 text-base font-extrabold hover:!bg-emerald-700 sm:col-span-2" @click="goLogin">{{ t('productDetail.loginToBuy') }}</Button><template v-else><Button class="h-12 rounded-xl !bg-emerald-600 text-base font-extrabold hover:!bg-emerald-700" :disabled="!canPurchase" @click="buyNow"><Zap class="h-4 w-4" />{{ t('storefront.detail.accountBuy') }}</Button><Button variant="outline" class="h-12 rounded-xl font-bold" :disabled="!canPurchase" @click="addToCart"><ShoppingCart class="h-4 w-4" />{{ t('productDetail.addToCart') }}</Button></template></div>
          <p class="mt-4 flex items-center gap-2 text-xs leading-5 text-muted-foreground"><CheckCircle2 class="h-4 w-4 flex-none text-emerald-600 dark:text-emerald-300" />{{ t('productDetail.deliveryReassurance') }}</p>
        </aside>
      </section>

      <section v-else-if="isService" class="service-workbench">
        <header class="service-workbench-hero relative overflow-hidden rounded-[28px] border p-6 text-white sm:p-9"><div class="relative z-10 max-w-3xl"><span class="detail-kicker detail-kicker-service"><TrendingUp class="h-3.5 w-3.5" />{{ t('storefront.catalog.services') }}</span><p v-if="categoryName" class="mt-5 text-xs font-bold uppercase tracking-[.14em] text-indigo-200/75">{{ categoryName }}</p><h1 class="mt-2 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{{ getLocalizedText(product.title) }}</h1><p class="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{{ getLocalizedText(product.description) || t('storefront.detail.serviceDescriptionFallback') }}</p></div><Target class="absolute -bottom-10 -right-6 h-52 w-52 text-indigo-200/[.10] sm:right-7" /></header>

        <div class="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,.88fr)]">
          <section class="service-setup-card"><div class="flex items-start gap-3 border-b border-border pb-5"><span class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><SlidersHorizontal class="h-5 w-5" /></span><div><p class="detail-section-label text-indigo-600 dark:text-indigo-300">{{ t('storefront.detail.serviceSetup') }}</p><h2 class="mt-1 text-xl font-extrabold">{{ t('storefront.detail.serviceSetupTitle') }}</h2><p class="mt-1 text-sm text-muted-foreground">{{ t('storefront.detail.serviceSetupLede') }}</p></div></div>
            <div v-if="activeSkus.length" class="mt-6"><div class="mb-3 flex items-center justify-between"><p class="text-sm font-extrabold">{{ t('storefront.detail.serviceSkuTitle') }}</p><span class="text-xs font-semibold text-muted-foreground">{{ activeSkus.length }} {{ t('storefront.detail.options') }}</span></div><div class="grid gap-2"><button v-for="sku in activeSkus" :key="sku.id" type="button" class="service-sku-option" :class="[normalizeSkuId(sku.id) === selectedSkuId ? 'service-sku-option-active' : '', !isSkuPurchasable(sku) ? 'cursor-not-allowed opacity-45' : '']" :disabled="!isSkuPurchasable(sku)" @click="selectedSkuId = normalizeSkuId(sku.id)"><span class="grid h-8 w-8 flex-none place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><component :is="normalizeSkuId(sku.id) === selectedSkuId ? CheckCircle2 : Layers3" class="h-4 w-4" /></span><span class="min-w-0 flex-1 text-left"><strong class="block text-sm">{{ skuDisplayText(sku) }}</strong><small>{{ skuStockText(sku) }}</small></span><span class="text-sm font-extrabold tabular-nums text-indigo-600 dark:text-indigo-300">{{ formatPriceForQuantity(sku.price_amount, quantity, sku.price_quantity_basis ?? product.price_quantity_basis, siteCurrency) }}</span></button></div><p v-if="requiresSKUSelection" class="mt-2 text-sm font-semibold text-warning">{{ t('productDetail.skuRequired') }}</p></div>
            <div v-if="checkoutFields.length" class="service-form-wrap mt-6"><div class="mb-3 flex items-center gap-2"><Link class="h-4 w-4 text-indigo-600 dark:text-indigo-300" /><p class="text-sm font-extrabold">{{ t('storefront.detail.serviceFields') }}</p></div><ProductPurchaseForm v-model="purchaseFormData" :fields="checkoutFields" :field-errors="purchaseFormFieldErrors" :comment-quantity="commentQuantity" /></div>
            <div v-if="!usesCommentQuantity" class="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[.035] px-4 py-4"><div><p class="text-sm font-extrabold">{{ t('productDetail.quantity') }}</p><p class="mt-1 text-xs text-muted-foreground">{{ quantityLimitText }}</p></div><div class="inline-flex items-center overflow-hidden rounded-lg border border-border bg-card"><button type="button" class="grid h-10 w-10 place-items-center disabled:opacity-35" :disabled="quantity <= quantityEffectiveMin" @click="quantity = Math.max(quantityEffectiveMin, quantity - 1)"><Minus class="h-4 w-4" /></button><input inputmode="numeric" class="h-10 w-14 border-x border-border bg-card text-center font-extrabold tabular-nums outline-none" :value="quantity" @change="handleQuantityInput($event)" /><button type="button" class="grid h-10 w-10 place-items-center disabled:opacity-35" :disabled="quantityEffectiveLimit !== null && quantity >= quantityEffectiveLimit" @click="quantity += 1"><Plus class="h-4 w-4" /></button></div></div>
          </section>

          <aside class="service-summary-card lg:sticky lg:top-[92px]"><div class="flex items-start justify-between gap-3 border-b border-border pb-5"><div><p class="detail-section-label text-indigo-600 dark:text-indigo-300">{{ t('storefront.detail.serviceSummary') }}</p><h2 class="mt-1 text-xl font-extrabold">{{ t('storefront.detail.serviceSummaryTitle') }}</h2></div><span class="rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-300">#{{ product.id }}</span></div><div class="mt-5 space-y-3"><div class="summary-row"><span>{{ t('storefront.detail.selectedPlan') }}</span><strong class="text-right">{{ selectedSku ? skuDisplayText(selectedSku) : t('storefront.detail.awaitingSelection') }}</strong></div><div class="summary-row"><span>{{ t('productDetail.quantity') }}</span><strong>{{ usesCommentQuantity ? commentQuantity : quantity }}</strong></div><div class="summary-row"><span>{{ t('products.fulfillmentType.auto') }}</span><strong>{{ getFulfillmentTypeLabel(product.fulfillment_type) }}</strong></div></div><div class="mt-6 rounded-2xl bg-indigo-500/[.07] p-5"><p class="text-xs font-bold uppercase tracking-[.12em] text-indigo-600 dark:text-indigo-300">{{ t('storefront.detail.orderTotal') }}</p><p class="mt-2 text-3xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-300">{{ purchasePricing.display }}</p><p v-if="purchasePricing.original" class="mt-1 text-xs font-semibold text-muted-foreground line-through">{{ purchasePricing.original }}</p><span v-if="purchasePricing.badge" class="mt-3 inline-flex rounded-full bg-card px-2.5 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-300">{{ purchasePricing.badge }}</span></div><div v-if="hasPromotionRules(product)" class="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[.08] p-4"><p class="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-200"><Tag class="h-4 w-4" />{{ t('products.promotionRulesTitle') }}</p><p v-for="rule in getPromotionRules(product)" :key="rule.id" class="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-200">{{ formatPromotionRule(rule) }}</p></div><div v-if="cannotPurchaseReason" class="mt-4 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm font-semibold text-destructive">{{ cannotPurchaseReason }}</div><div v-if="purchaseWarning" class="mt-4 rounded-xl bg-warning/10 px-3.5 py-3 text-sm font-semibold text-warning">{{ purchaseWarning }}</div><div ref="purchaseActionsRef" class="mt-5 grid gap-2"><Button v-if="requiresLogin" class="h-12 rounded-xl !bg-indigo-600 text-base font-extrabold hover:!bg-indigo-700" @click="goLogin">{{ t('productDetail.loginToBuy') }}</Button><template v-else><Button class="h-12 rounded-xl !bg-indigo-600 text-base font-extrabold hover:!bg-indigo-700" :disabled="!canPurchase" @click="buyNow"><Zap class="h-4 w-4" />{{ t('storefront.detail.serviceBuy') }}</Button><Button variant="outline" class="h-11 rounded-xl font-bold" :disabled="!canPurchase" @click="addToCart"><ShoppingCart class="h-4 w-4" />{{ t('productDetail.addToCart') }}</Button></template></div><p class="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><CircleHelp class="mt-0.5 h-4 w-4 flex-none text-indigo-600 dark:text-indigo-300" />{{ t('storefront.detail.serviceOrderHint') }}</p></aside>
        </div>
      </section>

      <section v-else class="rounded-[28px] border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-9"><h1 class="text-3xl font-extrabold">{{ getLocalizedText(product.title) }}</h1><p class="mt-4 text-muted-foreground">{{ getLocalizedText(product.description) }}</p></section>

      <section v-if="getLocalizedText(product.description) || product.content" class="detail-content-panel mt-7 rounded-[24px] border bg-card p-6 sm:p-8"><p class="detail-section-label" :class="isAccount ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-600 dark:text-indigo-300'">{{ t('productDetail.details') }}</p><div class="prose mt-4 max-w-none dark:prose-invert prose-a:text-primary prose-img:rounded-xl"><p v-if="getLocalizedText(product.description)">{{ getLocalizedText(product.description) }}</p><div v-if="product.content" v-html="processHtmlForDisplay(getLocalizedText(product.content))"></div></div></section>

      <section v-if="relatedPosts.length" class="mt-8"><div class="mb-4 flex items-center justify-between"><h2 class="text-xl font-extrabold">{{ t('productDetail.relatedPosts') }}</h2></div><div class="grid gap-4 md:grid-cols-3"><RouterLink v-for="rp in relatedPosts" :key="rp.id" class="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]" :to="`/blog/${rp.slug}`"><span class="text-xs font-semibold text-muted-foreground">{{ formatRelatedPostDate(rp.published_at) }}</span><h3 class="mt-3 line-clamp-2 font-extrabold">{{ getLocalizedText(rp.title) }}</h3><p v-if="rp.summary" class="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ getLocalizedText(rp.summary) }}</p></RouterLink></div></section>

      <div class="py-7 text-center"><Button as-child variant="ghost" size="sm" class="rounded-full"><RouterLink :to="catalogBackPath"><ArrowLeft class="h-4 w-4" />{{ catalogBackLabel }}</RouterLink></Button></div>

      <VaultProductMobileBar :visible="showMobileBar && !!product && !loading" :catalog="product.catalog" :requires-login="requiresLogin" :can-purchase="canPurchase" :show-member-price="mobileBarShowMemberPrice" :member-price-display="mobileBarMemberPriceDisplay" :show-sku-promotion-price="mobileBarShowSkuPromotionPrice" :sku-promotion-price-display="mobileBarSkuPromotionPriceDisplay" :show-sku-price="mobileBarShowSkuPrice" :sku-price-display="mobileBarSkuPriceDisplay" :show-product-promotion-price="mobileBarShowProductPromotionPrice" :product-promotion-price-display="mobileBarProductPromotionPriceDisplay" :product-price-display="mobileBarProductPriceDisplay" @add-to-cart="addToCart" @buy-now="buyNow" @go-login="goLogin" />
    </template>

    <div v-else class="my-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center text-muted-foreground"><AlertCircle class="h-12 w-12 opacity-60" /><p>{{ t('productDetail.notFound') }}</p><div class="mt-2 flex flex-wrap justify-center gap-2.5"><Button size="sm" class="rounded-full" @click="loadProduct"><RotateCw class="h-4 w-4" />{{ t('errorBoundary.retry') }}</Button><Button as-child variant="outline" size="sm" class="rounded-full"><RouterLink to="/products">{{ t('productDetail.backToProducts') }}</RouterLink></Button></div></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, CircleHelp, KeyRound, Layers3,
  Link, Minus, Pencil, Plus, RotateCw, ShieldCheck, ShoppingCart, SlidersHorizontal, Tag, Target,
  TrendingUp, Zap,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { isProviderCatalogImage } from '../../utils/image'
import { processHtmlForDisplay } from '../../utils/content'
import { useProductDetail } from '../../composables/useProductDetail'
import ProductPurchaseForm from '../../components/product/ProductPurchaseForm.vue'
import VaultProductMobileBar from './components/VaultProductMobileBar.vue'

const { t } = useI18n()

// 移动端固定购买条：IntersectionObserver 监听桌面购买区是否出屏
const purchaseActionsRef = ref<HTMLElement | null>(null)
const showMobileBar = ref(false)
let observer: IntersectionObserver | null = null

const setupMobileBarObserver = () => {
  if (observer) observer.disconnect()
  if (!purchaseActionsRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) showMobileBar.value = !entry.isIntersecting
    },
    { threshold: 0.1 },
  )
  observer.observe(purchaseActionsRef.value)
}

const {
  getLocalizedText, siteCurrency, formatPriceForQuantity,
  getFulfillmentTypeLabel, getStockStatusLabel,
  hasPromotionPrice, getPromotionPriceAmount,
  hasSkuPromotionPrice,
  hasPromotionRules, getPromotionRules,
  formatPromotionRule, formatWholesaleTier, formatRelatedPostDate, normalizeSkuId,
  loading, product, relatedPosts, currentImage, selectedSkuId, quantity, purchaseWarning, purchaseFormData,
  activeSkus, selectedSku, checkoutFields, showAccountAccessGuide, purchaseFormFieldErrors,
  selectedSkuMemberPrice, hasMemberPrice,
  hasSelectedSkuWholesalePrice, selectedSkuWholesaleFinalIsMember, selectedSkuWholesaleFinalPrice,
  selectedSkuWholesaleRules,
  selectedSkuPromotionFinalIsMember, selectedSkuPromotionFinalPrice,
  isSkuPurchasable, skuDisplayText, skuStockText,
  quantityEffectiveLimit, quantityEffectiveMin, handleQuantityInput, usesCommentQuantity, commentQuantity,
  requiresLogin, requiresSKUSelection, canPurchase, cannotPurchaseReason,
  categoryName, images,
  addToCart, buyNow, goLogin, loadProduct,
  mobileBarShowMemberPrice, mobileBarMemberPriceDisplay,
  mobileBarShowSkuPromotionPrice, mobileBarSkuPromotionPriceDisplay,
  mobileBarShowSkuPrice, mobileBarSkuPriceDisplay,
  mobileBarShowProductPromotionPrice, mobileBarProductPromotionPriceDisplay, mobileBarProductPriceDisplay,
} = useProductDetail({ onLoaded: () => setupMobileBarObserver() })

const isAccount = computed(() => product.value?.catalog === 'accounts')
const isService = computed(() => product.value?.catalog === 'services')
const catalogBackPath = computed(() => isAccount.value ? '/accounts' : isService.value ? '/services' : '/products')
const catalogBackLabel = computed(() => isAccount.value ? t('storefront.catalog.accounts') : isService.value ? t('storefront.catalog.services') : t('nav.products'))

const accountSteps = computed(() => [
  { icon: Layers3, title: t('storefront.detail.accountStepChooseTitle'), body: t('storefront.detail.accountStepChooseBody') },
  { icon: KeyRound, title: t('storefront.detail.accountStepDeliverTitle'), body: t('storefront.detail.accountStepDeliverBody') },
  { icon: CircleHelp, title: t('storefront.detail.accountStepGuideTitle'), body: t('storefront.detail.accountStepGuideBody') },
])

const quantityLimitText = computed(() => t('storefront.detail.quantityHint', {
  min: quantityEffectiveMin.value,
  max: quantityEffectiveLimit.value || t('storefront.detail.noMaximum'),
}))

const purchasePricing = computed(() => {
  const basis = selectedSku.value?.price_quantity_basis ?? product.value?.price_quantity_basis
  const selected = selectedSku.value
  const original = selected
    ? formatPriceForQuantity(selected.price_amount, quantity.value, basis, siteCurrency.value)
    : product.value
      ? formatPriceForQuantity(product.value.price_amount, quantity.value, basis, siteCurrency.value)
      : ''
  if (selected && hasSelectedSkuWholesalePrice.value && selectedSkuWholesaleFinalPrice.value !== null) {
    return { display: formatPriceForQuantity(selectedSkuWholesaleFinalPrice.value, quantity.value, basis, siteCurrency.value), original, badge: selectedSkuWholesaleFinalIsMember.value ? t('products.memberPriceTag') : t('products.wholesaleTag') }
  }
  if (selected && hasSkuPromotionPrice(selected) && selectedSkuPromotionFinalPrice.value !== null) {
    return { display: formatPriceForQuantity(selectedSkuPromotionFinalPrice.value, quantity.value, basis, siteCurrency.value), original, badge: selectedSkuPromotionFinalIsMember.value ? t('products.memberPriceTag') : t('products.promotionTag') }
  }
  if (selected && hasMemberPrice.value && selectedSkuMemberPrice.value !== null) {
    return { display: formatPriceForQuantity(selectedSkuMemberPrice.value, quantity.value, basis, siteCurrency.value), original, badge: t('products.memberPriceTag') }
  }
  if (selected) return { display: original, original: '', badge: '' }
  if (product.value && hasPromotionPrice(product.value)) {
    return { display: formatPriceForQuantity(getPromotionPriceAmount(product.value), quantity.value, basis, siteCurrency.value), original, badge: t('products.promotionTag') }
  }
  return { display: original, original: '', badge: '' }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
.detail-kicker { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:7px 10px; font-size:11px; font-weight:800; }
.detail-kicker-account { background:rgba(110,228,201,.16); color:#bbf7e8; }.detail-kicker-service { background:rgba(199,210,254,.16); color:#dbe4ff; }
.detail-section-label { font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
.account-product-hero { min-height:342px; background:radial-gradient(circle at 94% 8%,rgba(70,215,180,.23),transparent 32%),linear-gradient(135deg,#0c1729,#103d3c); }.account-product-orb { position:absolute; right:-60px; bottom:-70px; width:240px; height:240px; border-radius:50%; background:rgba(55,207,173,.12); filter:blur(5px); }
.account-step-card { min-height:152px; border:1px solid var(--border); border-radius:18px; background:var(--surface); padding:20px; box-shadow:var(--shadow-sm); }
.account-guide-card { display:flex; align-items:center; gap:12px; border:1px solid color-mix(in srgb,var(--teal) 30%,var(--border)); border-radius:16px; background:var(--teal-soft); padding:16px 18px; color:var(--teal-strong); }.account-guide-card span { display:grid; gap:3px; }.account-guide-card strong { font-size:14px; }.account-guide-card small { color:var(--ink-2); font-size:12px; }
.account-order-card,.service-setup-card,.service-summary-card { border:1px solid var(--border); border-radius:24px; background:var(--surface); padding:24px; box-shadow:var(--shadow-sm); }.account-order-card { border-color:color-mix(in srgb,var(--teal) 25%,var(--border)); }
.account-sku-option,.service-sku-option { display:flex; width:100%; align-items:center; gap:12px; border:1px solid var(--border); border-radius:13px; background:var(--surface); padding:13px; text-align:left; transition:border-color .15s ease,background-color .15s ease,box-shadow .15s ease; }.account-sku-option:hover,.service-sku-option:hover { border-color:var(--border-strong); box-shadow:var(--shadow-sm); }.account-sku-option small,.service-sku-option small { display:block; margin-top:3px; color:var(--ink-3); font-size:11px; font-weight:600; }.account-sku-option-active { border-color:var(--teal); background:var(--teal-soft); color:var(--teal-strong); box-shadow:0 0 0 3px color-mix(in srgb,var(--teal) 12%,transparent); }.service-sku-option-active { border-color:var(--red); background:var(--red-soft); color:var(--red-strong); box-shadow:0 0 0 3px color-mix(in srgb,var(--red) 12%,transparent); }
.account-form-wrap,.service-form-wrap { border:1px solid color-mix(in srgb,var(--border) 75%,transparent); border-radius:16px; padding:14px; }.account-form-wrap { background:color-mix(in srgb,var(--teal-soft) 36%,var(--surface)); }.service-form-wrap { background:color-mix(in srgb,var(--red-soft) 40%,var(--surface)); }
.account-form-wrap :deep(section),.service-form-wrap :deep(section) { border:0; background:transparent; padding:0; }.account-form-wrap :deep(input),.account-form-wrap :deep(textarea),.account-form-wrap :deep(select),.service-form-wrap :deep(input),.service-form-wrap :deep(textarea),.service-form-wrap :deep(select) { border-color:var(--border); background:var(--surface); }
.service-workbench-hero { min-height:260px; background:radial-gradient(circle at 87% 10%,rgba(157,160,255,.26),transparent 30%),linear-gradient(135deg,#171a48,#29265b); }.service-summary-card { border-color:color-mix(in srgb,var(--red) 25%,var(--border)); }.summary-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; border-bottom:1px solid var(--border); padding-bottom:12px; color:var(--ink-2); font-size:13px; }.summary-row strong { max-width:65%; color:var(--ink); font-size:13px; }
.detail-content-panel { background:var(--surface); }.detail-content-panel :deep(.prose) { color:var(--ink-2); }.detail-content-panel :deep(.prose p) { line-height:1.8; }
@media (max-width:640px) { .account-product-hero { min-height:300px; }.account-order-card,.service-setup-card,.service-summary-card { padding:18px; }.account-step-card { min-height:0; }.service-workbench-hero { min-height:230px; } }
</style>
