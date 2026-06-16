<template>
  <div class="theme-personal-card">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-xl font-bold theme-text-primary">{{ t('personalCenter.reseller.siteConfig.title') }}</h2>
        <p class="mt-1 text-sm theme-text-muted">{{ t('personalCenter.reseller.siteConfig.subtitle') }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center rounded-lg border theme-btn-secondary px-3 py-1.5 text-xs font-semibold"
        :disabled="loading"
        @click="loadConfig"
      >
        {{ t('orders.filters.refresh') }}
      </button>
    </div>

    <div v-if="alert" class="mb-5 rounded-xl border px-4 py-3 text-sm shadow-sm" :class="pageAlertClass(alert.level)">
      {{ alert.message }}
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="idx in 4" :key="idx" class="h-14 animate-pulse rounded-xl border theme-surface-muted"></div>
    </div>

    <div v-else-if="!canEdit" class="rounded-xl border border-dashed theme-surface-soft px-4 py-6 text-sm theme-text-muted">
      {{ t('personalCenter.reseller.siteConfig.inactive') }}
    </div>

    <form v-else class="space-y-6" @submit.prevent="handleSave">
      <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.siteName') }}</span>
          <input v-model.trim="form.site_name" type="text" class="w-full form-input-lg" maxlength="120" />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.logo') }}</span>
          <input v-model.trim="form.logo" type="text" class="w-full form-input-lg" placeholder="/uploads/reseller/logo.png" />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.favicon') }}</span>
          <input v-model.trim="form.favicon" type="text" class="w-full form-input-lg" placeholder="/uploads/reseller/favicon.png" />
        </label>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.telegram') }}</span>
          <input v-model.trim="form.support!.telegram" type="text" class="w-full form-input-lg" placeholder="https://t.me/example" />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.whatsapp') }}</span>
          <input v-model.trim="form.support!.whatsapp" type="text" class="w-full form-input-lg" placeholder="https://wa.me/1234567890" />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.email') }}</span>
          <input v-model.trim="form.support!.email" type="text" class="w-full form-input-lg" placeholder="support@example.com" />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.supportUrl') }}</span>
          <input v-model.trim="form.support!.support_url" type="text" class="w-full form-input-lg" placeholder="https://example.com/support" />
        </label>
      </section>

      <section class="rounded-xl border theme-surface-soft p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-base font-bold theme-text-primary">{{ t('personalCenter.reseller.siteConfig.sections.seo') }}</h3>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label v-for="locale in resellerLocales" :key="`seo-title-${locale}`" class="block">
            <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.seoTitle') }} {{ locale }}</span>
            <input v-model.trim="form.seo!.title[locale]" type="text" class="w-full form-input-lg" />
          </label>
          <label v-for="locale in resellerLocales" :key="`seo-desc-${locale}`" class="block">
            <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.seoDescription') }} {{ locale }}</span>
            <textarea v-model.trim="form.seo!.description[locale]" rows="2" class="w-full form-input-lg"></textarea>
          </label>
          <label class="block md:col-span-3">
            <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.ogImage') }}</span>
            <input v-model.trim="form.seo!.default_og_image" type="text" class="w-full form-input-lg" placeholder="/uploads/reseller/og.png" />
          </label>
        </div>
      </section>

      <section class="rounded-xl border theme-surface-soft p-4">
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 class="text-base font-bold theme-text-primary">{{ t('personalCenter.reseller.siteConfig.sections.announcement') }}</h3>
          <label class="inline-flex items-center gap-2 text-sm theme-text-secondary">
            <input v-model="form.announcement!.enabled" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
            {{ t('personalCenter.reseller.siteConfig.fields.announcementEnabled') }}
          </label>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label class="block">
            <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.announcementType') }}</span>
            <select v-model="form.announcement!.type" class="w-full form-input-lg">
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
            </select>
          </label>
          <label v-for="locale in resellerLocales" :key="`ann-title-${locale}`" class="block">
            <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.announcementTitle') }} {{ locale }}</span>
            <input v-model.trim="form.announcement!.title[locale]" type="text" class="w-full form-input-lg" />
          </label>
          <label v-for="locale in resellerLocales" :key="`ann-content-${locale}`" class="block md:col-span-1">
            <span class="mb-2 block text-sm font-medium theme-text-secondary">{{ t('personalCenter.reseller.siteConfig.fields.announcementContent') }} {{ locale }}</span>
            <textarea v-model.trim="form.announcement!.content[locale]" rows="2" class="w-full form-input-lg"></textarea>
          </label>
        </div>
      </section>

      <section class="rounded-xl border theme-surface-soft p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-base font-bold theme-text-primary">{{ t('personalCenter.reseller.siteConfig.fields.footerLinks') }}</h3>
          <button type="button" class="rounded-lg border theme-btn-secondary px-3 py-1.5 text-xs font-semibold" @click="addFooterLink">
            {{ t('personalCenter.reseller.siteConfig.actions.addLink') }}
          </button>
        </div>
        <div v-if="!form.footer_links?.length" class="rounded-lg border border-dashed px-4 py-5 text-sm theme-text-muted">
          {{ t('personalCenter.reseller.siteConfig.emptyLinks') }}
        </div>
        <div v-for="(link, index) in form.footer_links" :key="index" class="mb-4 grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-[1fr_1fr_auto]">
          <input v-model.trim="link.name['zh-CN']" type="text" class="form-input-lg" :placeholder="`${t('personalCenter.reseller.siteConfig.fields.linkName')} zh-CN`" />
          <input v-model.trim="link.url" type="text" class="form-input-lg" placeholder="https://example.com" />
          <button type="button" class="rounded-lg border px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" @click="removeFooterLink(Number(index))">
            {{ t('personalCenter.reseller.siteConfig.actions.remove') }}
          </button>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-xl border theme-surface-soft p-4">
          <h3 class="mb-4 text-base font-bold theme-text-primary">{{ t('personalCenter.reseller.siteConfig.fields.navVisibility') }}</h3>
          <div class="flex flex-wrap gap-4 text-sm theme-text-secondary">
            <label v-for="key in builtinNavKeys" :key="key" class="inline-flex items-center gap-2">
              <input v-model="form.nav_config!.builtin[key]" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
              {{ key }}
            </label>
          </div>
        </div>
        <div class="rounded-xl border theme-surface-soft p-4">
          <h3 class="mb-4 text-base font-bold theme-text-primary">{{ t('personalCenter.reseller.siteConfig.sections.theme') }}</h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label class="block">
              <span class="mb-2 block text-xs theme-text-muted">{{ t('personalCenter.reseller.siteConfig.fields.primaryColor') }}</span>
              <input v-model.trim="form.theme!.primary_color" type="text" class="w-full form-input-lg" placeholder="#2563eb" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs theme-text-muted">{{ t('personalCenter.reseller.siteConfig.fields.accentColor') }}</span>
              <input v-model.trim="form.theme!.accent_color" type="text" class="w-full form-input-lg" placeholder="#16a34a" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs theme-text-muted">{{ t('personalCenter.reseller.siteConfig.fields.surfaceColor') }}</span>
              <input v-model.trim="form.theme!.surface_color" type="text" class="w-full form-input-lg" placeholder="#ffffff" />
            </label>
          </div>
        </div>
      </section>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex h-11 items-center justify-center rounded-xl theme-btn-primary px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ saving ? t('personalCenter.reseller.siteConfig.saving') : t('personalCenter.reseller.siteConfig.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    resellerAPI,
    type ResellerSiteConfigData,
    type ResellerSiteConfigPayload,
    type ResellerSiteConfigSnapshotData,
} from '../../api'
import { useAppStore } from '../../stores/app'
import { pageAlertClass, type PageAlert } from '../../utils/alerts'
import {
    blankLocalizedText,
    canEditResellerSiteConfig,
    normalizeFooterLinksForForm,
    normalizeLocalizedTextForForm,
    resellerLocales,
} from '../../utils/resellerSiteConfig'

const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const saving = ref(false)
const alert = ref<PageAlert | null>(null)
const snapshot = ref<ResellerSiteConfigSnapshotData | null>(null)
const builtinNavKeys = ['blog', 'notice', 'about']

const createBlankForm = (): ResellerSiteConfigPayload => ({
    site_name: '',
    logo: '',
    favicon: '',
    announcement: {
        enabled: false,
        type: 'info',
        title: blankLocalizedText(),
        content: blankLocalizedText(),
    },
    support: {
        telegram: '',
        whatsapp: '',
        email: '',
        support_url: '',
    },
    seo: {
        title: blankLocalizedText(),
        keywords: blankLocalizedText(),
        description: blankLocalizedText(),
        default_og_image: '',
    },
    footer_links: [],
    nav_config: {
        builtin: { blog: true, notice: true, about: true },
        custom_items: [],
    },
    theme: {
        primary_color: '',
        accent_color: '',
        surface_color: '',
    },
})

const form = reactive<any>(createBlankForm())

const canEdit = computed(() => canEditResellerSiteConfig(snapshot.value))

const assignForm = (config?: ResellerSiteConfigData) => {
    const next = createBlankForm()
    if (config) {
        next.site_name = config.site_name || ''
        next.logo = config.logo || ''
        next.favicon = config.favicon || ''
        next.announcement = {
            enabled: config.announcement?.enabled === true,
            type: config.announcement?.type || 'info',
            title: normalizeLocalizedTextForForm(config.announcement?.title),
            content: normalizeLocalizedTextForForm(config.announcement?.content),
        }
        next.support = {
            telegram: config.support?.telegram || '',
            whatsapp: config.support?.whatsapp || '',
            email: config.support?.email || '',
            support_url: config.support?.support_url || '',
        }
        next.seo = {
            title: normalizeLocalizedTextForForm(config.seo?.title),
            keywords: normalizeLocalizedTextForForm(config.seo?.keywords),
            description: normalizeLocalizedTextForForm(config.seo?.description),
            default_og_image: config.seo?.default_og_image || '',
        }
        next.footer_links = normalizeFooterLinksForForm(config.footer_links)
        next.nav_config = {
            builtin: { blog: true, notice: true, about: true, ...(config.nav_config?.builtin || {}) },
            custom_items: normalizeFooterLinksForForm(config.nav_config?.custom_items),
        }
        next.theme = {
            primary_color: config.theme?.primary_color || '',
            accent_color: config.theme?.accent_color || '',
            surface_color: config.theme?.surface_color || '',
        }
    }
    Object.assign(form, next)
}

const loadConfig = async () => {
    loading.value = true
    alert.value = null
    try {
        const response = await resellerAPI.siteConfig()
        snapshot.value = response.data.data || null
        assignForm(snapshot.value?.config)
    } catch (err: any) {
        alert.value = {
            level: 'error',
            message: err?.message || t('personalCenter.reseller.siteConfig.loadFailed'),
        }
    } finally {
        loading.value = false
    }
}

const addFooterLink = () => {
    if (!form.footer_links) form.footer_links = []
    if (form.footer_links.length >= 10) return
    form.footer_links.push({ name: blankLocalizedText(), url: '' })
}

const removeFooterLink = (index: number) => {
    form.footer_links?.splice(index, 1)
}

const handleSave = async () => {
    saving.value = true
    alert.value = null
    try {
        const response = await resellerAPI.updateSiteConfig(form)
        snapshot.value = { opened: true, can_edit: true, config: response.data.data }
        assignForm(response.data.data)
        await appStore.loadConfig(true)
        alert.value = {
            level: 'success',
            message: t('personalCenter.reseller.siteConfig.saveSuccess'),
        }
    } catch (err: any) {
        alert.value = {
            level: 'error',
            message: err?.message || t('personalCenter.reseller.siteConfig.saveFailed'),
        }
    } finally {
        saving.value = false
    }
}

onMounted(loadConfig)
</script>
