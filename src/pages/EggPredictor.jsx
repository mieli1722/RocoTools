import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Ruler, Scale, Clock } from 'lucide-react'
import { loadEggConf } from '../utils/data'
import { petIconUrl } from '../utils/icons'
import TypeBadge from '../components/TypeBadge'

export default function EggPredictor() {
  const [eggs, setEggs] = useState([])
  const [loading, setLoading] = useState(true)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    loadEggConf().then(data => {
      setEggs(data)
      setLoading(false)
    })
  }, [])

  const matched = useMemo(() => {
    if (!searched) return []
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const hasH = !isNaN(h)
    const hasW = !isNaN(w)

    if (!hasH && !hasW) return []

    const hCm = hasH ? Math.round(h * 100) : null
    const wG = hasW ? Math.round(w * 1000) : null

    const list = eggs.filter(egg => {
      if (hasH) {
        const hl = egg.height_low ?? 0
        const hh = egg.height_high ?? 0
        if (hCm < hl || hCm > hh) return false
      }
      if (hasW) {
        const wl = egg.weight_low ?? 0
        const wh = egg.weight_high ?? 0
        if (wG < wl || wG > wh) return false
      }
      return true
    })

    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'))

    return list
  }, [eggs, height, weight, searched])

  const handleSearch = () => setSearched(true)
  const handleClear = () => {
    setHeight('')
    setWeight('')
    setSearched(false)
  }

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">蛋身高体重推测</h1>
      <p className="text-sm text-gray-500 mb-4">
        输入精灵蛋的身高和体重，推测可能是哪种精灵。
      </p>

      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Ruler size={14} className="inline mr-1" />
              身高（m）
            </label>
            <input
              type="number"
              step="0.01"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="例如 0.23"
              className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Scale size={14} className="inline mr-1" />
              体重（kg）
            </label>
            <input
              type="number"
              step="0.001"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="例如 1.267"
              className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex-1 sm:flex-none"
            >
              <Search size={16} />
              推测
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition flex-1 sm:flex-none"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      {searched && (
        <>
          <div className="text-sm text-gray-500 mb-3">
            共找到 <span className="font-medium text-gray-800">{matched.length}</span> 种可能的精灵蛋
          </div>

          {matched.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              没有匹配的精灵蛋，请检查输入的数值是否合理
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {matched.map(egg => {
                const pet = egg.pet
                let hatchLabel = null
                if (egg.hatch_data != null) {
                  if (egg.hatch_data === 300) {
                    hatchLabel = '5分钟'
                  } else {
                    const hours = egg.hatch_data / 3600
                    hatchLabel = (hours % 1 === 0 ? parseInt(hours) : hours.toFixed(1)) + ' 小时'
                  }
                }
                return (
                  <Link key={egg.id} to={`/pets/${pet.id}`} className="block">
                    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition h-full flex flex-col">
                      <div className="flex justify-center mb-3">
                        <img
                          src={petIconUrl(pet.JL_res)}
                          alt={pet.name || egg.name}
                          className="w-16 h-16 object-contain"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mb-1 text-center">
                        #{pet.pictorial_book_id}
                      </div>
                      <div className="font-semibold text-gray-900 mb-2 truncate text-center">
                        {egg.name}
                      </div>
                      {pet.types && pet.types.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {pet.types.map(t => t && <TypeBadge key={t} type={t} size={16} />)}
                        </div>
                      )}
                      <div className="mt-auto pt-2 border-t text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>身高</span>
                          <span>
                            {(egg.height_low / 100).toFixed(2)}m ~ {(egg.height_high / 100).toFixed(2)}m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>体重</span>
                          <span>
                            {(egg.weight_low / 1000).toFixed(3)}kg ~ {(egg.weight_high / 1000).toFixed(3)}kg
                          </span>
                        </div>
                        {hatchLabel != null && (
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-0.5">
                              <Clock size={12} />
                              孵化
                            </span>
                            <span className="text-blue-600 font-medium">{hatchLabel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}


