const TYPE_COLORS = {
  '普通': 'bg-gray-400',
  '草': 'bg-green-500',
  '火': 'bg-red-500',
  '水': 'bg-blue-500',
  '光': 'bg-yellow-400',
  '地': 'bg-amber-700',
  '冰': 'bg-cyan-300',
  '龙': 'bg-orange-500',
  '电': 'bg-yellow-500',
  '毒': 'bg-purple-500',
  '虫': 'bg-lime-600',
  '武': 'bg-rose-700',
  '翼': 'bg-sky-400',
  '萌': 'bg-pink-400',
  '幽': 'bg-indigo-500',
  '恶': 'bg-violet-700',
  '机械': 'bg-slate-500',
  '幻': 'bg-fuchsia-500',
};

const TYPE_ICON_MAP = {
  '普通': 'ui_icon_species_02.png',
  '草': 'ui_icon_species_03.png',
  '火': 'ui_icon_species_04.png',
  '水': 'ui_icon_species_05.png',
  '光': 'ui_icon_species_06.png',
  '地': 'ui_icon_species_08.png',
  '冰': 'ui_icon_species_09.png',
  '龙': 'ui_icon_species_10.png',
  '电': 'ui_icon_species_11.png',
  '毒': 'ui_icon_species_12.png',
  '虫': 'ui_icon_species_13.png',
  '武': 'ui_icon_species_14.png',
  '翼': 'ui_icon_species_15.png',
  '萌': 'ui_icon_species_16.png',
  '幽': 'ui_icon_species_17.png',
  '恶': 'ui_icon_species_18.png',
  '机械': 'ui_icon_species_19.png',
  '幻': 'ui_icon_species_20.png',
};

const base = import.meta.env.BASE_URL

export default function TypeBadge({ type, className = '', showIcon = true, size = 20 }) {
  const iconFile = TYPE_ICON_MAP[type];
  if (showIcon && iconFile) {
    return (
      <img
        src={`${base}icons/species/${iconFile}`}
        alt={type}
        title={type}
        width={size}
        height={size}
        className={`inline-block object-contain ${className}`}
      />
    );
  }
  const color = TYPE_COLORS[type] || 'bg-gray-400';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-white text-xs font-medium ${color} ${className}`}>
      {type || '?'}
    </span>
  );
}
