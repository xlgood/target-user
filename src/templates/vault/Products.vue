<template>
  <div class="mx-auto w-full max-w-[1240px] px-4 pb-10 sm:px-6">
    <nav class="flex items-center gap-1.5 py-5 text-xs font-semibold text-muted-foreground">
      <RouterLink to="/" class="hover:text-primary">{{ t('nav.home') }}</RouterLink><ChevronRight class="h-4 w-4" />
      <span class="truncate text-foreground">{{ pageTitle }}</span>
    </nav>

    <template v-if="isAccountsCatalog">
      <header class="account-shelf-hero relative overflow-hidden rounded-[28px] border px-6 py-8 text-white sm:px-9 sm:py-10">
        <div class="relative max-w-2xl">
          <p class="text-xs font-extrabold uppercase tracking-[.16em] text-emerald-200">{{ t('storefront.accountShelf.eyebrow') }}</p>
          <h1 class="mt-3 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{{ t('storefront.accountShelf.title') }}</h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">{{ t('storefront.accountShelf.lede') }}</p>
        </div>
        <ShieldCheck class="absolute -bottom-10 -right-4 h-44 w-44 text-emerald-200 opacity-10 sm:right-8" />
      </header>

      <div class="mt-6 grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside class="grid gap-4 lg:sticky lg:top-[92px]">
          <div class="rounded-2xl border bg-card p-3.5 shadow-[var(--shadow-sm)]">
            <p class="px-2 pb-2 text-xs font-extrabold uppercase tracking-[.12em] text-muted-foreground">{{ t('storefront.accountShelf.filters') }}</p>
            <button type="button" class="account-filter" :class="selectedCategory === null ? 'account-filter-active' : ''" @click="selectCategory(null)">
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Boxes class="h-4 w-4" /></span>{{ t('products.allCategories') }}
            </button>
            <template v-for="group in categoryGroups" :key="group.id">
              <button type="button" class="account-filter" :class="selectedCategory === group.id ? 'account-filter-active' : ''" @click="selectCategory(group.id)">
                <img :src="categoryImage(group)" :alt="categoryName(group)" class="h-8 w-8 rounded-lg object-contain" />
                <span class="min-w-0 flex-1 truncate">{{ categoryName(group) }}</span>
              </button>
              <button v-for="child in group.children" :key="child.id" type="button" class="account-filter account-filter-child" :class="selectedCategory === child.id ? 'account-filter-active' : ''" @click="selectCategory(child.id)">{{ categoryName(child) }}</button>
            </template>
          </div>

          <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.055] p-5">
            <div class="flex items-center gap-2 text-sm font-extrabold text-emerald-800 dark:text-emerald-200"><ShieldCheck class="h-5 w-5" />{{ t('storefront.accountShelf.safetyTitle') }}</div>
            <p class="mt-3 text-sm leading-6 text-muted-foreground">{{ t('storefront.accountShelf.safetyBody') }}</p>
            <RouterLink to="/guides/account-access" class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ t('storefront.accountShelf.viewGuide') }}<ArrowRight class="h-4 w-4" /></RouterLink>
          </div>
        </aside>

        <section class="min-w-0">
          <div class="relative mb-5">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input v-model="searchQuery" class="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm outline-none transition focus:border-emerald-500" :placeholder="t('products.searchBoxPlaceholder')" :aria-label="t('products.searchLabel')" />
            <button v-if="searchQuery" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary" :aria-label="t('blog.searchClear')" @click="clearSearch"><X class="h-4 w-4" /></button>
          </div>
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-muted-foreground"><strong class="text-foreground">{{ selectedCategoryName || pageTitle }}</strong><span v-if="!loading" class="ml-2">{{ t('storefront.list.resultCount', { count: products.length }) }}</span></p><RouterLink to="/accounts" class="text-sm font-bold text-emerald-700 dark:text-emerald-300">{{ t('storefront.list.reset') }}</RouterLink></div>
          <div v-if="loading" class="grid gap-5 md:grid-cols-2"><div v-for="item in 6" :key="item" class="h-[310px] rounded-2xl border bg-card"></div></div>
          <div v-else-if="products.length" class="grid gap-5 md:grid-cols-2">
            <article v-for="product in products" :key="product.id" class="account-product-card flex min-h-[310px] flex-col rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
              <div class="flex items-start justify-between gap-3"><span class="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">#{{ product.id }}</span><span class="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-300"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>{{ accountStockLabel(product) }}</span></div>
              <span class="mt-6 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{{ productCategoryName(product) }}</span>
              <h2 class="mt-2 text-xl font-extrabold leading-snug">{{ getLocalizedText(product.title) }}</h2>
              <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{{ getLocalizedText(product.description) || t('storefront.accountShelf.defaultDescription') }}</p>
              <div class="mt-5 flex flex-wrap gap-2"><span v-for="tag in (product.tags || []).slice(0, 3)" :key="tag" class="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">{{ tag }}</span><span v-if="product.skus?.length" class="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">{{ t('storefront.accountShelf.optionCount', { count: product.skus.length }) }}</span></div>
              <div class="mt-auto flex items-end justify-between gap-3 border-t border-border pt-5"><div><p class="text-xs font-semibold text-muted-foreground">{{ t('products.price') }}</p><p class="mt-1 text-2xl font-extrabold tabular-nums">{{ formatPriceForMinimumQuantity(product.price_amount, product.price_quantity_basis, product.min_purchase_quantity, siteCurrency) }}</p></div><RouterLink :to="`/products/${product.slug}`" class="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:bg-emerald-700">{{ t('storefront.accountShelf.chooseAccount') }}<ArrowRight class="h-4 w-4" /></RouterLink></div>
            </article>
          </div>
          <EmptyCatalogState v-else :filtered="Boolean(searchQuery || selectedCategory)" @reset="resetFilters" />
          <PaginationNav v-if="totalPages > 1" :page-window="pageWindow" :current-page="currentPage" :total-pages="totalPages" @change="changePage" />
        </section>
      </div>
    </template>

    <template v-else-if="isServicesCatalog">
      <header class="service-catalog-hero relative overflow-hidden rounded-[28px] border px-6 py-8 text-white sm:px-9 sm:py-10"><div class="relative z-10 max-w-2xl"><p class="text-xs font-extrabold uppercase tracking-[.16em] text-indigo-200">{{ t('storefront.serviceShelf.eyebrow') }}</p><h1 class="mt-3 text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">{{ t('storefront.serviceShelf.title') }}</h1><p class="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">{{ t('storefront.serviceShelf.lede') }}</p></div><TrendingUp class="absolute -bottom-10 -right-3 h-48 w-48 text-indigo-200 opacity-10 sm:right-8" /></header>
      <div class="mt-6 grid items-start gap-6 lg:grid-cols-[260px_1fr]"><aside class="grid gap-4 lg:sticky lg:top-[92px]"><div class="rounded-2xl border bg-card p-3.5 shadow-[var(--shadow-sm)]"><p class="px-2 pb-2 text-xs font-extrabold uppercase tracking-[.12em] text-muted-foreground">{{ t('storefront.serviceShelf.platforms') }}</p><button type="button" class="service-filter" :class="selectedCategory === null ? 'service-filter-active' : ''" @click="selectCategory(null)"><span class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><TrendingUp class="h-4 w-4" /></span>{{ t('products.allCategories') }}</button><template v-for="group in categoryGroups" :key="group.id"><button type="button" class="service-filter" :class="selectedCategory === group.id ? 'service-filter-active' : ''" @click="selectCategory(group.id)"><img :src="categoryImage(group)" :alt="categoryName(group)" class="h-8 w-8 rounded-lg object-contain" /><span class="min-w-0 flex-1 truncate">{{ categoryName(group) }}</span></button><button v-for="child in group.children" :key="child.id" type="button" class="service-filter service-filter-child" :class="selectedCategory === child.id ? 'service-filter-active' : ''" @click="selectCategory(child.id)">{{ categoryName(child) }}</button></template></div><div class="rounded-2xl border border-indigo-500/20 bg-indigo-500/[.055] p-5"><div class="flex items-center gap-2 text-sm font-extrabold text-indigo-700 dark:text-indigo-200"><CircleHelp class="h-5 w-5" />{{ t('storefront.serviceShelf.hintTitle') }}</div><p class="mt-3 text-sm leading-6 text-muted-foreground">{{ t('storefront.serviceShelf.hintBody') }}</p></div></aside>
        <section class="min-w-0"><div class="relative mb-5"><Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" /><input v-model="searchQuery" class="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500" :placeholder="t('storefront.serviceShelf.search')" :aria-label="t('products.searchLabel')" /><button v-if="searchQuery" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary" :aria-label="t('blog.searchClear')" @click="clearSearch"><X class="h-4 w-4" /></button></div><div class="mb-5 flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-muted-foreground"><strong class="text-foreground">{{ selectedCategoryName || pageTitle }}</strong><span v-if="!loading" class="ml-2">{{ t('storefront.list.resultCount', { count: products.length }) }}</span></p><RouterLink to="/services" class="text-sm font-bold text-indigo-600 dark:text-indigo-300">{{ t('storefront.list.reset') }}</RouterLink></div><div v-if="loading" class="grid gap-4 md:grid-cols-2"><div v-for="item in 6" :key="item" class="h-[276px] rounded-2xl border bg-card"></div></div><div v-else-if="products.length" class="grid gap-4 md:grid-cols-2"><article v-for="product in products" :key="product.id" class="service-product-card flex min-h-[276px] flex-col rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]"><div class="flex items-start justify-between gap-3"><span class="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-300">#{{ product.id }}</span><span class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300"><span class="h-2 w-2 rounded-full bg-indigo-500"></span>{{ accountStockLabel(product) }}</span></div><span class="mt-5 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{{ productCategoryName(product) }}</span><h2 class="mt-2 text-lg font-extrabold leading-snug">{{ getLocalizedText(product.title) }}</h2><p class="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ getLocalizedText(product.description) || t('storefront.serviceShelf.defaultDescription') }}</p><div class="mt-4 flex flex-wrap gap-2"><span v-for="tag in (product.tags || []).slice(0, 2)" :key="tag" class="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">{{ tag }}</span><span v-if="product.skus?.length" class="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">{{ t('storefront.serviceShelf.planCount', { count: product.skus.length }) }}</span></div><div class="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4"><div><p class="text-xs font-semibold text-muted-foreground">{{ t('storefront.serviceShelf.fromPrice') }}</p><p class="mt-1 text-xl font-extrabold tabular-nums">{{ formatPriceForMinimumQuantity(product.price_amount, product.price_quantity_basis, product.min_purchase_quantity, siteCurrency) }}</p></div><RouterLink :to="`/products/${product.slug}`" class="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-sm font-extrabold text-white transition hover:bg-indigo-700">{{ t('storefront.serviceShelf.configure') }}<ArrowRight class="h-4 w-4" /></RouterLink></div></article></div><EmptyCatalogState v-else :filtered="Boolean(searchQuery || selectedCategory)" @reset="resetFilters" /><PaginationNav v-if="totalPages > 1" :page-window="pageWindow" :current-page="currentPage" :total-pages="totalPages" @change="changePage" /></section></div>
    </template>

    <template v-else>
      <header class="relative overflow-hidden rounded-[26px] border border-border bg-card px-6 py-8 sm:px-8 lg:px-10"><div class="relative max-w-2xl"><p class="eyebrow">{{ pageEyebrow }}</p><h1 class="mt-2 text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{{ pageTitle }}</h1><p class="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{{ pageLede }}</p></div><PackageOpen class="absolute -bottom-9 -right-6 h-44 w-44 opacity-[.07] sm:right-6" /></header><div class="mt-6 grid items-start gap-6 lg:grid-cols-[264px_1fr]"><aside class="grid gap-3 lg:sticky lg:top-[92px]"><div class="relative"><Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" /><input v-model="searchQuery" class="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground outline-none transition focus:border-primary" :placeholder="t('products.searchBoxPlaceholder')" :aria-label="t('products.searchLabel')" /><button v-if="searchQuery" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary" :aria-label="t('blog.searchClear')" @click="clearSearch"><X class="h-4 w-4" /></button></div></aside><section class="min-w-0"><div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><div v-for="item in 9" :key="item" class="h-[290px] rounded-2xl border bg-card"></div></div><template v-else-if="products.length"><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><VaultProductCard v-for="(product, index) in products" :key="product.id" :product="product" :index="index" @quick-buy="openQuickBuy" /></div><PaginationNav v-if="totalPages > 1" :page-window="pageWindow" :current-page="currentPage" :total-pages="totalPages" @change="changePage" /></template><EmptyCatalogState v-else :filtered="Boolean(searchQuery || selectedCategory)" @reset="resetFilters" /></section></div>
    </template>
    <ProductQuickBuy v-if="quickBuyProduct" :product="quickBuyProduct" :visible="quickBuyVisible" @update:visible="quickBuyVisible = $event" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Boxes, ChevronLeft, ChevronRight, CircleHelp, PackageOpen, Search, ShieldCheck, TrendingUp, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useProductList } from '../../composables/useProductList'
