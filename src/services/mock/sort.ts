export function sortItems<T extends Record<string, unknown>>(
  items: T[],
  key: string,
  dir: 'asc' | 'desc',
): T[] {
  return [...items].sort((a, b) => {
    const av = a[key]
    const bv = b[key]

    // nulls/undefined always last
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1

    let cmp = 0
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv
    } else if (typeof av === 'boolean' && typeof bv === 'boolean') {
      cmp = Number(av) - Number(bv)
    } else {
      const as = String(av)
      const bs = String(bv)
      // ISO date strings sort correctly as strings; plain strings sort case-insensitively
      cmp = as.localeCompare(bs, undefined, { sensitivity: 'base', numeric: true })
    }

    return dir === 'asc' ? cmp : -cmp
  })
}
