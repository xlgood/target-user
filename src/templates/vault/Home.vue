<template>
  <div>
    <section class="relative overflow-hidden border-b border-border bg-[color:var(--bg-deep)] text-white">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(104,98,255,.42),transparent_31%),radial-gradient(circle_at_85%_48%,rgba(15,159,127,.22),transparent_28%)]"></div>
      <div class="relative mx-auto grid min-h-[510px] max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold text-white/75"><span class="h-2 w-2 rounded-full bg-emerald-300"></span>{{ t('storefront.heroEyebrow') }}</div>
          <h1 class="mt-6 max-w-[14ch] text-4xl font-extrabold leading-[1.08] tracking-[-.05em] text-white sm:text-5xl lg:text-[58px]">{{ t('storefront.heroTitle') }}</h1>
          <p class="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg">{{ t('storefront.heroLede') }}</p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <RouterLink to="/accounts" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[color:var(--bg-deep)] transition hover:-translate-y-0.5"><ShieldCheck class="h-4 w-4" />{{ t('storefront.catalog.accounts') }}<ArrowRight class="h-4 w-4" /></RouterLink>
            <RouterLink to="/services" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-5 text-sm font-extrabold text-white transition hover:bg-white/15"><TrendingUp class="h-4 w-4" />{{ t('storefront.catalog.services') }}<ArrowRight class="h-4 w-4" /></RouterLink>
          </div>
          <div class="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/60"><span class="inline-flex items-center gap-2"><Zap class="h-4 w-4 text-amber-300" />{{ t('storefront.heroTrust.fast') }}</span><span class="inline-flex items-center gap-2"><LockKeyhole class="h-4 w-4 text-emerald-300" />{{ t('storefront.heroTrust.private') }}</span><span class="inline-flex items-center gap-2"><CircleHelp class="h-4 w-4 text-violet-200" />{{ t('storefront.heroTrust.support') }}</span></div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <RouterLink to="/accounts" class="group relative overflow-hidden rounded-[26px] border border-emerald-300/20 bg-[linear-gradient(145deg,rgba(15,159,127,.35),rgba(13,27,45,.9))] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-emerald-300/50 sm:min-h-[204px]">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-300/15 blur-2xl"></div><ShieldCheck class="h-8 w-8 text-emerald-200" /><p class="mt-6 text-xs font-bold uppercase tracking-[.14em] text-emerald-200/70">{{ t('storefront.lane.accountEyebrow') }}</p><h2 class="mt-2 text-2xl font-extrabold text-white">{{ t('storefront.catalog.accounts') }}</h2><p class="mt-2 text-sm leading-6 text-white/65">{{ t('storefront.lane.accountDescription') }}</p><span class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-200">{{ t('storefront.explore') }}<ArrowRight class="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </RouterLink>
          <RouterLink to="/services" class="group relative overflow-hidden rounded-[26px] border border-violet-300/20 bg-[linear-gradient(145deg,rgba(91,92,226,.4),rgba(13,27,45,.9))] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-violet-300/50 sm:min-h-[204px]">
            <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-300/15 blur-2xl"></div><TrendingUp class="h-8 w-8 text-violet-200" /><p class="mt-6 text-xs font-bold uppercase tracking-[.14em] text-violet-200/70">{{ t('storefront.lane.serviceEyebrow') }}</p><h2 class="mt-2 text-2xl font-extrabold text-white">{{ t('storefront.catalog.services') }}</h2><p class="mt-2 text-sm leading-6 text-white/65">{{ t('storefront.lane.serviceDescription') }}</p><span class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-200">{{ t('storefront.explore') }}<ArrowRight class="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-[var(--shadow-sm)] sm:grid-cols-4">
      <div v-for="item in trustItems" :key="item.label" class="bg-card px-4 py-5 text-center sm:px-6"><component :is="item.icon" class="mx-auto h-5 w-5 text-primary" /><p class="mt-2 text-sm font-extrabold text-foreground">{{ item.value }}</p><p class="mt-0.5 text-xs text-muted-foreground">{{ item.label }}</p></div>
    </section>

    <section class="mx-auto w-full max-w-[1240px] px-4 pt-[var(--gap-block)] sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow">{{ t('storefront.catalogEyebrow') }}</p><h2 class="mt-2 text-3xl font-extrabold tracking-[-.04em]">{{ t('storefront.catalogTitle') }}</h2><p class="mt-3 max-w-2xl text-muted-foreground">{{ t('storefront.catalogLede') }}</p></div></div>
      <div class="mt-8 grid gap-5 lg:grid-cols-2">
        <RouterLink to="/accounts" class="catalog-panel catalog-panel-accounts group"><div class="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><ShieldCheck class="h-6 w-6" /></div><div class="mt-7"><p class="eyebrow !text-emerald-700 dark:!text-emerald-300">{{ t('storefront.lane.accountEyebrow') }}</p><h3 class="mt-2 text-2xl font-extrabold">{{ t('storefront.catalog.accounts') }}</h3><p class="mt-3 max-w-[48ch] text-sm leading-6 text-muted-foreground">{{ t('storefront.lane.accountDescription') }}</p></div><div class="mt-8 flex flex-wrap gap-2"><span v-for="item in accountHighlights" :key="item" class="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">{{ item }}</span></div><span class="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{{ t('storefront.browseAccounts') }}<ArrowRight class="h-4 w-4 transition group-hover:translate-x-1" /></span></RouterLink>
        <RouterLink to="/services" class="catalog-panel catalog-panel-services group"><div class="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><TrendingUp class="h-6 w-6" /></div><div class="mt-7"><p class="eyebrow">{{ t('storefront.lane.serviceEyebrow') }}</p><h3 class="mt-2 text-2xl font-extrabold">{{ t('storefront.catalog.services') }}</h3><p class="mt-3 max-w-[48ch] text-sm leading-6 text-muted-foreground">{{ t('storefront.lane.serviceDescription') }}</p></div><div class="mt-8 flex flex-wrap gap-2"><span v-for="item in serviceHighlights" :key="item" class="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{{ item }}</span></div><span class="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-primary">{{ t('storefront.browseServices') }}<ArrowRight class="h-4 w-4 transition group-hover:translate-x-1" /></span></RouterLink>
      </div>
    </section>

    <section class="mx-auto w-full max-w-[1240px] px-4 pt-[var(--gap-block)] sm:px-6"><div class="flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow">{{ t('storefront.platformEyebrow') }}</p><h2 class="mt-2 text-3xl font-extrabold tracking-[-.04em]">{{ t('storefront.platformTitle') }}</h2></div><RouterLink to="/services" class="inline-flex items-center gap-1 text-sm font-bold text-primary">{{ t('storefront.viewAll') }}<ArrowRight class="h-4 w-4" /></RouterLink></div><div v-if="platformsLoading" class="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"><div v-for="item in 6" :key="item" class="h-28 rounded-2xl border bg-card"></div></div><div v-else-if="platforms.length" class="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"><RouterLink v-for="platform in platforms" :key="platform.slug" :to="catalogPath('services', platform.slug)" class="platform-card"><img :src="categoryImage(platform)" :alt="categoryName(platform)" loading="lazy" class="h-11 w-11 object-contain" /><span class="mt-3 line-clamp-2 text-center text-sm font-bold">{{ categoryName(platform) }}</span></RouterLink></div></section>

    <section class="mx-auto w-full max-w-[1240px] px-4 pt-[var(--gap-block)] sm:px-6"><div class="rounded-[28px] border border-border bg-card px-6 py-8 sm:px-9 lg:grid lg:grid-cols-[.75fr_1.25fr] lg:gap-12 lg:py-10"><div><p class="eyebrow">{{ t('storefront.promiseEyebrow') }}</p><h2 class="mt-2 text-3xl font-extrabold tracking-[-.04em]">{{ t('storefront.promiseTitle') }}</h2><p class="mt-4 text-sm leading-7 text-muted-foreground">{{ t('storefront.promiseLede') }}</p><RouterLink to="/about" class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">{{ t('storefront.learnMore') }}<ArrowRight class="h-4 w-4" /></RouterLink></div><div class="mt-8 grid gap-4 sm:grid-cols-3 lg:mt-0"><div v-for="item in promiseItems" :key="item.title" class="rounded-2xl bg-secondary p-5"><component :is="item.icon" class="h-6 w-6 text-primary" /><h3 class="mt-5 text-base font-extrabold">{{ item.title }}</h3><p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.description }}</p></div></div></div></section>

    <section v-if="posts.length" class="mx-auto w-full max-w-[1240px] px-4 pt-[var(--gap-block)] sm:px-6"><div class="flex items-end justify-between gap-3"><div><p class="eyebrow">{{ t('storefront.updateEyebrow') }}</p><h2 class="mt-2 text-3xl font-extrabold tracking-[-.04em]">{{ t('storefront.updateTitle') }}</h2></div><RouterLink to="/notice" class="text-sm font-bold text-primary">{{ t('storefront.viewAll') }}</RouterLink></div><div class="mt-7 grid gap-4 md:grid-cols-3"><RouterLink v-for="post in posts" :key="post.id" :to="`/blog/${post.slug}`" class="rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"><span class="text-xs font-semibold text-muted-foreground">{{ formatDate(post.published_at) }}</span><h3 class="mt-3 line-clamp-2 text-lg font-extrabold">{{ getLocalizedText(post.title) }}</h3><p class="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{{ getLocalizedText(post.summary) }}</p><span class="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">{{ t('storefront.readMore') }}<ArrowRight class="h-4 w-4" /></span></RouterLink></div></section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, CircleHelp, LockKeyhole, ShieldCheck, TrendingUp, Zap } from 'lucide-vue-next'
