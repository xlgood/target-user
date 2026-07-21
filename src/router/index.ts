import { createRouter, createWebHistory } from 'vue-router'
import { useUserAuthStore } from '../stores/userAuth'
import { useAppStore } from '../stores/app'
import { useTelegramMiniAppStore } from '../stores/telegramMiniApp'
import { captureAffiliateFromRoute } from '../utils/affiliate'
import { templateView } from '../templates/registry'
import i18n, { isSupportedLocale } from '../i18n'
import { localePathPrefixes, pathLocaleMap } from '../utils/localeRoutes'

type RouteComponentLoader = () => Promise<unknown>
type AppRoute = NonNullable<Parameters<typeof createRouter>[0]['routes']>[number]

const homeViewLoader: RouteComponentLoader = () => import('../views/Home.vue')
const productsViewLoader: RouteComponentLoader = () => import('../views/Products.vue')
const productDetailViewLoader: RouteComponentLoader = () => import('../views/ProductDetail.vue')
const cartViewLoader: RouteComponentLoader = () => import('../views/Cart.vue')
const checkoutViewLoader: RouteComponentLoader = () => import('../views/Checkout.vue')
const paymentViewLoader: RouteComponentLoader = () => import('../views/Payment.vue')
const blogViewLoader: RouteComponentLoader = () => import('../views/Blog.vue')
const noticeViewLoader: RouteComponentLoader = () => import('../views/Notice.vue')
const accountAccessGuideViewLoader: RouteComponentLoader = () => import('../views/AccountAccessGuide.vue')
const loginViewLoader: RouteComponentLoader = () => import('../views/auth/Login.vue')
const resellerLayoutLoader: RouteComponentLoader = () => import('../views/reseller/ResellerConsoleLayout.vue')

const routeWarmupLoaders: RouteComponentLoader[] = [
    productsViewLoader,
    productDetailViewLoader,
    cartViewLoader,
    checkoutViewLoader,
    paymentViewLoader,
    blogViewLoader,
    noticeViewLoader,
    loginViewLoader,
]

let hasScheduledRouteWarmup = false

const shouldWarmupRoutes = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false
    }

    const connection = (navigator as Navigator & {
        connection?: {
            saveData?: boolean
            effectiveType?: string
        }
    }).connection

    if (connection?.saveData) {
        return false
    }

    return connection?.effectiveType !== 'slow-2g' && connection?.effectiveType !== '2g'
}

const scheduleIdleTask = (task: () => void) => {
    if (typeof window === 'undefined') {
        return
    }

    if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(task, { timeout: 1500 })
        return
    }

    window.setTimeout(task, 600)
}

const runRouteWarmupQueue = (loaders: RouteComponentLoader[]) => {
    const nextLoader = loaders.shift()
    if (!nextLoader || typeof window === 'undefined') {
        return
    }

    void nextLoader()
        .catch(() => undefined)
        .finally(() => {
            window.setTimeout(() => {
                scheduleIdleTask(() => runRouteWarmupQueue(loaders))
            }, 400)
        })
}

export const warmupCommonRoutes = () => {
    if (hasScheduledRouteWarmup || !shouldWarmupRoutes()) {
        return
    }

    hasScheduledRouteWarmup = true

    const startWarmup = () => {
        window.setTimeout(() => {
            scheduleIdleTask(() => runRouteWarmupQueue([...routeWarmupLoaders]))
        }, 1200)
    }

    if (document.readyState === 'complete') {
        startWarmup()
        return
    }

    window.addEventListener('load', startWarmup, { once: true })
}

const localePrefixPattern = localePathPrefixes.join('|')

const getRouteLocale = (params: unknown): string => {
    const raw = typeof params === 'string' ? params : Array.isArray(params) ? params[0] : ''
    return pathLocaleMap[String(raw || '').trim()] || ''
}

const publicLocaleRouteNames = new Set([
    'home',
    'products',
    'category-products',
    'product-detail',
    'blog',
    'blog-detail',
    'notice',
    'about',
    'terms',
    'privacy',
    'account-access-guide',
])

