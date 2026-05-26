import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import PetPedia from './pages/PetPedia'
import PetDetail from './pages/PetDetail'
import TypeCalc from './pages/TypeCalc'
import SkillQuery from './pages/SkillQuery'
import NatureQuery from './pages/NatureQuery'
import EggGroupQuery from './pages/EggGroupQuery'
import EggPredictor from './pages/EggPredictor'
import SkillDetail from './pages/SkillDetail'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<PetPedia />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/types" element={<TypeCalc />} />
          <Route path="/skills" element={<SkillQuery />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/natures" element={<NatureQuery />} />
          <Route path="/egg-groups" element={<EggGroupQuery />} />
          <Route path="/egg-predictor" element={<EggPredictor />} />
        </Routes>
      </main>
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        洛克王国世界工具箱 · 数据来源于游戏配置
      </footer>
    </div>
  )
}

export default App