import { usePageSeo } from '../../composables/usePageSeo'
import { useLocalized, useProductLabels } from '../../composables/useProduct'
import { categoryImagePath } from '../../utils/catalog'
import { getImageUrl } from '../../utils/image'
import type { PublicCategory } from '../../utils/category'
import { routeBaseName } from '../../utils/routeNames'
import VaultProductCard from './components/VaultProductCard.vue'
import ProductQuickBuy from '../../components/ProductQuickBuy.vue'

const { t } = useI18n()
const route = useRoute()
const { getLocalizedText, siteCurrency, formatPriceForMinimumQuantity } = useLocalized()
const { getStockStatusLabel } = useProductLabels()
const quickBuyProduct = ref<any>(null)
const quickBuyVisible = ref(false)
const openQuickBuy = (product: any) => { quickBuyProduct.value = product; quickBuyVisible.value = true }
const { loading, products, selectedCategory, searchQuery, currentPage, totalPages, categoryGroups, categoryMap, catalog, selectCategory, changePage, clearSearch, initialize, cleanup } = useProductList({ pageSize: 12, homeRouteName: 'products' })
const isAccountsCatalog = computed(() => catalog.value === 'accounts')
const isServicesCatalog = computed(() => catalog.value === 'services')
const categoryName = (category: PublicCategory) => getLocalizedText(category.name) || category.slug || ''
const categoryImage = (category: PublicCategory) => getImageUrl(categoryImagePath(category))
const productCategoryName = (product: any) => getLocalizedText(product?.category?.name) || ''
const accountStockLabel = (product: any) => getStockStatusLabel(product)
const selectedCategoryName = computed(() => selectedCategory.value ? categoryName(categoryMap.value.get(selectedCategory.value) as PublicCategory) : '')
const pageTitle = computed(() => { if (routeBaseName(route.name) === 'catalog-category-products' || routeBaseName(route.name) === 'category-products') return selectedCategoryName.value || t('storefront.list.allTitle'); if (isAccountsCatalog.value) return t('storefront.accountShelf.title'); if (isServicesCatalog.value) return t('storefront.list.servicesTitle'); return t('storefront.list.allTitle') })
const pageEyebrow = computed(() => isServicesCatalog.value ? t('storefront.list.servicesEyebrow') : t('nav.products'))
const pageLede = computed(() => isServicesCatalog.value ? t('storefront.list.servicesLede') : t('storefront.list.allLede'))
const pageWindow = computed(() => { const pages: number[] = []; const start = Math.max(1, currentPage.value - 2); const end = Math.min(totalPages.value, start + 4); for (let page = Math.max(1, end - 4); page <= end; page++) pages.push(page); return pages })
const resetFilters = () => { clearSearch(); selectCategory(null) }
usePageSeo({ canonicalPath: () => route.path, title: () => pageTitle.value })
onMounted(() => { void initialize() })
onUnmounted(() => cleanup())