const withLocaleRoutes = (routes: AppRoute[]): AppRoute[] => {
    const localized = routes
        .filter((route) => route.name && publicLocaleRouteNames.has(String(route.name)))
        .map((route) => {
            const { alias: _alias, ...routeWithoutAlias } = route
            return {
                ...routeWithoutAlias,
                path: `/:locale(${localePrefixPattern})${route.path === '/' ? '' : route.path}`,
                name: `${String(route.name)}-locale`,
                meta: {
                    ...(route.meta || {}),
                    localeRoute: true,
                    baseRouteName: route.name,
                },
            }
        })

    const catchAllIndex = routes.findIndex((route) => String(route.path || '').includes(':pathMatch'))
    if (catchAllIndex < 0) return [...routes, ...localized]
    return [
        ...routes.slice(0, catchAllIndex),
        ...localized,
        ...routes.slice(catchAllIndex),
    ]
}

const baseRoutes: AppRoute[] = [
    {
        path: '/',
        name: 'home',
        component: templateView('Home', homeViewLoader),
    },
    {
        path: '/products',
        name: 'products',
        component: () => {
            const appStore = useAppStore()
            return appStore.config?.template_mode === 'list'
                ? templateView('Home', homeViewLoader)()
                : templateView('Products', productsViewLoader)()
        },
    },
    {
        path: '/categories/:slug',
        name: 'category-products',
        component: () => {
            const appStore = useAppStore()
            return appStore.config?.template_mode === 'list'
                ? templateView('Home', homeViewLoader)()
                : templateView('Products', productsViewLoader)()
        },
    },
    {
        path: '/products/:slug',
        name: 'product-detail',
        component: templateView('ProductDetail', productDetailViewLoader),
    },
    {
        path: '/cart',
        name: 'cart',
        component: templateView('Cart', cartViewLoader),
    },
    {
        path: '/checkout',
        name: 'checkout',
        component: templateView('Checkout', checkoutViewLoader),
        meta: { requiresUserAuth: true },
    },
    {
        path: '/pay',
        name: 'payment',
        component: templateView('Payment', paymentViewLoader),
        meta: { requiresUserAuth: true },
    },
    {
        path: '/me',
        name: 'personal-center',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'overview' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/profile',
        name: 'personal-center-profile',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'profile' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/security',
        name: 'personal-center-security',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'security' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/orders',
        name: 'personal-center-orders',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'orders' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/wallet',
        name: 'personal-center-wallet',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'wallet' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/gift-cards',
        name: 'personal-center-gift-cards',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'giftCard' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/api',
        name: 'personal-center-api',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'api' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/affiliate',
        name: 'personal-center-affiliate',
        component: templateView('PersonalCenter', () => import('../views/PersonalCenter.vue')),
        props: { section: 'affiliate' },
        meta: { requiresUserAuth: true }
    },
    {
        path: '/me/reseller',
        name: 'personal-center-reseller',
        redirect: '/reseller',
        meta: { requiresUserAuth: true, resellerConsole: true }
    },
    {
        path: '/reseller',
        component: resellerLayoutLoader,
        meta: { requiresUserAuth: true, resellerConsole: true },
        children: [
            { path: '', name: 'reseller-dashboard', component: () => import('../views/reseller/ResellerDashboard.vue') },
            { path: 'apply', name: 'reseller-apply', component: () => import('../views/reseller/ResellerApply.vue') },
            { path: 'domains', name: 'reseller-domains', component: () => import('../views/reseller/ResellerDomains.vue') },
            { path: 'site', name: 'reseller-site', component: () => import('../views/reseller/ResellerSiteConfig.vue') },
            { path: 'products', name: 'reseller-products', component: () => import('../views/reseller/ResellerProducts.vue') },
            { path: 'orders', name: 'reseller-orders', component: () => import('../views/reseller/ResellerOrders.vue') },
            { path: 'orders/:order_no', name: 'reseller-order-detail', component: () => import('../views/reseller/ResellerOrderDetail.vue') },
            { path: 'finance', name: 'reseller-finance', component: () => import('../views/reseller/ResellerFinance.vue') },
            { path: 'ledger', name: 'reseller-ledger', component: () => import('../views/reseller/ResellerLedger.vue') },
            { path: 'withdraws', name: 'reseller-withdraws', component: () => import('../views/reseller/ResellerWithdraws.vue') },
        ],
    },
    {
        path: '/orders/:order_no',
        name: 'order-detail',
        component: templateView('OrderDetail', () => import('../views/OrderDetail.vue')),
        meta: { requiresUserAuth: true }
    },
    {
        path: '/recharge-orders/:recharge_no',
        name: 'recharge-order-detail',
        component: templateView('RechargeOrderDetail', () => import('../views/RechargeOrderDetail.vue')),
        meta: { requiresUserAuth: true }
    },
    {
        path: '/guest/orders',
        redirect: () => `/auth/login?redirect=${encodeURIComponent('/me/orders')}`,
    },
    {
        path: '/guest/orders/:order_no',
        redirect: to => `/auth/login?redirect=${encodeURIComponent(`/orders/${String(to.params.order_no || '')}`)}`,
    },
    {
        path: '/blog',
        name: 'blog',
        component: templateView('Blog', blogViewLoader),
    },
    {
        path: '/blog/:slug',
        name: 'blog-detail',
        component: templateView('BlogDetail', () => import('../views/BlogDetail.vue')),
    },
    {
        path: '/notice',
        name: 'notice',
        component: templateView('Notice', noticeViewLoader),
    },
    {
        path: '/guides/account-access',
        name: 'account-access-guide',
        component: templateView('AccountAccessGuide', accountAccessGuideViewLoader),
    },
    {
        path: '/about',
        name: 'about',
        component: templateView('About', () => import('../views/About.vue')),
    },
    {
        path: '/terms',
        name: 'terms',
        component: templateView('Legal', () => import('../views/Legal.vue')),
        props: { type: 'terms' }
    },
    {
        path: '/privacy',
        name: 'privacy',
        component: templateView('Legal', () => import('../views/Legal.vue')),
        props: { type: 'privacy' }
    },
    {
        path: '/auth/login',
        name: 'user-login',
        component: templateView('auth/Login', loginViewLoader),
        meta: { userGuest: true }
    },
    {
        path: '/auth/register',
        name: 'user-register',
        component: templateView('auth/Register', () => import('../views/auth/Register.vue')),
        meta: { userGuest: true }
    },
    {
        path: '/auth/forgot',
        name: 'user-forgot',
        component: templateView('auth/Forgot', () => import('../views/auth/Forgot.vue')),
        meta: { userGuest: true }
    },
    {
        path: '/auth/telegram/callback',
        name: 'user-telegram-callback',
        component: templateView('auth/TelegramCallback', () => import('../views/auth/TelegramCallback.vue')),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: templateView('NotFound', () => import('../views/NotFound.vue')),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        if (to.hash) {
            return { el: to.hash, top: 80 }
        }
        return { top: 0 }
    },
    routes: withLocaleRoutes(baseRoutes),
})

