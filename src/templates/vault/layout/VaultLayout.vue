<template>
  <div class="vault-scope" :class="routeCatalog ? `catalog-${routeCatalog}` : ''">
    <div class="border-b border-border bg-[color:var(--bg-deep)] text-white">
      <div class="mx-auto flex min-h-9 w-full max-w-[1240px] items-center justify-between gap-3 px-4 py-2 text-xs text-white/65 sm:px-6">
        <span class="inline-flex items-center gap-2"><CircleCheck class="h-3.5 w-3.5 text-emerald-300" /> {{ t('storefront.topline') }}</span>
        <RouterLink to="/notice" class="hidden transition hover:text-white sm:inline">{{ t('storefront.noticeLink') }}</RouterLink>
      </div>
    </div>

    <header class="sticky top-0 z-50 border-b border-border/80 bg-[color:var(--bg)]/92 backdrop-blur-xl">
      <div class="mx-auto flex h-[72px] w-full max-w-[1240px] items-center gap-3 px-4 sm:px-6">
        <RouterLink class="inline-flex min-w-0 items-center gap-2.5 text-[19px] font-extrabold tracking-[-0.03em] text-foreground" to="/" :title="brandName">
          <img v-if="brandLogo" :src="brandLogo" :alt="brandName" class="h-9 max-w-[132px] object-contain sm:max-w-[170px]" />
          <span v-else class="truncate">{{ brandName }}</span>
        </RouterLink>

        <nav class="ml-3 hidden items-center gap-1 lg:flex">
          <RouterLink to="/" class="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground" active-class="!bg-primary/10 !text-primary" exact>{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/accounts" class="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground" active-class="!bg-emerald-500/10 !text-emerald-700 dark:!text-emerald-300">{{ t('storefront.catalog.accounts') }}</RouterLink>
          <RouterLink to="/services" class="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground" active-class="!bg-primary/10 !text-primary">{{ t('storefront.catalog.services') }}</RouterLink>
          <RouterLink v-if="noticeEnabled" to="/notice" class="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground" active-class="!bg-primary/10 !text-primary">{{ t('nav.notice') }}</RouterLink>
          <RouterLink v-if="aboutEnabled" to="/about" class="rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground" active-class="!bg-primary/10 !text-primary">{{ t('nav.about') }}</RouterLink>
        </nav>

        <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
          <RouterLink class="hidden h-10 items-center gap-2 rounded-full bg-secondary px-3 text-sm font-semibold text-muted-foreground transition hover:bg-primary/10 hover:text-primary sm:inline-flex" to="/products"><Search class="h-[17px] w-[17px]" /> {{ t('storefront.search') }}</RouterLink>
          <button class="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:bg-primary/10 hover:text-primary" type="button" :aria-label="t('resellerConsole.common.toggleTheme')" @click="toggleTheme">
            <Sun v-if="theme === 'dark'" class="h-[18px] w-[18px]" /><Moon v-else class="h-[18px] w-[18px]" />
          </button>
          <RouterLink class="relative grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:bg-primary/10 hover:text-primary" to="/cart" :aria-label="t('navbar.cart')">
            <ShoppingBag class="h-[18px] w-[18px]" />
            <span v-if="cartCount > 0" class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">{{ cartCount }}</span>
          </RouterLink>
          <RouterLink v-if="userAuthStore.isAuthenticated" class="hidden items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-bold text-foreground transition hover:border-primary sm:inline-flex" to="/me"><User class="h-[17px] w-[17px]" /> {{ t('navbar.personalCenter') }}</RouterLink>
          <RouterLink v-else class="hidden items-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 sm:inline-flex" to="/auth/login">{{ t('navbar.login') }}</RouterLink>
          <button class="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:bg-primary/10 hover:text-primary lg:hidden" type="button" :aria-label="t('navbar.more')" @click="menuOpen = !menuOpen"><X v-if="menuOpen" class="h-[18px] w-[18px]" /><Menu v-else class="h-[18px] w-[18px]" /></button>
        </div>
      </div>

      <div v-if="menuOpen" class="border-t border-border bg-card px-4 py-3 lg:hidden">
        <nav class="mx-auto grid max-w-[1240px] grid-cols-2 gap-2 sm:grid-cols-3">
          <RouterLink v-for="item in mobileMenu" :key="item.path" :to="item.path" class="rounded-lg bg-secondary px-3 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-primary" @click="menuOpen = false">{{ item.label }}</RouterLink>
          <RouterLink :to="userAuthStore.isAuthenticated ? '/me' : '/auth/login'" class="rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground" @click="menuOpen = false">{{ userAuthStore.isAuthenticated ? t('navbar.personalCenter') : t('navbar.login') }}</RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1"><slot /></main>

    <footer class="mt-[var(--gap-block)] border-t border-border bg-[color:var(--bg-deep)] text-white">
      <div class="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-9 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.55fr_repeat(3,1fr)]">
        <div>
          <RouterLink class="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.03em]" to="/">
            <img v-if="brandLogo" :src="brandLogo" :alt="brandName" class="h-9 max-w-[170px] object-contain" /><span v-else>{{ brandName }}</span>
          </RouterLink>
          <p class="mt-4 max-w-[35ch] text-sm leading-6 text-white/60">{{ brandDescription || t('storefront.footerTagline') }}</p>
        </div>
        <div><h4 class="mb-3 text-sm font-bold text-white">{{ t('storefront.footerCatalog') }}</h4><RouterLink to="/accounts" class="footer-link">{{ t('storefront.catalog.accounts') }}</RouterLink><RouterLink to="/services" class="footer-link">{{ t('storefront.catalog.services') }}</RouterLink></div>
        <div><h4 class="mb-3 text-sm font-bold text-white">{{ t('storefront.footerSupport') }}</h4><RouterLink to="/notice" class="footer-link">{{ t('nav.notice') }}</RouterLink><RouterLink to="/guides/account-access" class="footer-link">{{ t('storefront.guide') }}</RouterLink><RouterLink v-if="blogEnabled" to="/blog" class="footer-link">{{ t('nav.blog') }}</RouterLink></div>
        <div><h4 class="mb-3 text-sm font-bold text-white">{{ t('storefront.footerCompany') }}</h4><RouterLink to="/about" class="footer-link">{{ t('nav.about') }}</RouterLink><RouterLink to="/terms" class="footer-link">{{ t('footer.terms') }}</RouterLink><RouterLink to="/privacy" class="footer-link">{{ t('footer.privacy') }}</RouterLink></div>
      </div>
      <div class="mx-auto flex w-full max-w-[1240px] flex-wrap justify-between gap-3 border-t border-white/10 px-4 py-5 text-xs text-white/45 sm:px-6"><span>© {{ year }} {{ brandName }}</span><span>简体中文 · 繁體 · English</span></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CircleCheck, Menu, Moon, Search, ShoppingBag, Sun, User, X } from 'lucide-vue-next'