const PaginationNav = defineComponent({
  props: { pageWindow: { type: Array, required: true }, currentPage: { type: Number, required: true }, totalPages: { type: Number, required: true } },
  emits: ['change'],
  setup(props, { emit }) { return () => h('nav', { class: 'mt-9 flex justify-center gap-2' }, [h(Button, { variant: 'outline', size: 'icon', class: 'rounded-full', disabled: props.currentPage <= 1, onClick: () => emit('change', props.currentPage - 1) }, () => h(ChevronLeft, { class: 'h-4 w-4' })), ...(props.pageWindow as number[]).map((page) => h(Button, { variant: page === props.currentPage ? 'default' : 'outline', size: 'icon', class: 'rounded-full', onClick: () => emit('change', page) }, () => String(page))), h(Button, { variant: 'outline', size: 'icon', class: 'rounded-full', disabled: props.currentPage >= props.totalPages, onClick: () => emit('change', props.currentPage + 1) }, () => h(ChevronRight, { class: 'h-4 w-4' }))]) }
})
const EmptyCatalogState = defineComponent({
  props: { filtered: Boolean }, emits: ['reset'],
  setup(props, { emit }) { return () => h('div', { class: 'rounded-2xl border border-dashed bg-card px-6 py-16 text-center' }, [h(PackageOpen, { class: 'mx-auto h-10 w-10 text-muted-foreground' }), h('h2', { class: 'mt-4 text-lg font-extrabold' }, props.filtered ? t('products.emptyFiltered') : t('products.empty')), h('p', { class: 'mt-2 text-sm text-muted-foreground' }, t('storefront.list.emptyLede')), props.filtered ? h(Button, { variant: 'outline', size: 'sm', class: 'mt-5 rounded-full', onClick: () => emit('reset') }, () => t('products.clearFilters')) : null]) }
})
</script>

