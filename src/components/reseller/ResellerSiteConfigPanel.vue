<template>
  <Card :class="embedded ? 'p-5 sm:p-6' : 'p-6 sm:p-7'">
    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-center"
      :class="embedded ? 'md:justify-end' : 'md:justify-between'"
    >
      <div v-if="!embedded">
        <h2 class="text-xl font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.title') }}</h2>
        <p class="mt-1 text-sm text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.subtitle') }}</p>
      </div>
      <Button type="button" variant="outline" size="sm" :disabled="loading" @click="loadConfig">
        <RotateCcw class="mr-1.5 h-3.5 w-3.5" :class="loading ? 'animate-spin' : ''" />
        {{ t('orders.filters.refresh') }}
      </Button>
    </div>

    <Alert
      v-if="alert"
      class="mb-5"
      :variant="alert.level === 'error' ? 'destructive' : 'default'"
      :class="alert.level === 'success' ? 'border-success/40 text-success' : ''"
    >
      <AlertDescription>{{ alert.message }}</AlertDescription>
    </Alert>

    <div v-if="loading" class="space-y-3">
      <div v-for="idx in 4" :key="idx" class="h-14 animate-pulse rounded-xl border bg-muted"></div>
    </div>

    <div v-else-if="!canEdit" class="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
      <Lock class="mx-auto mb-2 h-5 w-5 opacity-60" />
      {{ t('personalCenter.reseller.siteConfig.inactive') }}
    </div>

    <form v-else class="space-y-5 pb-20" @submit.prevent="handleSave">
      <!-- 基础品牌 -->
      <section class="rounded-2xl border bg-card p-4 sm:p-5">
        <div class="mb-4 flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store class="h-4 w-4" />
          </span>
          <div>
            <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.sections.brand') }}</h3>
            <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.brand') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.siteName') }}</span>
            <Input v-model.trim="form.site_name" type="text" maxlength="120" />
          </label>
          <ResellerImageField
            v-model="form.logo"
            :label="t('personalCenter.reseller.siteConfig.fields.logo')"
            :hint="t('personalCenter.reseller.siteConfig.uploadHint')"
          />
          <ResellerImageField
            v-model="form.favicon"
            :label="t('personalCenter.reseller.siteConfig.fields.favicon')"
            :hint="t('personalCenter.reseller.siteConfig.uploadHint')"
          />
        </div>
      </section>

      <!-- 客服联系方式 -->
      <section class="rounded-2xl border bg-card p-4 sm:p-5">
        <div class="mb-4 flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy class="h-4 w-4" />
          </span>
          <div>
            <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.sections.support') }}</h3>
            <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.support') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label v-for="item in supportFields" :key="item.key" class="block">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t(item.label) }}</span>
            <div class="relative">
              <component :is="item.icon" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model.trim="form.support![item.key]" type="text" class="pl-9" :placeholder="item.placeholder" />
            </div>
            <p class="mt-1.5 font-mono text-xs text-muted-foreground/80">{{ item.hint }}</p>
          </label>
        </div>
      </section>

      <!-- SEO -->
      <section class="rounded-2xl border bg-card p-4 sm:p-5">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search class="h-4 w-4" />
            </span>
            <div>
              <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.sections.seo') }}</h3>
              <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.seo') }}</p>
            </div>
          </div>
          <ResellerLocaleTabs v-model="activeLocale" :labels="localeLabels" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.seoTitle') }}</span>
            <Input v-model.trim="form.seo!.title[activeLocale]" type="text" />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.seoKeywords') }}</span>
            <Input v-model.trim="form.seo!.keywords[activeLocale]" type="text" />
          </label>
          <label class="block md:col-span-2">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.seoDescription') }}</span>
            <Textarea v-model.trim="form.seo!.description[activeLocale]" rows="2" />
          </label>
          <div class="md:col-span-2">
            <ResellerImageField
              v-model="form.seo!.default_og_image"
              wide
              :label="t('personalCenter.reseller.siteConfig.fields.ogImage')"
              :hint="t('personalCenter.reseller.siteConfig.uploadHint')"
            />
          </div>
        </div>
      </section>

      <!-- 站点公告 -->
      <section class="rounded-2xl border bg-card p-4 sm:p-5">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone class="h-4 w-4" />
            </span>
            <div>
              <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.sections.announcement') }}</h3>
              <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.announcement') }}</p>
            </div>
          </div>
          <label class="inline-flex items-center gap-2 text-sm text-foreground">
            <Switch v-model="form.announcement!.enabled" />
            {{ t('personalCenter.reseller.siteConfig.fields.announcementEnabled') }}
          </label>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="block">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.announcementType') }}</span>
            <Select v-model="form.announcement!.type">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in announcementTypeOptions" :key="opt.value" :value="opt.value">
                  <span class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full" :class="opt.dot"></span>
                    {{ t(opt.label) }}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center justify-end md:col-span-2">
            <ResellerLocaleTabs v-model="activeLocale" :labels="localeLabels" />
          </div>
          <label class="block md:col-span-1">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.announcementTitle') }}</span>
            <Input v-model.trim="form.announcement!.title[activeLocale]" type="text" />
          </label>
          <div class="block md:col-span-2">
            <span class="mb-2 block text-sm font-medium text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.fields.announcementContent') }}</span>
            <ResellerRichText :key="`ann-${activeLocale}`" v-model="form.announcement!.content[activeLocale]" />
          </div>
        </div>
        <div v-if="form.announcement!.enabled && hasAnnouncementPreview" class="mt-4">
          <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.previewLabel') }}</p>
          <div class="rounded-xl border px-4 py-3 text-sm" :class="announcementPreviewClass">
            <p v-if="form.announcement!.title[activeLocale]" class="font-semibold">{{ form.announcement!.title[activeLocale] }}</p>
            <div v-if="announcementPreviewHtml" class="prose prose-sm dark:prose-invert mt-1 max-w-none opacity-90" v-html="announcementPreviewHtml"></div>
          </div>
        </div>
      </section>

      <!-- 页脚链接 -->
      <section class="rounded-2xl border bg-card p-4 sm:p-5">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Link2 class="h-4 w-4" />
            </span>
            <div>
              <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.fields.footerLinks') }}</h3>
              <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.footer') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <ResellerLocaleTabs v-model="activeLocale" :labels="localeLabels" />
            <Button type="button" variant="outline" size="sm" :disabled="(form.footer_links?.length || 0) >= 10" @click="addFooterLink">
              <Plus class="mr-1 h-3.5 w-3.5" />
              {{ t('personalCenter.reseller.siteConfig.actions.addLink') }}
            </Button>
          </div>
        </div>
        <div v-if="!form.footer_links?.length" class="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
          {{ t('personalCenter.reseller.siteConfig.emptyLinks') }}
        </div>
        <div
          v-for="(link, index) in form.footer_links"
          :key="`footer-${index}`"
          class="mb-3 grid grid-cols-1 gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <Input v-model.trim="link.name[activeLocale]" type="text" :placeholder="t('personalCenter.reseller.siteConfig.fields.linkName')" />
          <Input v-model.trim="link.url" type="text" placeholder="https://example.com" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="text-destructive hover:bg-destructive/10 hover:text-destructive"
            :aria-label="t('personalCenter.reseller.siteConfig.actions.remove')"
            @click="removeFooterLink(Number(index))"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </section>

      <!-- 导航 + 主题 -->
      <section class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="rounded-2xl border bg-card p-4 sm:p-5">
          <div class="mb-4 flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass class="h-4 w-4" />
            </span>
            <div>
              <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.fields.navVisibility') }}</h3>
              <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.nav') }}</p>
            </div>
          </div>
          <div class="space-y-2.5">
            <label
              v-for="key in builtinNavKeys"
              :key="key"
              class="flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-2.5 text-sm text-foreground"
            >
              <span class="font-medium">{{ t(`personalCenter.reseller.siteConfig.nav.${key}`) }}</span>
              <Switch v-model="form.nav_config!.builtin[key]" />
            </label>
          </div>
        </div>

        <div class="rounded-2xl border bg-card p-4 sm:p-5">
          <div class="mb-4 flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette class="h-4 w-4" />
            </span>
            <div>
              <h3 class="text-base font-bold text-foreground">{{ t('personalCenter.reseller.siteConfig.sections.theme') }}</h3>
              <p class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.descriptions.theme') }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResellerColorField
              v-model="form.theme!.primary_color"
              :label="t('personalCenter.reseller.siteConfig.fields.primaryColor')"
              placeholder="#2563eb"
              :clear-label="t('personalCenter.reseller.siteConfig.actions.remove')"
            />
            <ResellerColorField
              v-model="form.theme!.accent_color"
              :label="t('personalCenter.reseller.siteConfig.fields.accentColor')"
              placeholder="#16a34a"
              :clear-label="t('personalCenter.reseller.siteConfig.actions.remove')"
            />
            <ResellerColorField
              v-model="form.theme!.surface_color"
              :label="t('personalCenter.reseller.siteConfig.fields.surfaceColor')"
              placeholder="#ffffff"
              :clear-label="t('personalCenter.reseller.siteConfig.actions.remove')"
            />
          </div>
          <div class="mt-4">
            <p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.previewLabel') }}</p>
            <div class="flex items-center gap-3 rounded-xl border p-3" :style="{ backgroundColor: themeSurface }">
              <button type="button" class="rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm" :style="{ backgroundColor: themePrimary }">
                {{ form.site_name || t('personalCenter.reseller.siteConfig.previewLabel') }}
              </button>
              <span class="rounded-full px-2.5 py-1 text-xs font-medium text-white" :style="{ backgroundColor: themeAccent }">
                {{ t('personalCenter.reseller.siteConfig.fields.accentColor') }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 保存栏 -->
      <div
        class="sticky bottom-0 -mx-5 mt-2 flex items-center justify-end gap-3 border-t bg-card/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6"
      >
        <span v-if="dirtyHint" class="text-xs text-muted-foreground">{{ t('personalCenter.reseller.siteConfig.unsavedHint') }}</span>
        <Button type="submit" :disabled="saving">
          {{ saving ? t('personalCenter.reseller.siteConfig.saving') : t('personalCenter.reseller.siteConfig.save') }}
        </Button>
      </div>
    </form>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    Compass,
    LifeBuoy,
    Link2,
    Lock,
    Mail,
    Megaphone,
    MessageCircle,
    Palette,
    Plus,
    RotateCcw,
    Search,
    Send,
    Store,
    Trash2,
} from 'lucide-vue-next'
import {
    resellerAPI,
    type ResellerSiteConfigData,
    type ResellerSiteConfigPayload,
    type ResellerSiteConfigSnapshotData,
} from '../../api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ResellerColorField from './ResellerColorField.vue'
import ResellerImageField from './ResellerImageField.vue'
import ResellerLocaleTabs from './ResellerLocaleTabs.vue'
import ResellerRichText from './ResellerRichText.vue'
import { useAppStore } from '../../stores/app'
import { type PageAlert } from '../../utils/alerts'
import { processHtmlForDisplay } from '../../utils/content'
import DOMPurify from 'dompurify'
import {
    blankLocalizedText,
    canEditResellerSiteConfig,
    normalizeFooterLinksForForm,
    normalizeLocalizedTextForForm,
    type ResellerLocale,
} from '../../utils/resellerSiteConfig'

withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false })

const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const saving = ref(false)
const alert = ref<PageAlert | null>(null)
const snapshot = ref<ResellerSiteConfigSnapshotData | null>(null)
const activeLocale = ref<ResellerLocale>('zh-CN')
const baseline = ref('')
const builtinNavKeys = ['blog', 'notice', 'about']

const localeLabels: Record<string, string> = { 'zh-CN': '简体', 'zh-TW': '繁體', 'en-US': 'EN' }

const supportFields = [
    { key: 'telegram' as const, label: 'personalCenter.reseller.siteConfig.fields.telegram', icon: Send, placeholder: 'https://t.me/example', hint: 'https://t.me/…' },
    { key: 'whatsapp' as const, label: 'personalCenter.reseller.siteConfig.fields.whatsapp', icon: MessageCircle, placeholder: 'https://wa.me/1234567890', hint: 'https://wa.me/…' },
    { key: 'email' as const, label: 'personalCenter.reseller.siteConfig.fields.email', icon: Mail, placeholder: 'support@example.com', hint: 'name@example.com' },
    { key: 'support_url' as const, label: 'personalCenter.reseller.siteConfig.fields.supportUrl', icon: LifeBuoy, placeholder: 'https://example.com/support', hint: 'https://…' },
]

const announcementTypeOptions = [
    { value: 'info', label: 'personalCenter.reseller.siteConfig.announcementTypes.info', dot: 'bg-primary' },
    { value: 'success', label: 'personalCenter.reseller.siteConfig.announcementTypes.success', dot: 'bg-success' },
    { value: 'warning', label: 'personalCenter.reseller.siteConfig.announcementTypes.warning', dot: 'bg-amber-500' },
]

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
const dirtyHint = computed(
    () => !loading.value && !saving.value && baseline.value !== '' && JSON.stringify(form) !== baseline.value,
)

const themePrimary = computed(() => form.theme?.primary_color?.trim() || '#2563eb')
const themeAccent = computed(() => form.theme?.accent_color?.trim() || '#16a34a')
const themeSurface = computed(() => form.theme?.surface_color?.trim() || '#ffffff')

const hasAnnouncementPreview = computed(
    () => !!(form.announcement?.title?.[activeLocale.value] || form.announcement?.content?.[activeLocale.value]),
)
const announcementPreviewClass = computed(() => {
    switch (form.announcement?.type) {
        case 'success':
            return 'border-success/40 bg-success/10 text-success'
        case 'warning':
            return 'border-amber-400/50 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400'
        default:
            return 'border-primary/30 bg-primary/5 text-foreground'
    }
})
const announcementPreviewHtml = computed(() => {
    const raw = form.announcement?.content?.[activeLocale.value] || ''
    return DOMPurify.sanitize(processHtmlForDisplay(String(raw)), {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 'hr'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'width'],
        ALLOW_DATA_ATTR: false,
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/(?!\/))/i,
    })
})

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
    baseline.value = JSON.stringify(form)
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
