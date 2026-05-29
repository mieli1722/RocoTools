# 洛克王国世界工具箱

一款为《洛克王国：世界》玩家打造的轻量数据查询工具。数据来源于游戏原始配置文件的解码提取，覆盖精灵图鉴、技能查询、属性克制计算、性格查询、蛋组查询、神秘蛋推测等功能。

## 使用方式

### 网页版

**[mieli1722.github.io/RocoTools](https://mieli1722.github.io/RocoTools/)**

通过 GitHub Actions 自动构建部署到 GitHub Pages。

### 桌面版

基于 [Tauri](https://tauri.app/) 打包为原生 Windows 应用，双击即用，无需浏览器。

```bash
npm run tauri:build
```

产物：`src-tauri/target/release/rocktools.exe`

## 功能介绍

| 模块 | 路由 | 说明 |
|------|------|------|
| **首页** | `/` | 功能导航入口 |
| **精灵图鉴** | `/pets` | 浏览全部图鉴精灵，支持按属性多选筛选、图鉴编号/星光值排序 |
| **精灵详情** | `/pets/:id` | 查看种族值、进化链（含地区形态与 BOSS 形态）、特性、技能表；点击技能可跳转技能详情 |
| **技能查询** | `/skills` | 搜索全部技能，支持按属性按钮组多选筛选；查看威力、能耗、属性、技能类型；点击卡片跳转详情 |
| **技能详情** | `/skills/:id` | 查看技能完整参数（威力、能耗、类型、优先级）；展示可学该技能的精灵列表，点击精灵可跳转 |
| **属性克制** | `/types` | 单/双属性克制计算器，自动汇总攻击克制与防御抵抗关系 |
| **性格查询** | `/natures` | 以矩阵表格形式展示 30 种性格对六项能力值的加成与减成 |
| **蛋组查询** | `/egg-groups` | 按蛋组浏览精灵，区分单蛋组与双蛋组，支持蛋组间跳转 |
| **神秘蛋推测** | `/egg-predictor` | 输入精灵蛋的身高与体重，推测可能的精灵，并展示蛋的身高体重范围与孵化时间 |

### 交互特性

- 技能和特性描述中的 `<desc_id>` 标签被自动解析为蓝色可点击链接，点击弹出术语解释对话框
- 精灵详情页与技能详情页双向跳转：精灵页点击技能 → 技能详情；技能详情点击精灵 → 精灵详情

## 数据文件

所有游戏数据以 JSON 格式存放在 `src/assets/data/` 目录：

| 文件 | 内容 |
|------|------|
| `pets.json` | 精灵基础信息、种族值、进化链、技能表 |
| `skills.json` | 技能详情：威力、能耗、属性、类型、效果描述 |
| `features.json` | 精灵特性数据 |
| `type_relations.json` | 属性克制关系矩阵 |
| `natures.json` | 性格对能力值的修正表 |
| `egg_conf.json` | 蛋组配置与神秘蛋参数 |
| `weathers.json` | 天气效果配置 |
| `desc_notes.json` | 游戏术语词典（用于技能/特性描述中的内联解释） |


## 技术栈

- [Vite 6](https://vitejs.dev/) — 构建工具
- [React 19](https://react.dev/) — UI 框架
- [React Router 7](https://reactrouter.com/) — 路由（HashRouter）
- [Tailwind CSS 3](https://tailwindcss.com/) — 样式
- [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) — CSS 处理
- [Lucide React](https://lucide.dev/) — 图标库
- [Tauri 2](https://tauri.app/) — 桌面应用打包

## 目录结构

```
web/
├── .github/workflows/deploy.yml   # GitHub Actions 自动部署
├── public/
│   └── icons/                     # 精灵、属性、血脉、技能、特性图标
├── src/
│   ├── assets/data/               # 解码后的 JSON 数据文件
│   ├── components/
│   │   ├── Header.jsx             # 导航栏
│   │   ├── TypeBadge.jsx          # 属性标签组件
│   │   └── DescText.jsx           # desc_id 标签解析与术语弹窗
│   ├── pages/
│   │   ├── Home.jsx               # 首页
│   │   ├── PetPedia.jsx           # 精灵图鉴
│   │   ├── PetDetail.jsx          # 精灵详情
│   │   ├── TypeCalc.jsx           # 属性克制计算
│   │   ├── SkillQuery.jsx         # 技能查询
│   │   ├── SkillDetail.jsx        # 技能详情
│   │   ├── NatureQuery.jsx        # 性格查询
│   │   ├── EggGroupQuery.jsx      # 蛋组查询
│   │   └── EggPredictor.jsx       # 神秘蛋推测
│   ├── utils/
│   │   ├── data.js                # 数据加载工具
│   │   └── icons.js               # 图标引用辅助
│   ├── App.jsx                    # 路由配置与布局
│   ├── main.jsx                   # 入口文件
│   └── index.css                  # 全局样式（Tailwind）
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src-tauri/                    # Tauri 桌面壳（Rust）
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── icons/                    # 桌面图标
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── .gitignore
└── README.md
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动 Web 开发服务器
npm run dev

# 启动桌面开发模式（带热更新）
npm run tauri

# 构建 Web 版本
npm run build

# 构建桌面版本
npm run tauri:build
```

## 免责声明

本项目为玩家自制工具，所有游戏数据版权归《洛克王国：世界》官方所有。本项目仅供学习与交流使用，如有侵权请联系删除。
