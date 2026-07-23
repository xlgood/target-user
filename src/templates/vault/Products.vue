<template>
  <div class="mx-auto w-full max-w-[1240px] px-4 pb-8 sm:px-6">
    <nav class="flex items-center gap-1.5 py-5 text-xs font-semibold text-muted-foreground"><RouterLink to="/" class="hover:text-primary">{{ t('nav.home') }}</RouterLink><ChevronRight class="h-4 w-4" /><span class="truncate text-foreground">{{ pageTitle }}</span></nav>

    <header class="relative overflow-hidden rounded-[26px] border border-border bg-card px-6 py-8 sm:px-8 lg:px-10" :class="catalog === 'accounts' ? 'catalog-hero-accounts' : 'catalog-hero-services'">
      <div class="relative max-w-2xl"><p class="eyebrow">{{ pageEyebrow }}</p><h1 class="mt-2 text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{{ pageTitle }}</h1><p class="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{{ pageLede }}</p></div>
      <component :is="catalog === 'accounts' ? ShieldCheck : TrendingUp" class="absolute -bottom-9 -right-6 h-44 w-44 opacity-[.07] sm:right-6" />
    </header>

    <div class="mt-6 grid items-start gap-6 lg:grid-cols-[264px_1fr]">
      <aside class="grid gap-3 lg:sticky lg:top-[92px]">
        <div class="relative"><Search class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" /><input v-model="searchQuery" class="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground outline-none transition focus:border-primary" :placeholder="t('products.searchBoxPlaceholder')" :aria-label="t('products.searchLabel')" /><button v-if="searchQuery" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary" :aria-label="t('blog.searchClear')" @click="clearSearch"><X class="h-4 w-4" /></button></div>
        <div class="hidden rounded-2xl border bg-card p-3 lg:block"><p class="px-2 pb-2 text-xs font-extrabold uppercase tracking-[.12em] text-muted-foreground">{{ t('products.categories') }}</p><button type="button" class="filter-item" :class="selectedCategory === null ? 'filter-item-active' : ''" @click="selectCategory(null)">{{ t('products.allCategories') }}</button><template v-for="group in categoryGroups" :key="group.id"><button type="button" class="filter-item" :class="selectedCategory === group.id ? 'filter-item-active' : ''" @click="selectCategory(group.id)"><img :src="categoryImage(group)" :alt="categoryName(group)" class="h-5 w-5 object-contain" /><span class="truncate">{{ categoryName(group) }}</span></button><button v-for="child in group.children" :key="child.id" type="button" class="filter-item ml-3 w-[calc(100%-12px)] text-[13px]" :class="selectedCategory === child.id ? 'filter-item-active' : ''" @click="selectCategory(child.id)">{{ categoryName(child) }}</button></template></div>
        <div class="flex gap-2 overflow-x-auto pb-1 lg:hidden"><button type="button" class="filter-chip" :class="selectedCategory === null ? 'filter-chip-active' : ''" @click="selectCategory(null)">{{ t('products.allCategories') }}</button><button v-for="group in categoryGroups" :key="group.id" type="button" class="filter-chip" :class="selectedCategory === group.id ? 'filter-chip-active' : ''" @click="selectCategory(group.id)">{{ categoryName(group) }}</button></div>
      </aside>

      <section class="min-w-0"><div class="mb-5 flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-muted-foreground"><strong class="text-foreground">{{ selectedCategoryName || pageTitle }}</strong><span v-if="!loading" class="ml-2">{{ t('storefront.list.resultCount', { count: products.length }) }}</span></p><RouterLink v-if="catalog" :to="catalogPath(catalog)" class="text-sm font-bold text-primary">{{ t('storefront.list.reset') }}</RouterLink></div>
        <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><div v-for="item in 9" :key="item" class="h-[290px] rounded-2xl border bg-card"></div></div>
        <template v-else-if="products.length"><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><VaultProductCard v-for="(product, index) in products" :key="product.id" :product="product" :index="index" @quick-buy="openQuickBuy" /></div><nav v-if="totalPages > 1" class="mt-9 flex justify-center gap-2"><button class="page-button" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)"><ChevronLeft class="h-4 w-4" /></button><button v-for="page in pageWindow" :key="page" class="page-button" :class="page === currentPage ? 'page-button-active' : ''" @click="changePage(page)">{{ page }}</button><button class="page-button" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)"><ChevronRight class="h-4 w-4" /></button></nav></template>
        <div v-else class="rounded-2xl border border-dashed bg-card px-6 py-16 text-center"><PackageOpen class="mx-auto h-10 w-10 text-muted-foreground" /><h2 class="mt-4 text-lg font-extrabold">{{ searchQuery || selectedCategory ? t('products.emptyFiltered') : t('products.empty') }}</h2><p class="mt-2 text-sm text-muted-foreground">{{ t('storefront.list.emptyLede') }}</p><Button v-if="searchQuery || selectedCategory" variant="outline" size="sm" class="mt-5 rounded-full" @click="resetFilters">{{ t('products.clearFilters') }}</Button></div>
      </section>
    </div>
    <ProductQuickBuy v-if="quickBuyProduct" :product="quickBuyProduct" :visible="quickBuyVisible" @update:visible="quickBuyVisible = $event" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight, PackageOpen, Search, ShieldCheck, TrendingUp, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useProductList } from '../../composables/useProductList'
