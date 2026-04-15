import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { loadPets, loadFeatures } from '../utils/data'
import { petIconUrl } from '../utils/icons'
import TypeBadge from '../components/TypeBadge'

const XUEMAI_ICON_MAP = {
  '草': 'img_cao.png', '虫': 'img_cong.png', '电': 'img_dian.png', '毒': 'img_du.png',
  '恶': 'img_emo.png', '光': 'img_guang.png', '幻': 'img_huan.png', '火': 'img_huo.png',
  '机械': 'img_jixie.png', '龙': 'img_long.png', '萌': 'img_meng.png', '普通': 'img_putong.png',
  '翼': 'img_yi.png', '冰': 'img_xue.png', '水': 'img_shui.png', '武': 'img_wu.png',
  '幽': 'img_youling.png', '地': 'img_shan.png',
};

const base = import.meta.env.BASE_URL;

function getForms(pet, petMap) {
  if (!pet) return []
  return Object.values(petMap).filter(
    p => p.id !== pet.id && p.name === pet.name && p.pictorial_book_id === pet.pictorial_book_id
  )
}

function buildEvolutionTree(rootId, petMap) {
  const pet = petMap[rootId]
  if (!pet) return null
  const nextIds = pet.evolution_pet_id || []
  const branches = nextIds
    .map(nextId => buildEvolutionTree(nextId, petMap))
    .filter(Boolean)

  // Add boss forms at the end if they exist and aren't already in branches
  const bossIds = pet.bosspetbase_id_arry || []
  const existingIds = new Set(nextIds)
  bossIds.forEach(bid => {
    if (!existingIds.has(bid)) {
      const b = buildEvolutionTree(bid, petMap)
      if (b) branches.push(b)
    }
  })

  return {
    id: pet.id,
    name: pet.name,
    stage: pet.stage || 1,
    form: pet.form,
    JL_res: pet.JL_res,
    branches,
  }
}

function NameLabel({ node }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-center leading-tight">
        {node.name}
      </div>
      {node.form && (
        <div className="text-[10px] text-gray-500 text-center leading-tight mt-0.5">
          {node.form}
        </div>
      )}
    </div>
  )
}

