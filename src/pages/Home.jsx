import { Link } from 'react-router-dom'
import { BookOpen, Zap, Sword, Smile, Egg, Search, Calendar } from 'lucide-react'

const CARDS = [
  { to: '/pets', title: '精灵图鉴', desc: '浏览全部图鉴精灵、种族值、进化链与技能', icon: BookOpen, color: 'bg-green-500' },
  { to: '/types', title: '属性克制', desc: '查询属性之间的攻击与防御克制关系', icon: Zap, color: 'bg-yellow-500' },
  { to: '/skills', title: '技能查询', desc: '搜索技能威力、效果、能耗与技能类型', icon: Sword, color: 'bg-red-500' },
  { to: '/natures', title: '性格查询', desc: '查看性格对六项能力值的加成与减成', icon: Smile, color: 'bg-pink-500' },
  { to: '/egg-groups', title: '蛋组查询', desc: '查询精灵蛋组信息', icon: Egg, color: 'bg-blue-500' },
  { to: '/egg-predictor', title: '神秘蛋推测', desc: '根据蛋的身高体重推测可能是什么精灵', icon: Search, color: 'bg-indigo-500' },
  { to: '/activities', title: '活动时间表', desc: '查看当前进行中的活动以及即将开始的活动', icon: Calendar, color: 'bg-orange-500' }
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">洛克王国世界工具箱</h1>
        <p className="text-gray-600">为训练师打造的实用数据查询站点</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ to, title, desc, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-white mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