<style scoped>
.eyebrow { color: var(--red); font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.account-shelf-hero { background: radial-gradient(circle at 88% 8%, rgba(55,207,173,.24), transparent 32%), linear-gradient(135deg, #0c1729, #102e36); }
.service-catalog-hero { background:radial-gradient(circle at 88% 8%,rgba(157,160,255,.28),transparent 32%),linear-gradient(135deg,#161844,#2b2863); }
.account-filter { display:flex; width:100%; align-items:center; gap:10px; border-radius:12px; padding:10px; text-align:left; font-size:14px; font-weight:700; color:var(--ink-2); transition:background-color .15s ease,color .15s ease; }.account-filter:hover { background:var(--surface-2); color:var(--ink); }.account-filter-active { background:var(--teal-soft) !important; color:var(--teal-strong) !important; }.account-filter-child { margin-left:16px; width:calc(100% - 16px); padding-block:8px; font-size:13px; }
.account-product-card { position:relative; overflow:hidden; transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease; }.account-product-card::after { content:''; position:absolute; right:-55px; bottom:-60px; width:180px; height:180px; border-radius:999px; background:var(--teal-soft); opacity:.55; filter:blur(5px); }.account-product-card > * { position:relative; z-index:1; }.account-product-card:hover { transform:translateY(-3px); border-color:var(--teal); box-shadow:var(--shadow); }
.service-filter { display:flex; width:100%; align-items:center; gap:10px; border-radius:12px; padding:10px; text-align:left; font-size:14px; font-weight:700; color:var(--ink-2); transition:background-color .15s ease,color .15s ease; }.service-filter:hover { background:var(--surface-2); color:var(--ink); }.service-filter-active { background:var(--red-soft) !important; color:var(--red-strong) !important; }.service-filter-child { margin-left:16px; width:calc(100% - 16px); padding-block:8px; font-size:13px; }
.service-product-card { position:relative; overflow:hidden; transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease; }.service-product-card::after { content:''; position:absolute; right:-60px; bottom:-68px; width:180px; height:180px; border-radius:999px; background:var(--red-soft); opacity:.65; filter:blur(5px); }.service-product-card > * { position:relative; z-index:1; }.service-product-card:hover { transform:translateY(-3px); border-color:var(--red); box-shadow:var(--shadow); }
.filter-item { display:flex; width:100%; align-items:center; gap:10px; border-radius:10px; padding:10px 8px; text-align:left; font-size:14px; font-weight:700; color:var(--ink-2); transition:background-color .15s ease,color .15s ease; }.filter-item:hover { background:var(--surface-2); color:var(--ink); }.filter-item-active { background:var(--red-soft) !important; color:var(--red-strong) !important; }.filter-chip { flex:none; border-radius:999px; background:var(--surface-2); padding:8px 13px; font-size:13px; font-weight:700; color:var(--ink-2); }.filter-chip-active { background:var(--red); color:white; }
</style>
