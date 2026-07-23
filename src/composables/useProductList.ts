import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { productAPI, categoryAPI } from '../api'
import { buildCategoryGroups, createCategoryMap, normalizeCategoryParentId, type PublicCategory } from '../utils/category'
import { debounceAsync } from '../utils/debounce'
import { catalogFromRoute } from '../utils/catalog'
import { routeBaseName } from '../utils/routeNames'

export interface UseProductListOptions {
  pageSize?: number
  homeRouteName?: string
  categoryRouteName?: string
  catalogRouteName?: string
  catalogCategoryRouteName?: string
}

export function useProductList(options: UseProductListOptions = {}) {
  const {
    pageSize: defaultPageSize = 20,
    homeRouteName = 'home',
    categoryRouteName = 'category-products',
    catalogRouteName = 'catalog-products',
    catalogCategoryRouteName = 'catalog-category-products',
  } = options

  const router = useRouter()
  const route = useRoute()

  const loading = ref(true)
  const products = ref<any[]>([])
  const categories = ref<PublicCategory[]>([])
  const selectedCategory = ref<number | null>(null)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const totalPages = ref(0)
  const showFilterDrawer = ref(false)
  const expandedParentIds = ref<number[]>([])

  const categoryGroups = computed(() => buildCategoryGroups(categories.value))
  const categoryMap = computed(() => createCategoryMap(categories.value))
  const catalog = computed(() => catalogFromRoute(route.params.catalog))

  let initializing = true

  const isParentExpanded = (categoryId: number) => {
    return expandedParentIds.value.includes(categoryId)
  }

  const expandParentCategory = (categoryId: number) => {
    if (!categoryId || isParentExpanded(categoryId)) return
    expandedParentIds.value = [...expandedParentIds.value, categoryId]
  }

  const toggleParentCategory = (categoryId: number) => {
    if (isParentExpanded(categoryId)) {
      expandedParentIds.value = expandedParentIds.value.filter((id) => id !== categoryId)
      return
    }
    expandParentCategory(categoryId)
  }

  const getParentToggleButtonClass = (categoryId: number) => {
    return isParentExpanded(categoryId)
      ? 'bg-primary text-primary-foreground border-transparent'
      : 'bg-card/70 text-muted-foreground hover:text-foreground'
  }

  const syncExpandedCategoryState = () => {
    if (!selectedCategory.value) return

    const matched = categoryMap.value.get(selectedCategory.value)
    if (!matched) return

    const parentId = normalizeCategoryParentId(matched.parent_id)
    if (parentId > 0) {
      expandParentCategory(parentId)
      return
    }

    const selectedGroup = categoryGroups.value.find((group) => group.id === matched.id)
    if (selectedGroup?.children.length) {
      expandParentCategory(selectedGroup.id)
    }
  }

  const selectCategory = (categoryId: number | null, closeDrawer = false) => {
    selectedCategory.value = categoryId
    if (closeDrawer) {
      showFilterDrawer.value = false
    }
  }

  const loadProducts = async () => {
    loading.value = true
    try {
      const params: any = {
        page: currentPage.value,
        page_size: pageSize.value,
      }
      if (catalog.value) {
        params.catalog = catalog.value
      }
      if (selectedCategory.value) {
        params.category_id = selectedCategory.value
      }
      const keyword = searchQuery.value.trim()
      if (keyword) {
        params.search = keyword
      }
      const response = await productAPI.list(params)
      products.value = response.data.data || []
      if (response.data.pagination) {
        totalPages.value = response.data.pagination.total_page || 0
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list(catalog.value ? { catalog: catalog.value } : undefined)
      categories.value = response.data.data || []
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const debouncedLoadProducts = debounceAsync(loadProducts, 300)

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    debouncedLoadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearSearch = () => {
    if (!searchQuery.value) return
    searchQuery.value = ''
    currentPage.value = 1
    debouncedLoadProducts()
  }

  const onSearch = () => {
    currentPage.value = 1
    debouncedLoadProducts()
  }

  const syncSelectedCategoryFromRoute = () => {
    const baseRouteName = routeBaseName(route.name)
    const isCategoryRoute = baseRouteName === categoryRouteName || baseRouteName === catalogCategoryRouteName
    if (!isCategoryRoute) {
      if (selectedCategory.value !== null) {
        selectedCategory.value = null
      }
      return false
    }

    const slugParam = route.params.slug as string | undefined
    if (!slugParam || categories.value.length === 0) return false

    const matched = categories.value.find((category) => category.slug === slugParam)
    if (!matched) return false

    if (selectedCategory.value !== matched.id) {
      selectedCategory.value = matched.id
    }

    return true
  }

  watch(selectedCategory, () => {
    if (initializing) return
    currentPage.value = 1
    syncExpandedCategoryState()
    debouncedLoadProducts()

    if (selectedCategory.value) {
      const matched = categories.value.find((category) => category.id === selectedCategory.value)
      if (matched?.slug && route.params.slug !== matched.slug) {
        if (catalog.value) {
          router.replace({ name: catalogCategoryRouteName, params: { catalog: catalog.value, slug: matched.slug } })
        } else {
          router.replace({ name: categoryRouteName, params: { slug: matched.slug } })
        }
      }
    } else if (routeBaseName(route.name) === categoryRouteName || routeBaseName(route.name) === catalogCategoryRouteName) {
      router.replace(catalog.value ? { name: catalogRouteName, params: { catalog: catalog.value } } : { name: homeRouteName })
    }
  })

  watch(searchQuery, () => {
    if (initializing) return
    currentPage.value = 1
    debouncedLoadProducts()
  })

  watch(
    () => route.params.slug,
    () => {
      if (initializing) return
      if (categories.value.length === 0) return
      syncSelectedCategoryFromRoute()
    },
  )

  watch(
    () => route.params.catalog,
    async () => {
      if (initializing) return
      selectedCategory.value = null
      currentPage.value = 1
      await loadCategories()
      await loadProducts()
    },
  )

  const initialize = async () => {
    await loadCategories()
    if (syncSelectedCategoryFromRoute()) {
      syncExpandedCategoryState()
    }
    await loadProducts()
    initializing = false
  }

  const cleanup = () => {
    debouncedLoadProducts.cancel()
  }

  return {
    loading,
    products,
    categories,
    selectedCategory,
    searchQuery,
    currentPage,
    pageSize,
    totalPages,
    showFilterDrawer,
    expandedParentIds,
    categoryGroups,
    categoryMap,
    catalog,
    isParentExpanded,
    toggleParentCategory,
    getParentToggleButtonClass,
    selectCategory,
    loadProducts,
    loadCategories,
    changePage,
    clearSearch,
    onSearch,
    syncSelectedCategoryFromRoute,
    syncExpandedCategoryState,
    initialize,
    cleanup,
  }
}
