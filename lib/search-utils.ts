export function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function buildAcronym(value?: string | null) {
  if (!value) return ''

  return value
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toLowerCase()
}

export function matchesSearchValue(value: string | null | undefined, query: string) {
  if (!value) return false

  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const normalizedValue = normalizeSearchText(value)
  if (normalizedValue.includes(normalizedQuery)) return true

  const acronym = buildAcronym(value)
  return acronym.includes(normalizedQuery.replace(/\s+/g, ''))
}