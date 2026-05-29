const base = import.meta.env.BASE_URL

export function petIconUrl(jlRes) {
  if (!jlRes) return null
  const name = jlRes.split('/').pop()?.split('.')[0]
  return name ? `${base}icons/pets256/${name}.png` : null
}

export function petSmallIconUrl(jlSmallRes) {
  if (!jlSmallRes) return null
  const name = jlSmallRes.split('/').pop()?.split('.')[0]
  return name ? `${base}icons/pets/${name}.png` : null
}
