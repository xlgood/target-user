import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    skuId?: number
    skuCode?: string
    skuSpecValues?: Record<string, any>
    skuManualStockTotal?: number
    skuManualStockLocked?: number
    skuManualStockSold?: number
    skuAutoStockAvailable?: number
    skuStockStatus?: string
    skuStockDisplayMode?: string
    skuStockDisplay?: string
    skuStockRangeMin?: number
    skuStockRangeMax?: number
    skuStockQuantityHidden?: boolean
    skuStockEnforced?: boolean
    skuStockSnapshotAt?: string
    slug: string
    title: any
    priceAmount: string
    priceQuantityBasis?: number
    wholesalePrices?: Array<{ sku_id?: number; sku_code?: string; min_quantity: number; unit_price: string | number }>
    image?: string
    quantity: number
    minPurchaseQuantity?: number
    maxPurchaseQuantity?: number
    purchaseType?: string
    fulfillmentType?: string
    manualFormSchema?: any
    manualFormData?: Record<string, any>
    commentsQuantityFromForm?: boolean
    paymentChannelIds?: number[]
}

const normalizeSkuId = (value: unknown) => {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return 0
    const integerValue = Math.trunc(numberValue)
    return integerValue > 0 ? integerValue : 0
}

const cartIdentity = (item: Pick<CartItem, 'productId' | 'skuId'>) => `${item.productId}:${normalizeSkuId(item.skuId)}`

const normalizeOptionalStockNumber = (value: unknown, allowUnlimited = false): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return undefined
    const integerValue = Math.floor(numberValue)
    if (allowUnlimited && integerValue === -1) return -1
    return Math.max(integerValue, 0)
}

const normalizeOptionalBoolean = (value: unknown): boolean | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    return Boolean(value)
}

const normalizeOptionalString = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined
    const text = String(value).trim()
    return text || undefined
}

const normalizeOptionalLimitNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return undefined
    const integerValue = Math.floor(numberValue)
    if (integerValue <= 0) return undefined
    return integerValue
}

const normalizePriceQuantityBasis = (value: unknown): number => {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return 1
    return Math.max(1, Math.floor(numberValue))
}

const normalizeManualFormData = (value: unknown): Record<string, any> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return { ...(value as Record<string, any>) }
}

// 兜底将数量收敛到 [min, max] 区间，确保 store 内数据始终合法。
// UI 层（ProductDetail / Cart 等）应在调用前根据 min/max 给用户提示，避免出现"数量被静默抬升"的体验。
const clampCartQuantity = (quantity: number, maxPurchaseQuantity?: number, minPurchaseQuantity?: number) => {
    const lowerBound = minPurchaseQuantity && minPurchaseQuantity > 0 ? minPurchaseQuantity : 1
    const normalizedQuantity = Math.max(lowerBound, Math.floor(Number(quantity) || lowerBound))
    if (!maxPurchaseQuantity || maxPurchaseQuantity <= 0) {
        return normalizedQuantity
    }
    return Math.min(normalizedQuantity, maxPurchaseQuantity)
}

