import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { loadPets } from '../utils/data'
import { petIconUrl } from '../utils/icons'
import TypeBadge from '../components/TypeBadge'

export default function PetPedia() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')

  useEffect(() => {
    loadPets().then(data => {
      const sorted = [...data].sort((a, b) => (a.pictorial_book_id || 0) - (b.pictorial_book_id || 0))
      setPets(sorted)
      setLoading(false)
    })
  }, [])

  const allTypes = useMemo(() => {
    const set = new Set()
    pets.forEach(p => p.types?.forEach(t => { if (t) set.add(t) }))
    return ['全部', ...Array.from(set).sort()]
  }, [pets])

  const filtered = useMemo(() => {
    return pets.filter(p => {
      const matchName = (p.name || '').toLowerCase().includes(query.toLowerCase())
        || (p.description || '').toLowerCase().includes(query.toLowerCase())
      const matchType = typeFilter === '全部' || (p.types || []).includes(typeFilter)
      return matchName && matchType
    })
  }, [pets, query, typeFilter])

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">精灵图鉴</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索精灵名称或描述"
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

      <div className="text-sm text-gray-500 mb-2">共 {filtered.length} 只精灵</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(pet => (
          <Link
            key={pet.id}
            to={`/pets/${pet.id}`}
            className="bg-white rounded-xl border p-4 hover:shadow-md transition"
          >
            <div className="flex justify-center mb-3">
              <img
                src={petIconUrl(pet.JL_res)}
                alt={pet.name}
                className="w-20 h-20 object-contain"
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
            <div className="text-xs text-gray-400 mb-1 text-center">#{pet.pictorial_book_id}</div>
            <div className="font-semibold text-gray-900 mb-2 truncate text-center">{pet.name}</div>
            <div className="flex flex-wrap justify-center gap-1">
              {(pet.types || []).map(t => <TypeBadge key={t} type={t} size={18} />)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
