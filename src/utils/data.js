export async function loadPets() {
  const mod = await import('../assets/data/pets.json');
  return mod.default;
}

export async function loadSkills() {
  const mod = await import('../assets/data/skills.json');
  return mod.default;
}

export async function loadFeatures() {
  const mod = await import('../assets/data/features.json');
  return mod.default;
}

export async function loadTypeRelations() {
  const mod = await import('../assets/data/type_relations.json');
  return mod.default;
}

export async function loadNatures() {
  const mod = await import('../assets/data/natures.json');
  return mod.default;
}

export async function loadEggConf() {
  const mod = await import('../assets/data/egg_conf.json');
  return mod.default;
}

export async function loadDescNotes() {
  const mod = await import('../assets/data/desc_notes.json');
  return mod.default;
}
