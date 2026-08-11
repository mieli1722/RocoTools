import { useEffect, useState, useMemo } from 'react'
import { loadActivities } from '../utils/data'
import { Calendar, Clock, Play, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

// 解析时间字符串为Date对象
function parseTime(timeStr) {
  if (!timeStr) return null
  return new Date(timeStr.replace(' ', 'T'))
}

// 格式化时间显示
function formatTime(date) {
  if (!date) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// 计算剩余时间
function getTimeRemaining(endDate) {
  const now = new Date()
  const diff = endDate - now
  if (diff <= 0) return null
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

// 计算距离开始时间
function getTimeUntilStart(startDate) {
  const now = new Date()
  const diff = startDate - now
  if (diff <= 0) return null
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}天后开始`
  if (hours > 0) return `${hours}小时后开始`
  return '即将开始'
}

// 活动状态：ongoing-进行中, upcoming-即将开始, ended-已结束
function getActivityStatus(activity, now) {
  const start = parseTime(activity.appear_time)
  const end = parseTime(activity.disappear_time)
  
  if (!start || !end) return 'unknown'
  if (now >= start && now <= end) return 'ongoing'
  if (now < start) return 'upcoming'
  return 'ended'
}

// 清理HTML标签，提取纯文本描述
function cleanDescription(txt) {
  if (!txt) return ''
  // 移除HTML标签但保留文本内容
  return txt
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}


function ActivityCard({ activity, status, expanded, onToggle }) {
  const start = parseTime(activity.appear_time)
  const end = parseTime(activity.disappear_time)  
  const statusConfig = {
    ongoing: { label: '进行中', color: 'bg-green-100 text-green-700 border-green-200', icon: Play },
    upcoming: { label: '即将开始', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    ended: { label: '已结束', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: AlertCircle },
    unknown: { label: '未知', color: 'bg-gray-100 text-gray-400 border-gray-200', icon: AlertCircle },
  }
  
  const config = statusConfig[status] || statusConfig.unknown
  const StatusIcon = config.icon
  
  return (
    <div className={`bg-white rounded-xl border p-4 transition hover:shadow-md ${status === 'ended' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-lg">{activity.activity_name || '未命名活动'}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
              <StatusIcon size={12} />
              {config.label}
            </span>
          </div>
          
          {activity.prompt_text && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{activity.prompt_text}</p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatTime(start)} ~ {formatTime(end)}
            </span>
            {status === 'ongoing' && end && (
              <span className="text-green-600 font-medium">
                剩余: {getTimeRemaining(end)}
              </span>
            )}
            {status === 'upcoming' && start && (
              <span className="text-blue-600 font-medium">
                {getTimeUntilStart(start)}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-400"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {expanded && activity.activity_txt && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">活动详情</h4>
          <div className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-3">
            {cleanDescription(activity.activity_txt)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ActivitySchedule() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, ongoing, upcoming, ended
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [searchKeyword, setSearchKeyword] = useState('')
  
  useEffect(() => {
    loadActivities().then(data => {
      setActivities(data)
      setLoading(false)
    })
  }, [])
  
  const now = useMemo(() => new Date(), [])
  
  // 处理活动数据，添加状态
  const processedActivities = useMemo(() => {
    return activities.map(activity => ({
      ...activity,
      status: getActivityStatus(activity, now),
      startTime: parseTime(activity.appear_time),
      endTime: parseTime(activity.disappear_time),
    }))
  }, [activities, now])
  
  // 过滤和排序
  const filteredActivities = useMemo(() => {
    let result = processedActivities
    
    // 状态过滤
    if (filter !== 'all') {
      result = result.filter(a => a.status === filter)
    }
    
    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(a => 
        (a.activity_name || '').toLowerCase().includes(keyword) ||
        (a.prompt_text || '').toLowerCase().includes(keyword)
      )
    }
    
    // 排序：进行中 > 即将开始 > 已结束，同状态按开始时间排序
    const statusOrder = { ongoing: 0, upcoming: 1, ended: 2, unknown: 3 }
    result.sort((a, b) => {
      const orderDiff = statusOrder[a.status] - statusOrder[b.status]
      if (orderDiff !== 0) return orderDiff
      
      // 进行中的按结束时间升序（快结束的在前）
      if (a.status === 'ongoing') {
        return (a.endTime || 0) - (b.endTime || 0)
      }
      // 即将开始的按开始时间升序（快开始的在前）
      if (a.status === 'upcoming') {
        return (a.startTime || 0) - (b.startTime || 0)
      }
      // 已结束的按结束时间降序（最近结束的在前）
      return (b.endTime || 0) - (a.endTime || 0)
    })
    
    return result
  }, [processedActivities, filter, searchKeyword])
  
  // 统计各状态数量
  const stats = useMemo(() => {
    const s = { ongoing: 0, upcoming: 0, ended: 0 }
    processedActivities.forEach(a => {
      if (s[a.status] !== undefined) s[a.status]++
    })
    return s
  }, [processedActivities])
  
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  
  if (loading) {
    return <div className="p-10 text-center text-gray-500">加载中...</div>
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">活动时间表</h1>
        <p className="text-gray-600">查看当前进行中的活动以及即将开始的活动</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setFilter('ongoing')}
          className={`p-4 rounded-xl border-2 transition text-left ${filter === 'ongoing' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
        >
          <div className="text-2xl font-bold text-green-600">{stats.ongoing}</div>
          <div className="text-sm text-gray-600">进行中</div>
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`p-4 rounded-xl border-2 transition text-left ${filter === 'upcoming' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-sm text-gray-600">即将开始</div>
        </button>
        <button
          onClick={() => setFilter('ended')}
          className={`p-4 rounded-xl border-2 transition text-left ${filter === 'ended' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-gray-500">{stats.ended}</div>
          <div className="text-sm text-gray-600">已结束</div>
        </button>
      </div>
      
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="搜索活动名称或描述..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">全部活动</option>
          <option value="ongoing">仅进行中</option>
          <option value="upcoming">仅即将开始</option>
          <option value="ended">仅已结束</option>
        </select>
      </div>
      
      {/* 活动列表 */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            没有找到匹配的活动
          </div>
        ) : (
          filteredActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              status={activity.status}
              expanded={expandedIds.has(activity.id)}
              onToggle={() => toggleExpand(activity.id)}
            />
          ))
        )}
      </div>
      
      {/* 当前时间提示 */}
      <div className="mt-6 text-center text-sm text-gray-400">
        当前时间: {formatTime(now)}
      </div>
    </div>
  )
}
