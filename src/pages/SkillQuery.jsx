import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loadSkills, loadTypeIdMap } from '../utils/data'
import TypeBadge from '../components/TypeBadge'
import DescText from '../components/DescText'

const TAG_LABELS = {
  1: '应对',
  2: '特殊效果',
  3: '生命回复',
  4: '能量回复',
  5: '攻击',
  6: '增益',
  7: '减益',
  8: '印记',
  10: '异常',
  11: '防御',
  12: '状态',
  13: '强化双防',
  14: '削弱双防',
  15: '连击',
  16: '寄生',
  17: '负面',
  18: '永久强化',
  19: '脱离/返场',
  20: '星陨',
  22: '降低能耗',
  23: '蓄力',
  25: '天气',
}

export default function SkillQuery() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedEnergy, setSelectedEnergy] = useState([])
  const [typeIdMap, setTypeIdMap] = useState({})

  useEffect(() => {
    Promise.all([loadSkills(), loadTypeIdMap()]).then(([data, tim]) => {
      setSkills(data)
      setTypeIdMap(tim || {})
      setLoading(false)
    })
  }, [])

  // 构建 type 名 → ID 的映射，用于按游戏内顺序排列
  const typeOrder = useMemo(() => {
    const map = {}
    Object.entries(typeIdMap).forEach(([id, name]) => { map[name] = Number(id) })
    return map
  }, [typeIdMap])

  const allTypes = useMemo(() => {
    const set = new Set()
    skills.forEach(s => {
      if (s.skill_dam_type && typeOrder[s.skill_dam_type]) {
        set.add(s.skill_dam_type)
      }
    })
    return Array.from(set).sort((a, b) => (typeOrder[a] || 99) - (typeOrder[b] || 99))
  }, [skills, typeOrder])

  const allTags = useMemo(() => {
    const set = new Set()
    skills.forEach(s => {
      (s.describe_type || []).forEach(t => {
        if (t !== 0 && TAG_LABELS[t]) set.add(t)
      })
    })
    return Array.from(set).sort((a, b) => a - b)
  }, [skills])

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const toggleEnergy = (range) => {
    setSelectedEnergy(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    )
  }

  const ENERGY_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+']

  function getEnergyCost(skill) {
    const cost = skill.energy_cost?.find(v => v >= 0)
    return cost !== undefined ? cost : null
  }

  const filtered = useMemo(() => {
    return skills.filter(s => {
      const match = (s.name || '').toLowerCase().includes(query.toLowerCase())
        || (s.desc || '').toLowerCase().includes(query.toLowerCase())
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(s.skill_dam_type)
      const tagMatch = selectedTags.length === 0 || selectedTags.every(tag => (s.describe_type || []).includes(tag))
      const cost = getEnergyCost(s)
      const matchEnergy = selectedEnergy.length === 0 || selectedEnergy.some(range => {
        if (cost === null) return false
        if (range === '10+') return cost > 10
        return cost === range
      })
      return match && matchType && tagMatch && matchEnergy
    })
  }, [skills, query, selectedTypes, selectedTags, selectedEnergy])

  const base = import.meta.env.BASE_URL
  function iconUrl(skill) {
    if (!skill.icon) return null
    const name = skill.icon.split('/').pop()?.split('.')[0]
    return name ? `${base}icons/skills/${name}.png` : null
  }

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">技能查询</h1>
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索技能名称或描述"
            className="w-full pl-10 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">属性：</span>
          {allTypes.map(type => {
            const active = selectedTypes.includes(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-sm transition ${active ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50'}`}
                title={type}
              >
                <TypeBadge type={type} size={16} />
                <span>{type}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">标签：</span>
          {allTags.map(tag => {
            const active = selectedTags.includes(tag)
            const label = TAG_LABELS[tag] || String(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 rounded-lg border text-sm transition ${active ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white hover:bg-gray-50'}`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">费用：</span>
          {ENERGY_OPTIONS.map(range => {
            const active = selectedEnergy.includes(range)
            const label = range === '10+' ? '10+' : `${range}`
            return (
              <button
                key={range}
                onClick={() => toggleEnergy(range)}
                className={`px-2 py-1 rounded-lg border text-sm transition ${active ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50'}`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {(selectedTypes.length > 0 || selectedTags.length > 0 || selectedEnergy.length > 0) && (
          <button
            onClick={() => {
              setSelectedTypes([])
              setSelectedTags([])
              setSelectedEnergy([])
            }}
            className="text-sm text-gray-500 hover:text-gray-700 self-start"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-2">共 {filtered.length} 个技能</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(s => (
          <Link
            key={s.id}
            to={`/skills/${s.id}`}
            className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-blue-200 transition-all block"
          >
            <div className="flex items-center gap-3 mb-2">
              {iconUrl(s) && (
                <img
                  src={iconUrl(s)}
                  alt={s.name}
                  className="w-10 h-10 object-contain bg-gray-50 rounded"
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{s.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <TypeBadge type={s.skill_dam_type} size={16} />
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-2 line-clamp-2"><DescText text={s.desc} /></div>
            <div className="flex flex-wrap gap-2 text-xs">
              {['物攻', '魔攻'].includes(s.damage_type) && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">{s.damage_type}</span>
              )}
              {s.skill_type && s.skill_type !== '攻击' && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">{s.skill_type}</span>
              )}
              {s.dam_para && s.dam_para.some(v => v > 0) && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">威力 {s.dam_para.find(v => v > 0) || 0}</span>
              )}
              {s.energy_cost && s.energy_cost.some(v => v >= 0) && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">能耗 {s.energy_cost.find(v => v >= 0) ?? 0}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