const loadCartItems = (): CartItem[] => {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const row = item as any
                const productId = Number(row.productId)
                if (!Number.isFinite(productId) || productId <= 0) return null
                return {
                    ...(item as CartItem),
                    productId: Math.trunc(productId),
                    skuId: normalizeSkuId(row.skuId),
                    skuManualStockTotal: normalizeOptionalStockNumber(row.skuManualStockTotal ?? row.sku_manual_stock_total, true),
                    skuManualStockLocked: normalizeOptionalStockNumber(row.skuManualStockLocked ?? row.sku_manual_stock_locked),
                    skuManualStockSold: normalizeOptionalStockNumber(row.skuManualStockSold ?? row.sku_manual_stock_sold),
                    skuAutoStockAvailable: normalizeOptionalStockNumber(row.skuAutoStockAvailable ?? row.sku_auto_stock_available),
                    skuStockStatus: normalizeOptionalString(row.skuStockStatus ?? row.sku_stock_status),
                    skuStockDisplayMode: normalizeOptionalString(row.skuStockDisplayMode ?? row.sku_stock_display_mode),
                    skuStockDisplay: normalizeOptionalString(row.skuStockDisplay ?? row.sku_stock_display),
                    skuStockRangeMin: normalizeOptionalStockNumber(row.skuStockRangeMin ?? row.sku_stock_range_min),
                    skuStockRangeMax: normalizeOptionalStockNumber(row.skuStockRangeMax ?? row.sku_stock_range_max),
                    skuStockQuantityHidden: normalizeOptionalBoolean(row.skuStockQuantityHidden ?? row.sku_stock_quantity_hidden),
                    skuStockEnforced: normalizeOptionalBoolean(row.skuStockEnforced ?? row.sku_stock_enforced),
                    skuStockSnapshotAt: normalizeOptionalString(row.skuStockSnapshotAt ?? row.sku_stock_snapshot_at),
                    minPurchaseQuantity: normalizeOptionalLimitNumber(row.minPurchaseQuantity ?? row.min_purchase_quantity),
                    maxPurchaseQuantity: normalizeOptionalLimitNumber(row.maxPurchaseQuantity ?? row.max_purchase_quantity),
                    priceQuantityBasis: normalizePriceQuantityBasis(row.priceQuantityBasis ?? row.price_quantity_basis),
                    manualFormData: normalizeManualFormData(row.manualFormData ?? row.manual_form_data),
                    commentsQuantityFromForm: Boolean(row.commentsQuantityFromForm ?? row.comments_quantity_from_form),
                } as CartItem
            })
            .filter(Boolean) as CartItem[]
    } catch (error) {
        console.error('Failed to parse cart items', error)
        return []
    }
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>(loadCartItems())

    const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const persist = () => {
        localStorage.setItem('cart_items', JSON.stringify(items.value))
    }

    const addItem = (item: CartItem, quantity = 1) => {
        const normalizedItem: CartItem = {
            ...item,
            productId: Math.trunc(Number(item.productId)),
            skuId: normalizeSkuId(item.skuId),
            skuManualStockTotal: normalizeOptionalStockNumber(item.skuManualStockTotal, true),
            skuManualStockLocked: normalizeOptionalStockNumber(item.skuManualStockLocked),
            skuManualStockSold: normalizeOptionalStockNumber(item.skuManualStockSold),
            skuAutoStockAvailable: normalizeOptionalStockNumber(item.skuAutoStockAvailable),
            skuStockStatus: normalizeOptionalString(item.skuStockStatus),
            skuStockDisplayMode: normalizeOptionalString(item.skuStockDisplayMode),
            skuStockDisplay: normalizeOptionalString(item.skuStockDisplay),
            skuStockRangeMin: normalizeOptionalStockNumber(item.skuStockRangeMin),
            skuStockRangeMax: normalizeOptionalStockNumber(item.skuStockRangeMax),
            skuStockQuantityHidden: normalizeOptionalBoolean(item.skuStockQuantityHidden),
            skuStockEnforced: normalizeOptionalBoolean(item.skuStockEnforced),
            skuStockSnapshotAt: normalizeOptionalString(item.skuStockSnapshotAt) || new Date().toISOString(),
            minPurchaseQuantity: normalizeOptionalLimitNumber(item.minPurchaseQuantity),
            maxPurchaseQuantity: normalizeOptionalLimitNumber(item.maxPurchaseQuantity),
            priceQuantityBasis: normalizePriceQuantityBasis(item.priceQuantityBasis),
            manualFormData: normalizeManualFormData(item.manualFormData),
            commentsQuantityFromForm: Boolean(item.commentsQuantityFromForm),
        }
        const qty = clampCartQuantity(quantity, normalizedItem.maxPurchaseQuantity, normalizedItem.minPurchaseQuantity)
        const identity = cartIdentity(normalizedItem)
        const existing = items.value.find((entry) => cartIdentity(entry) === identity)
        if (existing) {
            existing.quantity = clampCartQuantity(existing.quantity + qty, normalizedItem.maxPurchaseQuantity, normalizedItem.minPurchaseQuantity)
            existing.slug = normalizedItem.slug
            existing.title = normalizedItem.title
            existing.priceAmount = normalizedItem.priceAmount
            existing.priceQuantityBasis = normalizedItem.priceQuantityBasis
            existing.wholesalePrices = normalizedItem.wholesalePrices
            existing.image = normalizedItem.image
            existing.minPurchaseQuantity = normalizedItem.minPurchaseQuantity
            existing.maxPurchaseQuantity = normalizedItem.maxPurchaseQuantity
            existing.purchaseType = normalizedItem.purchaseType
            existing.fulfillmentType = normalizedItem.fulfillmentType
            existing.manualFormSchema = normalizedItem.manualFormSchema
            existing.manualFormData = normalizedItem.manualFormData
            existing.commentsQuantityFromForm = normalizedItem.commentsQuantityFromForm
            existing.skuId = normalizedItem.skuId
            existing.skuCode = normalizedItem.skuCode
            existing.skuSpecValues = normalizedItem.skuSpecValues
            existing.skuManualStockTotal = normalizedItem.skuManualStockTotal
            existing.skuManualStockLocked = normalizedItem.skuManualStockLocked
            existing.skuManualStockSold = normalizedItem.skuManualStockSold
            existing.skuAutoStockAvailable = normalizedItem.skuAutoStockAvailable
            existing.skuStockStatus = normalizedItem.skuStockStatus
            existing.skuStockDisplayMode = normalizedItem.skuStockDisplayMode
            existing.skuStockDisplay = normalizedItem.skuStockDisplay
            existing.skuStockRangeMin = normalizedItem.skuStockRangeMin
            existing.skuStockRangeMax = normalizedItem.skuStockRangeMax
            existing.skuStockQuantityHidden = normalizedItem.skuStockQuantityHidden
            existing.skuStockEnforced = normalizedItem.skuStockEnforced
            existing.skuStockSnapshotAt = normalizedItem.skuStockSnapshotAt
        } else {
            items.value.push({
                ...normalizedItem,
                quantity: qty,
            })
        }
        persist()
    }

    const updateQuantity = (productId: number, quantity: number, skuId?: number) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        const qty = clampCartQuantity(quantity, target.maxPurchaseQuantity, target.minPurchaseQuantity)
        target.quantity = qty
        persist()
    }

    const patchItem = (productId: number, skuId: number | undefined, patch: Partial<CartItem>) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        Object.assign(target, patch)
        target.productId = Math.trunc(Number(target.productId))
        target.skuId = normalizeSkuId(target.skuId)
        target.skuManualStockTotal = normalizeOptionalStockNumber(target.skuManualStockTotal, true)
        target.skuManualStockLocked = normalizeOptionalStockNumber(target.skuManualStockLocked)
        target.skuManualStockSold = normalizeOptionalStockNumber(target.skuManualStockSold)
        target.skuAutoStockAvailable = normalizeOptionalStockNumber(target.skuAutoStockAvailable)
        target.skuStockStatus = normalizeOptionalString(target.skuStockStatus)
        target.skuStockDisplayMode = normalizeOptionalString(target.skuStockDisplayMode)
        target.skuStockDisplay = normalizeOptionalString(target.skuStockDisplay)
        target.skuStockRangeMin = normalizeOptionalStockNumber(target.skuStockRangeMin)
        target.skuStockRangeMax = normalizeOptionalStockNumber(target.skuStockRangeMax)
        target.skuStockQuantityHidden = normalizeOptionalBoolean(target.skuStockQuantityHidden)
        target.skuStockEnforced = normalizeOptionalBoolean(target.skuStockEnforced)
        target.skuStockSnapshotAt = normalizeOptionalString(target.skuStockSnapshotAt)
        target.minPurchaseQuantity = normalizeOptionalLimitNumber(target.minPurchaseQuantity)
        target.maxPurchaseQuantity = normalizeOptionalLimitNumber(target.maxPurchaseQuantity)
        target.priceQuantityBasis = normalizePriceQuantityBasis(target.priceQuantityBasis)
        target.manualFormData = normalizeManualFormData(target.manualFormData)
        target.commentsQuantityFromForm = Boolean(target.commentsQuantityFromForm)
        persist()
    }

    const removeItem = (productId: number, skuId?: number) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        items.value = items.value.filter((entry) => cartIdentity(entry) !== identity)
        persist()
    }

    const clear = () => {
        items.value = []
        persist()
    }

    return {
        items,
        totalItems,
        addItem,
        updateQuantity,
        patchItem,
        removeItem,
        clear,
    }
})
