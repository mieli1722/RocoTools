import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loadSkills } from '../utils/data'
import TypeBadge from '../components/TypeBadge'
import DescText from '../components/DescText'

export default function SkillQuery() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])

  useEffect(() => {
    loadSkills().then(data => {
      setSkills(data)
      setLoading(false)
    })
  }, [])

  const allTypes = useMemo(() => {
    const set = new Set()
    skills.forEach(s => {
      if (s.skill_dam_type && !['无', '空', '岩（废弃！）'].includes(s.skill_dam_type)) {
        set.add(s.skill_dam_type)
      }
    })
    return Array.from(set).sort()
  }, [skills])

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const filtered = useMemo(() => {
    return skills.filter(s => {
      const match = (s.name || '').toLowerCase().includes(query.toLowerCase())
        || (s.desc || '').toLowerCase().includes(query.toLowerCase())
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(s.skill_dam_type)
      return match && matchType
    })
  }, [skills, query, selectedTypes])

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

        {selectedTypes.length > 0 && (
          <button
            onClick={() => setSelectedTypes([])}
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
