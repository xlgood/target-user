<template>
  <div class="min-h-screen bg-background px-4 pb-16 pt-28 text-foreground sm:px-6">
    <main class="mx-auto max-w-3xl">
      <RouterLink to="/products" class="inline-flex items-center text-sm font-semibold text-primary hover:underline">
        {{ t('accountAccessGuide.backToProducts') }}
      </RouterLink>

      <header class="mt-6 border-b pb-7">
        <h1 class="text-3xl font-black tracking-tight sm:text-4xl">{{ t('accountAccessGuide.title') }}</h1>
        <p class="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{{ t('accountAccessGuide.intro') }}</p>
      </header>

      <section class="mt-8 grid gap-4">
        <article v-for="(step, index) in steps" :key="step.title" class="rounded-xl border bg-card p-5 sm:p-6">
          <div class="flex gap-4">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{{ index + 1 }}</span>
            <div>
              <h2 class="text-lg font-bold">{{ step.title }}</h2>
              <p class="mt-2 leading-7 text-muted-foreground">{{ step.body }}</p>
            </div>
          </div>
        </article>
      </section>

      <section class="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <h2 class="text-lg font-bold">{{ t('accountAccessGuide.securityTitle') }}</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5 leading-7 text-muted-foreground">
          <li v-for="item in securityNotes" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="mt-6 rounded-xl border bg-card p-5 sm:p-6">
        <h2 class="text-lg font-bold">{{ t('accountAccessGuide.helpTitle') }}</h2>
        <p class="mt-2 leading-7 text-muted-foreground">{{ t('accountAccessGuide.helpBody') }}</p>
        <RouterLink to="/me/orders" class="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {{ t('accountAccessGuide.openOrders') }}
        </RouterLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const steps = computed(() => [
  { title: t('accountAccessGuide.steps.find.title'), body: t('accountAccessGuide.steps.find.body') },
  { title: t('accountAccessGuide.steps.review.title'), body: t('accountAccessGuide.steps.review.body') },
  { title: t('accountAccessGuide.steps.signIn.title'), body: t('accountAccessGuide.steps.signIn.body') },
  { title: t('accountAccessGuide.steps.mail.title'), body: t('accountAccessGuide.steps.mail.body') },
])

const securityNotes = computed(() => [
  t('accountAccessGuide.securityNotes.one'),
  t('accountAccessGuide.securityNotes.two'),
  t('accountAccessGuide.securityNotes.three'),
])
</script>
