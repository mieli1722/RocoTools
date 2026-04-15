import { useEffect, useMemo, useState } from 'react'
import { loadTypeRelations } from '../utils/data'
import TypeBadge from '../components/TypeBadge'

export default function TypeCalc() {
  const [relations, setRelations] = useState(null)
  const [types, setTypes] = useState([])
  const [selected, setSelected] = useState([''])

  useEffect(() => {
    loadTypeRelations().then(data => {
      setRelations(data)
      setTypes(Object.keys(data.attack).filter(t => t && t !== 'Nonicon'))
    })
  }, [])

  const activeTypes = selected.filter(t => t)

  const attackResult = useMemo(() => {
    if (!relations || activeTypes.length === 0) return {}
    const result = {}
    types.forEach(def => {
      let val = 0
      activeTypes.forEach(atk => {
        const r = relations.attack[atk]?.[def] || 0
        val += r
      })
      if (val !== 0) result[def] = val
    })
    return result
  }, [relations, activeTypes, types])

  const defenseResult = useMemo(() => {
    if (!relations || activeTypes.length === 0) return {}
    const result = {}
    types.forEach(atk => {
      let val = 0
      activeTypes.forEach(def => {
        const r = relations.defense[def]?.[atk] || 0
        val += r
      })
      if (val !== 0) result[atk] = val
    })
    return result
  }, [relations, activeTypes, types])

  if (!relations) return <div className="p-10 text-center text-gray-500">加载中...</div>

  const renderGroup = (label, data) => {
    const strong = Object.entries(data).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
    const weak = Object.entries(data).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1])
    return (
      <div className="bg-white rounded-xl border p-4">
        <h3 className="font-semibold mb-3">{label}</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-red-500 mb-1 font-medium">克制</div>
            {strong.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strong.map(([t, v]) => (
                  <div key={t} className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                    <TypeBadge type={t} size={18} />
                    {v > 1 && <span className="text-xs text-red-600 font-bold">x{v}</span>}
                  </div>
                ))}
              </div>
            ) : <span className="text-sm text-gray-400">无</span>}
          </div>
          <div>
            <div className="text-xs text-green-600 mb-1 font-medium">抵抗/微弱</div>
            {weak.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weak.map(([t, v]) => (
                  <div key={t} className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                    <TypeBadge type={t} size={18} />
                    {v < -1 && <span className="text-xs text-green-700 font-bold">x{Math.abs(v)}</span>}
                  </div>
                ))}
              </div>
            ) : <span className="text-sm text-gray-400">无</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">属性克制计算器</h1>
      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="text-sm text-gray-500 mb-2">选择属性（单属性或双属性）</div>
        <div className="flex flex-wrap gap-3 items-center">
          {selected.map((val, idx) => (
            <select
              key={idx}
              value={val}
              onChange={e => {
                const next = [...selected]
                next[idx] = e.target.value
                if (e.target.value && selected.length < 2) next.push('')
                setSelected(next.filter((v, i) => v || i === next.length - 1))
              }}
              className="px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ))}
          {activeTypes.length > 0 && (
            <div className="flex gap-1">
              {activeTypes.map(t => <TypeBadge key={t} type={t} size={24} />)}
            </div>
          )}
        </div>
      </div>

      {activeTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderGroup('攻击克制（我方攻击对方）', attackResult)}
          {renderGroup('防御克制（对方攻击我方）', defenseResult)}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">请选择至少一个属性进行查询</div>
      )}
    </div>
  )
}
