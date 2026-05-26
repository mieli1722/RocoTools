import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { loadDescNotes } from '../utils/data'

// 解析文本中的 <desc_id=XXXX>文字</> 标签
const DESC_RE = /<desc_id=(\d+)>(.*?)<\/>/g

function parseDescText(text) {
  if (!text) return []
  const segments = []
  let lastIndex = 0
  let match

  while ((match = DESC_RE.exec(text)) !== null) {
    // 前面的纯文本
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    // desc_id 标签
    segments.push({ type: 'desc', id: parseInt(match[1]), text: match[2] })
    lastIndex = match.index + match[0].length
  }

  // 剩余文本
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }]
}

// 弹窗组件
function DescDialog({ descId, descText, noteMap, onClose, onNavigate }) {
  const entry = noteMap[descId]
  if (!entry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">提示</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <p className="text-gray-600 text-sm">{descText}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{entry.note}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <InlineDescText text={entry.desc} noteMap={noteMap} onNavigate={onNavigate} className="text-sm text-gray-600 leading-relaxed" />
          {/* 递归解析 desc 中的 desc_id 引用 */}
          <NestedDescRefs desc={entry.desc} noteMap={noteMap} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  )
}

// 展示 desc 中引用的其他 desc_id 条目（非内联的）
function NestedDescRefs({ desc, noteMap, onNavigate }) {
  if (!desc) return null

  // 找出所有 desc_id 引用
  const refs = []
  let match
  const re = new RegExp(DESC_RE)
  while ((match = re.exec(desc)) !== null) {
    const id = parseInt(match[1])
    // 避免重复
    if (!refs.find(r => r.id === id)) {
      refs.push({ id, text: match[2] })
    }
  }

  if (refs.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      {refs.map(ref => {
        const entry = noteMap[ref.id]
        if (!entry) return null
        return (
          <div key={ref.id}>
            <button
              onClick={() => onNavigate(ref.id, ref.text)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              {entry.note}
            </button>
            <p className="text-xs text-gray-500 mt-0.5">{stripDescTags(entry.desc)}</p>
          </div>
        )
      })}
    </div>
  )
}

// 去除 desc_id 标签，只保留纯文本
function stripDescTags(text) {
  if (!text) return ''
  return text.replace(DESC_RE, '$2')
}

// 内联渲染 DescText（用于弹窗内的递归展示）
function InlineDescText({ text, noteMap, onNavigate, className = '' }) {
  const segments = parseDescText(text)
  if (!text) return null

  return (
    <p className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'desc') {
          const entry = noteMap[seg.id]
          return (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onNavigate(seg.id, seg.text) }}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
              title={entry ? `${entry.note}: ${stripDescTags(entry.desc)}` : ''}
            >
              {seg.text}
            </button>
          )
        }
        return <span key={i}>{seg.content}</span>
      })}
    </p>
  )
}

// 主组件
export default function DescText({ text, className = '' }) {
  const [noteMap, setNoteMap] = useState(null)
  const [dialog, setDialog] = useState(null) // { descId, descText }
  const [dialogStack, setDialogStack] = useState([]) // 支持多层弹窗导航

  useEffect(() => {
    loadDescNotes().then(data => {
      const map = Object.fromEntries(data.map(e => [e.id, e]))
      setNoteMap(map)
    })
  }, [])

  const openDialog = useCallback((descId, descText) => {
    setDialogStack(prev => [...prev, { descId, descText }])
    setDialog({ descId, descText })
  }, [])

  const closeDialog = useCallback(() => {
    setDialogStack(prev => {
      const next = prev.slice(0, -1)
      if (next.length > 0) {
        setDialog(next[next.length - 1])
      } else {
        setDialog(null)
      }
      return next
    })
  }, [])

  const segments = parseDescText(text)
  if (!text) return null

  return (
    <>
      <span className={className}>
        {segments.map((seg, i) => {
          if (seg.type === 'desc') {
            return (
              <span
                key={i}
                onClick={() => openDialog(seg.id, seg.text)}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                title={noteMap?.[seg.id] ? `${noteMap[seg.id].note}: ${stripDescTags(noteMap[seg.id].desc)}` : ''}
              >
                {seg.text}
              </span>
            )
          }
          return <span key={i}>{seg.content}</span>
        })}
      </span>

      {dialog && noteMap && (
        <DescDialog
          descId={dialog.descId}
          descText={dialog.descText}
          noteMap={noteMap}
          onClose={closeDialog}
          onNavigate={openDialog}
        />
      )}
    </>
  )
}
