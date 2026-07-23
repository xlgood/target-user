<template>
  <div class="mx-auto w-full max-w-[900px] px-4 pb-10 pt-6 sm:px-6">
    <RouterLink to="/accounts" class="inline-flex items-center gap-1 text-sm font-bold text-primary"><ArrowLeft class="h-4 w-4" />{{ t('accountAccessGuide.backToProducts') }}</RouterLink>
    <header class="relative mt-5 overflow-hidden rounded-[26px] border bg-[color:var(--bg-deep)] px-6 py-9 sm:px-9"><div class="relative"><p class="text-xs font-extrabold uppercase tracking-[.14em] text-emerald-200">{{ t('storefront.catalog.accounts') }}</p><h1 class="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{{ t('accountAccessGuide.title') }}</h1><p class="mt-4 max-w-2xl leading-7 text-white/65">{{ t('accountAccessGuide.intro') }}</p></div><KeyRound class="absolute -bottom-10 -right-4 h-40 w-40 text-emerald-200 opacity-[.1]" /></header>
    <section class="mt-6 grid gap-4"><article v-for="(step, index) in steps" :key="step.title" class="flex gap-4 rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)] sm:p-6"><span class="grid h-9 w-9 flex-none place-items-center rounded-full bg-emerald-500/10 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{{ index + 1 }}</span><div><h2 class="text-lg font-extrabold">{{ step.title }}</h2><p class="mt-2 leading-7 text-muted-foreground">{{ step.body }}</p></div></article></section>
    <section class="mt-5 rounded-2xl border border-primary/20 bg-primary/[.04] p-5 sm:p-6"><h2 class="text-lg font-extrabold">{{ t('accountAccessGuide.securityTitle') }}</h2><ul class="mt-3 list-disc space-y-2 pl-5 leading-7 text-muted-foreground"><li v-for="item in securityNotes" :key="item">{{ item }}</li></ul></section>
    <section class="mt-5 rounded-2xl border bg-card p-5 sm:p-6"><h2 class="text-lg font-extrabold">{{ t('accountAccessGuide.helpTitle') }}</h2><p class="mt-2 leading-7 text-muted-foreground">{{ t('accountAccessGuide.helpBody') }}</p><RouterLink to="/me/orders" class="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">{{ t('accountAccessGuide.openOrders') }}</RouterLink></section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, KeyRound } from 'lucide-vue-next'

const { t } = useI18n()
const steps = computed(() => [
  { title: t('accountAccessGuide.steps.find.title'), body: t('accountAccessGuide.steps.find.body') },
  { title: t('accountAccessGuide.steps.review.title'), body: t('accountAccessGuide.steps.review.body') },
  { title: t('accountAccessGuide.steps.signIn.title'), body: t('accountAccessGuide.steps.signIn.body') },
  { title: t('accountAccessGuide.steps.mail.title'), body: t('accountAccessGuide.steps.mail.body') },
])
const securityNotes = computed(() => [t('accountAccessGuide.securityNotes.one'), t('accountAccessGuide.securityNotes.two'), t('accountAccessGuide.securityNotes.three')])
</script>