import { usePageSeo } from '../../composables/usePageSeo'
import { useLocalized } from '../../composables/useProduct'
import { categoryImagePath, catalogPath } from '../../utils/catalog'
import { getImageUrl } from '../../utils/image'
import type { PublicCategory } from '../../utils/category'
import { routeBaseName } from '../../utils/routeNames'
import VaultProductCard from './components/VaultProductCard.vue'
import ProductQuickBuy from '../../components/ProductQuickBuy.vue'

const { t } = useI18n()
const route = useRoute()
const { getLocalizedText } = useLocalized()
const quickBuyProduct = ref<any>(null)
const quickBuyVisible = ref(false)
const openQuickBuy = (product: any) => { quickBuyProduct.value = product; quickBuyVisible.value = true }
const {
  loading, products, selectedCategory, searchQuery, currentPage, totalPages, categoryGroups, categoryMap, catalog,
  selectCategory, changePage, clearSearch, initialize, cleanup,
} = useProductList({ pageSize: 12, homeRouteName: 'products' })
const categoryName = (category: PublicCategory) => getLocalizedText(category.name) || category.slug || ''
const categoryImage = (category: PublicCategory) => getImageUrl(categoryImagePath(category))
const selectedCategoryName = computed(() => selectedCategory.value ? categoryName(categoryMap.value.get(selectedCategory.value) as PublicCategory) : '')
const pageTitle = computed(() => {
  if (routeBaseName(route.name) === 'catalog-category-products' || routeBaseName(route.name) === 'category-products') return selectedCategoryName.value || t('storefront.list.allTitle')
  if (catalog.value === 'accounts') return t('storefront.list.accountsTitle')
  if (catalog.value === 'services') return t('storefront.list.servicesTitle')
  return t('storefront.list.allTitle')
})
const pageEyebrow = computed(() => catalog.value === 'accounts' ? t('storefront.list.accountsEyebrow') : catalog.value === 'services' ? t('storefront.list.servicesEyebrow') : t('nav.products'))
const pageLede = computed(() => catalog.value === 'accounts' ? t('storefront.list.accountsLede') : catalog.value === 'services' ? t('storefront.list.servicesLede') : t('storefront.list.allLede'))
const pageWindow = computed(() => { const pages: number[] = []; const start = Math.max(1, currentPage.value - 2); const end = Math.min(totalPages.value, start + 4); for (let page = Math.max(1, end - 4); page <= end; page++) pages.push(page); return pages })
const resetFilters = () => { clearSearch(); selectCategory(null) }
usePageSeo({ canonicalPath: () => route.path, title: () => pageTitle.value })
onMounted(() => { void initialize() })
onUnmounted(() => cleanup())
</script>

<style scoped>
.eyebrow { color: var(--red); font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }.catalog-hero-accounts { background: radial-gradient(circle at 95% 10%, var(--teal-soft), transparent 34%), var(--surface); }.catalog-hero-services { background: radial-gradient(circle at 95% 10%, var(--red-soft), transparent 34%), var(--surface); }.filter-item { display:flex; width:100%; align-items:center; gap:10px; border-radius:10px; padding:10px 8px; text-align:left; font-size:14px; font-weight:700; color:var(--ink-2); transition:background-color .15s ease,color .15s ease; }.filter-item:hover { background:var(--surface-2); color:var(--ink); }.filter-item-active { background:var(--red-soft) !important; color:var(--red-strong) !important; }.filter-chip { flex:none; border-radius:999px; background:var(--surface-2); padding:8px 13px; font-size:13px; font-weight:700; color:var(--ink-2); }.filter-chip-active { background:var(--red); color:white; }.page-button { display:grid; min-height:40px; min-width:40px; place-items:center; border:1px solid var(--border); border-radius:999px; background:var(--surface); padding:0 10px; font-size:14px; font-weight:800; color:var(--ink-2); }.page-button:hover { border-color:var(--red); color:var(--red); }.page-button:disabled { cursor:not-allowed; opacity:.4; }.page-button-active { border-color:var(--red); background:var(--red); color:white; }
</style>