import { categoryAPI, postAPI } from '../../api'
import { buildCategoryGroups, type PublicCategory } from '../../utils/category'
import { catalogPath, categoryImagePath } from '../../utils/catalog'
import { getImageUrl } from '../../utils/image'
import { useLocalized } from '../../composables/useProduct'

const { t } = useI18n()
const { getLocalizedText } = useLocalized()
const platforms = ref<PublicCategory[]>([])
const platformsLoading = ref(true)
const posts = ref<any[]>([])
const categoryName = (category: PublicCategory) => getLocalizedText(category.name) || category.slug || ''
const categoryImage = (category: PublicCategory) => getImageUrl(categoryImagePath(category))
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString() : ''
const accountHighlights = computed(() => [t('storefront.accountHighlights.one'), t('storefront.accountHighlights.two'), t('storefront.accountHighlights.three')])
const serviceHighlights = computed(() => [t('storefront.serviceHighlights.one'), t('storefront.serviceHighlights.two'), t('storefront.serviceHighlights.three')])
const trustItems = computed(() => [
  { icon: Zap, value: t('storefront.trust.fastValue'), label: t('storefront.trust.fastLabel') },
  { icon: ShieldCheck, value: t('storefront.trust.safeValue'), label: t('storefront.trust.safeLabel') },
  { icon: LockKeyhole, value: t('storefront.trust.privateValue'), label: t('storefront.trust.privateLabel') },
  { icon: CircleHelp, value: t('storefront.trust.supportValue'), label: t('storefront.trust.supportLabel') },
])
const promiseItems = computed(() => [
  { icon: ShieldCheck, title: t('storefront.promise.one.title'), description: t('storefront.promise.one.description') },
  { icon: Zap, title: t('storefront.promise.two.title'), description: t('storefront.promise.two.description') },
  { icon: CircleHelp, title: t('storefront.promise.three.title'), description: t('storefront.promise.three.description') },
])

onMounted(async () => {
  try {
    const response = await categoryAPI.list({ catalog: 'services' })
    platforms.value = buildCategoryGroups(response.data.data || []).slice(0, 12)
  } finally { platformsLoading.value = false }
  try { posts.value = (await postAPI.list({ page: 1, page_size: 3 })).data.data || [] } catch { posts.value = [] }
})
</script>

<style scoped>
.eyebrow { color: var(--red); font-size: 12px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.catalog-panel { position: relative; overflow: hidden; min-height: 330px; border: 1px solid var(--border); border-radius: 24px; background: var(--surface); padding: 30px; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.catalog-panel:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.catalog-panel::after { content: ''; position: absolute; right: -50px; bottom: -70px; width: 200px; height: 200px; border-radius: 50%; opacity: .5; filter: blur(6px); }
.catalog-panel-accounts::after { background: var(--teal-soft); }.catalog-panel-services::after { background: var(--red-soft); }
.catalog-panel > * { position: relative; z-index: 1; }.platform-card { display: flex; min-height: 126px; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 18px; background: var(--surface); padding: 18px 12px; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }.platform-card:hover { transform: translateY(-3px); border-color: var(--red); box-shadow: var(--shadow); }
</style>