import { useAppStore } from '../../../stores/app'
import { useCartStore } from '../../../stores/cart'
import { useUserAuthStore } from '../../../stores/userAuth'
import { useTheme } from '../../../utils/theme'
import { getImageUrl } from '../../../utils/image'
import { catalogFromRoute } from '../../../utils/catalog'
import '@fontsource/rubik/latin-400.css'
import '@fontsource/rubik/latin-500.css'
import '@fontsource/rubik/latin-600.css'
import '@fontsource/rubik/latin-700.css'
import '@fontsource/rubik/latin-800.css'
import '@fontsource/nunito-sans/latin-400.css'
import '@fontsource/nunito-sans/latin-600.css'
import '@fontsource/nunito-sans/latin-700.css'
import '../styles/vault.css'

const { t } = useI18n()
const route = useRoute()
const appStore = useAppStore()
const cartStore = useCartStore()
const userAuthStore = useUserAuthStore()
const { theme, toggleTheme } = useTheme()
const menuOpen = ref(false)
const year = new Date().getFullYear()

const brandName = computed(() => String(appStore.config?.brand?.site_name || '').trim() || 'D&J Studio')
const brandLogo = computed(() => { const raw = String(appStore.config?.brand?.site_logo || '').trim(); return raw ? getImageUrl(raw) : '' })
const brandDescription = computed(() => {
  const description = appStore.config?.brand?.site_description
  if (!description || typeof description !== 'object') return ''
  return String((description as Record<string, string>)[appStore.locale] || (description as Record<string, string>)['zh-CN'] || '').trim()
})
const navBuiltin = computed(() => (appStore.config?.nav_config as { builtin?: Record<string, boolean> } | undefined)?.builtin)
const blogEnabled = computed(() => navBuiltin.value?.blog !== false)
const noticeEnabled = computed(() => navBuiltin.value?.notice !== false)
const aboutEnabled = computed(() => navBuiltin.value?.about !== false)
const cartCount = computed(() => cartStore.totalItems)
const routeCatalog = computed(() => catalogFromRoute(route.params.catalog))
const mobileMenu = computed(() => {
  const items = [
    { path: '/', label: t('nav.home') },
    { path: '/accounts', label: t('storefront.catalog.accounts') },
    { path: '/services', label: t('storefront.catalog.services') },
  ]
  if (noticeEnabled.value) items.push({ path: '/notice', label: t('nav.notice') })
  if (aboutEnabled.value) items.push({ path: '/about', label: t('nav.about') })
  return items
})
</script>
