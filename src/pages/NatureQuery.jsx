import { useEffect, useState } from 'react'
import { loadNatures } from '../utils/data'

export default function NatureQuery() {
  const [natures, setNatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNatures().then(data => {
      setNatures(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>

  const posAttrs = ['生命', '物攻', '魔攻', '物防', '魔防', '速度']
  const negAttrs = ['生命', '物攻', '魔攻', '物防', '魔防', '速度']

  const matrix = {}
  posAttrs.forEach(pos => {
    matrix[pos] = {}
    negAttrs.forEach(neg => {
      matrix[pos][neg] = null
    })
  })

  natures.forEach(n => {
    if (n.positive_attr && n.negative_attr) {
      matrix[n.positive_attr][n.negative_attr] = n.name
    }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">性格查询</h1>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 border-b border-r">减成 \\ 加成</th>
              {posAttrs.map(pos => (
                <th key={pos} className="px-3 py-3 font-medium text-red-600 border-b">
                  {pos}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {negAttrs.map(neg => (
              <tr key={neg} className="hover:bg-gray-50">
                <td className="px-3 py-3 font-medium text-green-600 border-r bg-gray-50">
                  {neg}
                </td>
                {posAttrs.map(pos => {
                  const name = matrix[pos][neg]
                  const isSame = pos === neg
                  return (
                    <td key={pos} className={`px-3 py-3 ${isSame ? 'bg-gray-100' : ''}`}>
                      {isSame ? (
                        <span className="text-gray-300">—</span>
                      ) : name ? (
                        <span className="font-medium text-gray-800">{name}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
