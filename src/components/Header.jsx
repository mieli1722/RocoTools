import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Zap, Sword, Smile, Egg, Search, Calendar } from 'lucide-react';

const NAV = [
  { to: '/', label: '首页', icon: Home },
  { to: '/pets', label: '精灵图鉴', icon: BookOpen },
  { to: '/types', label: '属性克制', icon: Zap },
  { to: '/skills', label: '技能查询', icon: Sword },
  { to: '/natures', label: '性格查询', icon: Smile },
  { to: '/egg-groups', label: '蛋组查询', icon: Egg },
  { to: '/egg-predictor', label: '蛋推测', icon: Search },
  { to: '/activities', label: '活动时间表', icon: Calendar },
];

export default function Header() {
  const { pathname } = useLocation();
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-lg text-blue-600">洛克王国世界工具箱</Link>
          <nav className="flex gap-1 sm:gap-4">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