// Navigation Guard
router.beforeEach(async (to, _from, next) => {
    const userAuthStore = useUserAuthStore()
    const appStore = useAppStore()
    void captureAffiliateFromRoute(to)

    const routeLocale = getRouteLocale(to.params.locale)
    if (routeLocale && isSupportedLocale(routeLocale) && appStore.locale !== routeLocale) {
        appStore.setLocale(routeLocale)
        ;(i18n.global.locale as any).value = routeLocale
    }

    // Ensure config is loaded before checking template mode
    if (!appStore.config) {
        await appStore.loadConfig()
    }

    if (to.meta.requiresUserAuth) {
        if (!userAuthStore.isAuthenticated) {
            const redirect = encodeURIComponent(to.fullPath)
            next(`/auth/login?redirect=${redirect}`)
        } else if (to.meta.resellerConsole && !appStore.canAccessResellerConsole) {
            next('/me/orders')
        } else {
            next()
        }
    }
    else if (to.meta.userGuest) {
        if (userAuthStore.isAuthenticated) {
            next('/me/orders')
        } else {
            next()
        }
    }
    else {
        next()
    }
})

// Update SEO on route change
router.afterEach(() => {
    const appStore = useAppStore()
    const telegramMiniAppStore = useTelegramMiniAppStore()
    appStore.applySEO()
    telegramMiniAppStore.syncRouteBackButton(router.currentRoute.value.path, () => {
        if (window.history.length > 1) {
            router.back()
            return
        }
        void router.push('/')
    })
})

export default router
