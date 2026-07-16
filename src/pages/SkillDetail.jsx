import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { loadSkills, loadPets } from '../utils/data'
import { petIconUrl } from '../utils/icons'
import TypeBadge from '../components/TypeBadge'
import DescText from '../components/DescText'

const base = import.meta.env.BASE_URL

function skillIconUrl(skill) {
  if (!skill || !skill.icon) return null
  const name = skill.icon.split('/').pop()?.split('.')[0]
  return name ? `${base}icons/skills/${name}.png` : null
}

export default function SkillDetail() {
  const { id } = useParams()
  const [skill, setSkill] = useState(null)
  const [petMap, setPetMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadSkills(), loadPets()]).then(([skills, pets]) => {
      const found = skills.find(s => String(s.id) === String(id))
      setSkill(found || null)
      setPetMap(Object.fromEntries(pets.map(p => [p.id, p])))
      setLoading(false)
    })
  }, [id])

  // 反向查找所有可以学习该技能的精
  const petSources = useMemo(() => {
    if (!skill) return []
    const sid = skill.id
    const results = []

    Object.values(petMap).forEach(pet => {
      // 升级技能
      const lvl = (pet.level_skills || []).find(s => s.skill_id === sid)
      if (lvl) {
        results.push({
          pet,
          source: '升级',
          level: lvl.level,
        })
        return
      }
      // 血脉技能
      const blood = (pet.blood_skills || []).find(s => s.skill_id === sid)
      if (blood) {
        results.push({
          pet,
          source: '血脉',
          level: blood.level,
        })
        return
      }
      // 技能石技能
      const machine = (pet.machine_skills || []).find(s => s.skill_id === sid)
      if (machine) {
        results.push({
          pet,
          source: '技能石',
          level: null,
        })
        return
      }
      // 传说技能
      const legendary = pet.legendary_skill
      if (legendary && legendary.skill_id === sid) {
        results.push({
          pet,
          source: '传说',
          level: null,
        })
      }
    })

    // 排序：编号小的在前
    results.sort((a, b) => (a.pet.pictorial_book_id || 0) - (b.pet.pictorial_book_id || 0))
    return results
  }, [skill, petMap])

  if (loading) return <div className="p-10 text-center text-gray-500">加载中...</div>
  if (!skill) return <div className="p-10 text-center text-gray-500">未找到该技能</div>

  const damageType = ['物攻', '魔攻'].includes(skill.damage_type) ? skill.damage_type : null
  const skillType = skill.skill_type && skill.skill_type !== '攻击' ? skill.skill_type : null
  const powerValues = (skill.dam_para || []).filter(v => v >= 0)
  const power = powerValues.length === 1 ? powerValues[0] : null
  const energyValues = (skill.energy_cost || []).filter(v => v >= 0)
  const energy = energyValues.length === 1 ? energyValues[0] : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link to="/skills" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={16} /> 返回技能查询
      </Link>

      {/* 技能基本信息卡片 */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <div className="flex items-start gap-4">
          <img
            src={skillIconUrl(skill)}
            alt={skill.name}
            className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">ID: {skill.id}</div>
                <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
              </div>
              <div className="flex gap-1">
                {skill.skill_dam_type && skill.skill_dam_type !== '无' && (
                  <TypeBadge type={skill.skill_dam_type} size={24} />
                )}
              </div>
            </div>
            {skill.desc && (
              <DescText text={skill.desc} className="text-gray-600 text-sm leading-relaxed mt-3 block" />
            )}
            {skill.flavor_text && (
              <p className="text-gray-400 text-xs italic mt-1">"{skill.flavor_text}"</p>
            )}
          </div>
        </div>
      </div>

      {/* 技能参数 */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <h2 className="font-semibold mb-3">技能参数</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {power != null ? (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">威力</div>
              <div className="text-lg font-semibold text-gray-800">{power}</div>
            </div>
          ) : powerValues.length > 1 ? (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">威力</div>
              <div className="text-sm font-semibold text-gray-800">{powerValues.join(', ')}</div>
            </div>
          ) : null}
          {energy != null ? (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">能耗</div>
              <div className="text-lg font-semibold text-gray-800">{energy}</div>
            </div>
          ) : energyValues.length > 1 ? (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">能耗</div>
              <div className="text-sm font-semibold text-gray-800">{energyValues.join(', ')}</div>
            </div>
          ) : null}
          {(damageType || skillType) && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">类型</div>
              <div className="text-lg font-semibold text-gray-800">{damageType || skillType}</div>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">优先级</div>
            <div className="text-lg font-semibold text-gray-800">
              {skill.skill_priority != null ? skill.skill_priority : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* 可学该技能的精灵列表 */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-3">
          可学该技能的精
          <span className="text-gray-400 font-normal text-sm ml-1">（{petSources.length}）</span>
        </h2>
        {petSources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {petSources.map(({ pet, source, level }) => (
              <Link
                key={pet.id}
                to={`/pets/${pet.id}`}
                className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors group"
              >
                <img
                  src={petIconUrl(pet.JL_res)}
                  alt={pet.name}
                  className="w-10 h-10 object-contain bg-white rounded"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">#{pet.pictorial_book_id}</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                      {pet.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      source === '升级' ? 'bg-green-100 text-green-700' :
                      source === '血脉' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {source}
                    </span>
                    {level != null && (
                      <span className="text-xs text-gray-400">Lv.{level}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">暂无可学该技能的精灵数据</div>
        )}
      </div>
    </div>
  )
}