function EvolutionNode({ node, petId }) {
  const isCurrent = node.id === petId
  const branches = node.branches || []

  return (
    <div className="flex flex-col items-center">
      <Link
        to={`/pets/${node.id}`}
        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border min-w-[6rem] transition ${isCurrent ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
      >
        <img
          src={petIconUrl(node.JL_res)}
          alt={node.name}
          className="w-10 h-10 object-contain"
          onError={e => { e.target.style.display = 'none' }}
        />
        <NameLabel node={node} />
      </Link>

      {branches.length > 0 && (
        <div className="flex flex-col items-center w-full mt-0">
          <div className="h-3 w-px bg-gray-300"></div>
          <div className="flex w-full justify-center min-w-[8rem]">
            {branches.map((child, idx) => {
              const isFirst = idx === 0
              const isLast = idx === branches.length - 1
              return (
                <div key={child.id} className="flex-1 flex flex-col items-center relative min-w-[5rem] px-1">
                  {branches.length > 1 && (
                    <div
                      className="absolute top-0 h-px bg-gray-300"
                      style={{
                        left: isFirst ? '50%' : '0%',
                        right: isLast ? '50%' : '0%',
                      }}
                    />
                  )}
                  <div className="h-3 w-px bg-gray-300"></div>
                  <EvolutionNode node={child} petId={petId} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PetDetail() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [feature, setFeature] = useState(null)
  const [petMap, setPetMap] = useState({})
  const [evoTrees, setEvoTrees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadPets(), loadFeatures()]).then(([pets, features]) => {
      const map = Object.fromEntries(pets.map(p => [p.id, p]))
      setPetMap(map)
      const found = map[Number(id)]
      setPet(found || null)
      if (found) {
        if (found.pet_feature) {
          const f = features.find(x => x.id === found.pet_feature)
          setFeature(f || null)
        }
        // Find all related pets and build evolution trees for each stage-1 root
        const parentMap = {}
        Object.values(map).forEach(p => {
          const nextIds = [...(p.evolution_pet_id || []), ...(p.bosspetbase_id_arry || [])]
          nextIds.forEach(nextId => {
            if (!parentMap[nextId]) parentMap[nextId] = []
            parentMap[nextId].push(p.id)
          })
        })
        function findAncestors(petId, visited = new Set()) {
          if (visited.has(petId)) return []
          visited.add(petId)
          const parents = parentMap[petId] || []
          if (parents.length === 0) return [petId]
          return Array.from(new Set(parents.flatMap(pid => findAncestors(pid, visited))))
        }
        const reachableRoots = findAncestors(found.id)
        const allRelatedRoots = []
        reachableRoots.forEach(rid => {
          const r = map[rid]
          if (!r) return
          const related = Object.values(map).filter(
            p => p.name === r.name && p.pictorial_book_id === r.pictorial_book_id && p.stage === 1
          )
          related.forEach(x => allRelatedRoots.push(x))
        })
        const uniqueRoots = Array.from(new Map(allRelatedRoots.map(r => [r.id, r])).values())
        const trees = uniqueRoots.map(r => buildEvolutionTree(r.id, map)).filter(Boolean)
        setEvoTrees(trees)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>
  if (!pet) return <div className="p-10 text-center text-gray-500">未找到该宠物</div>

  const stats = [
    { label: '生命', value: pet.hp_max_race },
    { label: '物攻', value: pet.phy_attack_race },
    { label: '魔攻', value: pet.spe_attack_race },
    { label: '物防', value: pet.phy_defence_race },
    { label: '魔防', value: pet.spe_defence_race },
    { label: '速度', value: pet.speed_race },
  ]
  const totalRace = stats.reduce((sum, s) => sum + (s.value || 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link to="/pets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={16} /> 返回图鉴
      </Link>

      <div className="bg-white rounded-xl border p-5 mb-4">
        <div className="flex items-start gap-4">
          <img
            src={petIconUrl(pet.JL_res)}
            alt={pet.name}
            className="w-24 h-24 object-contain bg-gray-50 rounded-lg"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-400">#{pet.pictorial_book_id}</div>
                <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
                {pet.form && <div className="text-sm text-gray-500 mt-0.5">{pet.form}</div>}
              </div>
              <div className="flex gap-1">
                {(pet.types || []).map(t => <TypeBadge key={t} type={t} size={24} />)}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">{pet.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">种族值</h2>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                <div className="text-lg font-semibold text-gray-800">{s.value}</div>
              </div>
            ))}
            <div className="bg-blue-50 rounded-lg p-3 text-center col-span-3">
              <div className="text-xs text-blue-500 mb-1">总和</div>
              <div className="text-xl font-bold text-blue-700">{totalRace}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">基础信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">分类</span><span>{pet.pet_classis_name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">阶段</span><span>第 {pet.stage} 阶段</span></div>
            <div className="flex justify-between"><span className="text-gray-500">身高</span><span>{(pet.height_low / 100).toFixed(2)}-{(pet.height_high / 100).toFixed(2)} m</span></div>
            <div className="flex justify-between"><span className="text-gray-500">体重</span><span>{(pet.weight_low / 1000).toFixed(2)}-{(pet.weight_high / 1000).toFixed(2)} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">性别比例</span><span>{pet.proportion_male}</span></div>
            {pet.egg_groups && pet.egg_groups.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">蛋组</span>
                <div className="text-right">
                  {pet.egg_groups.map((g, idx) => (
                    <span key={idx} className="inline-flex items-center">
                      <Link
                        to={`/egg-groups?group=${encodeURIComponent(g.name)}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {g.name}
                      </Link>
                      {idx < pet.egg_groups.length - 1 && <span className="mx-1 text-gray-300">/</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pet.have_shiny && <div className="flex justify-between"><span className="text-gray-500">闪光</span><span className="text-yellow-600">有</span></div>}
            {pet.can_swim && <div className="flex justify-between"><span className="text-gray-500">游泳</span><span>会游泳</span></div>}
          </div>
        </div>
      </div>

      {evoTrees.length > 0 && (
        <div className="bg-white rounded-xl border p-5 mb-4 overflow-x-auto">
          <h2 className="font-semibold mb-4">进化链</h2>
          <div className="flex justify-center gap-8 min-w-max">
            {evoTrees.map(tree => (
              <EvolutionNode key={tree.id} node={tree} petId={pet.id} />
            ))}
          </div>
        </div>
      )}

      {feature && (
        <div className="bg-white rounded-xl border p-5 mb-4">
          <h2 className="font-semibold mb-3">特性</h2>
          <div className="flex items-center gap-3">
            {feature.icon && (
              <img
                src={`${base}icons/features/${feature.icon.split('/').pop().split('.')[0]}.png`}
                alt={feature.name}
                className="w-12 h-12 object-contain bg-gray-50 rounded"
                onError={e => { e.target.style.display = 'none' }}
              />
            )}
            <div>
              <div className="font-semibold text-gray-900">{feature.name}</div>
              {feature.desc && <div className="text-sm text-gray-500 line-clamp-2">{feature.desc}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-5 mb-4">
        <h2 className="font-semibold mb-3">升级技能</h2>
        {pet.level_skills?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {pet.level_skills.map(s => (
              <div key={`${s.skill_id}-${s.level}`} className="bg-gray-50 rounded px-3 py-2 text-sm">
                <span className="text-gray-400 text-xs mr-2">Lv.{s.level}</span>
                <span className="font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-gray-400">暂无数据</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">血脉技能</h2>
          {pet.blood_skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pet.blood_skills.map(s => (
                <div key={s.skill_id} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2" title={s.type}>
                  {XUEMAI_ICON_MAP[s.type] && (
                    <img
                      src={`${base}icons/xuemai/${XUEMAI_ICON_MAP[s.type]}`}
                      alt={s.type}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  )}
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
              ))}
            </div>
          ) : <div className="text-sm text-gray-400">暂无数据</div>}
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">技能石技能</h2>
          {pet.machine_skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pet.machine_skills.map(s => (
                <span key={s.skill_id} className="bg-gray-50 rounded px-2 py-1 text-sm">{s.name}</span>
              ))}
            </div>
          ) : <div className="text-sm text-gray-400">暂无数据</div>}
        </div>
      </div>
    </div>
  )
}
