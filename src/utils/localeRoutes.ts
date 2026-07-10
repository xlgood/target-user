export const localePathMap: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en-US': 'en',
}

export const pathLocaleMap: Record<string, string> = Object.entries(localePathMap).reduce((acc, [locale, path]) => {
    acc[path] = locale
    return acc
}, {} as Record<string, string>)

export const localePathPrefixes = Object.values(localePathMap)
