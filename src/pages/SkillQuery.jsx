import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { loadSkills } from '../utils/data'
import TypeBadge from '../components/TypeBadge'

export default function SkillQuery() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')

  useEffect(() => {
    loadSkills().then(data => {
      setSkills(data)
      setLoading(false)
    })
  }, [])

  const allTypes = useMemo(() => {
    const set = new Set()
    skills.forEach(s => { if (s.skill_dam_type) set.add(s.skill_dam_type) })
    return ['全部', ...Array.from(set).sort()]
  }, [skills])

  const filtered = useMemo(() => {
    return skills.filter(s => {
      const match = (s.name || '').toLowerCase().includes(query.toLowerCase())
        || (s.desc || '').toLowerCase().includes(query.toLowerCase())
      const matchType = typeFilter === '全部' || s.skill_dam_type === typeFilter
      return match && matchType
    })
  }, [skills, query, typeFilter])

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
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索技能名称或描述"
            className="w-full pl-10 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="text-sm text-gray-500 mb-2">共 {filtered.length} 个技能</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl border p-4">
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
            <div className="text-xs text-gray-500 mb-2 line-clamp-2">{s.desc}</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {s.damage_type && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">{s.damage_type}</span>
              )}
              {s.skill_type && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">{s.skill_type}</span>
              )}
              {s.dam_para && s.dam_para.some(v => v > 0) && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">威力 {s.dam_para.find(v => v > 0) || 0}</span>
              )}
              {s.energy_cost && s.energy_cost.some(v => v > 0) && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">能耗 {s.energy_cost.find(v => v > 0) || 0}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
