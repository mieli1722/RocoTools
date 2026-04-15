# 洛克王国世界工具箱

一款为《洛克王国：世界》玩家打造的轻量数据查询工具，基于游戏原始配置数据提取，支持宠物图鉴、技能查询、属性克制计算、性格查询、蛋组查询等功能。

## 在线访问

https://mieli1722.github.io/RocoTools/

## 功能介绍

| 模块 | 说明 |
|------|------|
| **宠物图鉴** | 浏览全部图鉴宠物，支持按属性筛选、按图鉴编号排序，查看种族值、进化链（含地区形态与 BOSS 形态）、特性、技能表 |
| **属性克制** | 单/双属性克制计算器，自动汇总攻击克制与防御抵抗关系 |
| **技能查询** | 搜索全部技能，查看威力、能耗、属性、技能类型（物攻/魔攻/状态/防御） |
| **性格查询** | 以矩阵表格形式展示 30 种性格对六项能力值的加成与减成 |
| **蛋组查询** | 按蛋组浏览精灵，区分单蛋组与双蛋组，支持蛋组间跳转 |

## 技术栈

- [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)

## 目录结构

```
.
├── .github/workflows/     # GitHub Actions 自动部署配置
├── public/
│   └── icons/             # 宠物、属性、血脉、技能、特性图标
├── src/
│   ├── assets/data/       # 提取后的 JSON 数据
│   ├── components/        # 公共组件
│   ├── pages/             # 页面组件
│   ├── utils/             # 数据加载与图标工具
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```


## 免责声明

本项目为玩家自制工具，所有游戏数据版权归《洛克王国：世界》官方所有。本项目仅供学习与交流使用，如有侵权请联系删除。
