export function petIconUrl(jlRes) {
  if (!jlRes) return null
  const name = jlRes.split('/').pop()?.split('.')[0]
  return name ? `/icons/pets1024/${name}.png` : null
}

export function petSmallIconUrl(jlSmallRes) {
  if (!jlSmallRes) return null
  const name = jlSmallRes.split('/').pop()?.split('.')[0]
  return name ? `/icons/pets/${name}.png` : null
}
