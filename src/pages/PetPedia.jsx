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
  const [selectedTypes, setSelectedTypes] = useState([])
  const [onlyShiny, setOnlyShiny] = useState(false)

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
    return Array.from(set).sort()
  }, [pets])

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const filtered = useMemo(() => {
    return pets.filter(p => {
      const matchName = (p.name || '').toLowerCase().includes(query.toLowerCase())
      const matchType = selectedTypes.length === 0 || (p.types || []).some(t => selectedTypes.includes(t))
      const matchShiny = !onlyShiny || !!p.have_shiny
      return matchName && matchType && matchShiny
    })
  }, [pets, query, selectedTypes, onlyShiny])

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">精灵图鉴</h1>
        <button
          onClick={() => setOnlyShiny(v => !v)}
          className={`px-3 py-1 rounded-lg border text-sm transition ${onlyShiny ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium' : 'bg-white hover:bg-gray-50'}`}
        >
          {onlyShiny ? '✦ 仅异色' : '仅异色'}
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索精灵名称"
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

        {(selectedTypes.length > 0 || onlyShiny) && (
          <button
            onClick={() => { setSelectedTypes([]); setOnlyShiny(false) }}
            className="text-sm text-gray-500 hover:text-gray-700 self-start"
          >
            清除筛选
          </button>
        )}
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
