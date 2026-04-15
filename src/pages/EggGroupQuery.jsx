import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loadPets } from '../utils/data'
import TypeBadge from '../components/TypeBadge'

export default function EggGroupQuery() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const currentGroup = searchParams.get('group') || ''

  useEffect(() => {
    loadPets().then(data => {
      setPets(data)
      setLoading(false)
    })
  }, [])

  const groupMap = useMemo(() => {
    const map = {}
    pets.forEach(p => {
      p.egg_groups?.forEach(g => {
        if (g.name) {
          map[g.name] = g.desc || ''
        }
      })
    })
    return map
  }, [pets])

  const allGroups = useMemo(() => Object.keys(groupMap).sort(), [groupMap])

  const filtered = useMemo(() => {
    if (!currentGroup) return []
    const list = pets.filter(p =>
      p.egg_groups?.some(g => g.name === currentGroup)
    )
    list.sort((a, b) => {
      const aSingle = a.egg_groups?.length === 1 ? 0 : 1
      const bSingle = b.egg_groups?.length === 1 ? 0 : 1
      if (aSingle !== bSingle) return aSingle - bSingle
      return (a.pictorial_book_id || 0) - (b.pictorial_book_id || 0)
    })
    return list
  }, [pets, currentGroup])

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">蛋组查询</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {allGroups.map(g => (
          <button
            key={g}
            onClick={() => setSearchParams({ group: g })}
            className={`px-3 py-1.5 rounded-lg border text-sm transition ${currentGroup === g ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white hover:bg-gray-50'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {currentGroup && (
        <>
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">
              蛋组 <span className="font-medium text-gray-800">{currentGroup}</span> 下共 {filtered.length} 只精灵
            </div>
            {groupMap[currentGroup] && (
              <div className="text-xs text-gray-400">{groupMap[currentGroup]}</div>
            )}
          </div>

          {(() => {
            const single = filtered.filter(p => p.egg_groups?.length === 1)
            const double = filtered.filter(p => p.egg_groups?.length > 1)
            const renderCard = (pet) => {
              const isSingle = pet.egg_groups?.length === 1
              const otherGroups = pet.egg_groups?.filter(g => g.name !== currentGroup) || []
              return (
                <Link
                  key={pet.id}
                  to={`/pets/${pet.id}`}
                  className="bg-white rounded-xl border p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-center mb-3">
                    <img
                      src={`/icons/pets1024/${pet.JL_res?.split('/').pop()?.split('.')[0]}.png`}
                      alt={pet.name}
                      className="w-16 h-16 object-contain"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mb-1 text-center">#{pet.pictorial_book_id}</div>
                  <div className="font-semibold text-gray-900 mb-2 truncate text-center">{pet.name}</div>
                  <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {(pet.types || []).map(t => <TypeBadge key={t} type={t} size={16} />)}
                  </div>
                  <div className="text-xs text-center">
                    {isSingle ? (
                      <span className="text-gray-400">单蛋组</span>
                    ) : (
                      <span className="text-gray-500">
                        双蛋组 /
                        {otherGroups.map((g, idx) => (
                          <span key={g.name}>
                            <Link
                              to={`/egg-groups?group=${encodeURIComponent(g.name)}`}
                              className="text-blue-600 hover:underline ml-1"
                              onClick={e => e.stopPropagation()}
                            >
                              {g.name}
                            </Link>
                            {idx < otherGroups.length - 1 && <span className="text-gray-300">、</span>}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </Link>
              )
            }
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {single.map(renderCard)}
                {single.length > 0 && double.length > 0 && (
                  <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 py-2">
                    <div className="border-t"></div>
                  </div>
                )}
                {double.map(renderCard)}
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
