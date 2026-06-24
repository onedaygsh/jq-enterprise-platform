# 鲸祺集团统一运营平台

> ERP / MES / WMS / QMS / EAM 一体化企业管理系统

## 平台概述

鲸祺集团统一运营平台是一套面向制造型集团企业的全链路数字化管理系统，覆盖从战略目标到车间执行的全层级业务闭环。

### 核心能力

| 模块 | 功能 | 状态 |
|---|---|---|
| 集团驾驶舱 | 四级穿透（集团→工厂→车间→产线）、OEE 总览、订单概览 | ✅ |
| 平台蓝图 | 建设原则、分域设计、三期实施路线 | ✅ |
| 主数据中心 | 组织/工厂/车间/产线/物料/BOM/设备台账统一编码 | ✅ |
| 主数据维护 | 6 类主数据的 CRUD 管理 | ✅ |
| 制造执行 | 订单→工单→报工链路、设备采集、OEE、异常报警 | ✅ |
| 经营管理 | 客户/订单/线索/商机，一键生成工单+报工 | ✅ |
| 战略管理 | 战略目标→关键结果→执行任务三级穿透 | ✅ |
| 供应链 | 供应商/采购订单/仓库/库存预警 | ✅ |
| 产品研发 | 产品线/产品/需求/项目/任务/质量检查 | ✅ |
| 财务管理 | 预算/费用/收入/发票/降本目标 | ✅ |
| 人才发展 | 招聘/候选人/绩效/培训/薪酬 | ✅ |
| 平台底座 | 权限体系、API 网关、技术栈全景 | ✅ |
| 系统管理 | 用户/角色/权限/菜单/日志 | ✅ |

## 技术栈

| 层级 | 技术 |
|---|---|
| 后端框架 | FastAPI (Python 3.12) |
| ORM | SQLAlchemy (异步) |
| 数据库 | PostgreSQL / SQLite |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| UI 组件库 | Ant Design 5 |
| HTTP 客户端 | Axios |
| 认证 | JWT + RBAC |
| 容器化 | Docker + Docker Compose |

## 项目结构

```
enterprise-platform/
├── backend/
│   └── app/
│       ├── api/           # 10 个 API 路由模块
│       │   ├── auth.py        # 认证接口
│       │   ├── business.py    # 经营管理
│       │   ├── strategy.py    # 战略管理
│       │   ├── product.py     # 产品研发
│       │   ├── finance.py     # 财务管理
│       │   ├── talent.py      # 人才发展
│       │   ├── supply_chain.py# 供应链
│       │   ├── manufacturing.py# 制造执行
│       │   ├── master_data.py # 主数据蓝图
│       │   ├── master_data_crud.py # 主数据 CRUD
│       │   └── group_blueprint.py  # 集团蓝图
│       ├── models/        # SQLAlchemy 数据模型
│       ├── schemas/       # Pydantic 请求/响应模型
│       ├── core/          # 配置、数据库、安全
│       └── services/      # 业务服务（天工 OS 集成等）
├── frontend/
│   └── src/
│       ├── pages/         # 14 个业务页面
│       ├── layouts/       # 主布局
│       ├── services/      # API 客户端
│       └── stores/        # 状态管理
├── docs/                  # 项目文档
├── ui-mockups/            # UI 原型截图
└── docker-compose.yml     # 容器编排
```

## 快速开始

### 前置要求

- Python 3.11+
- Node.js 18+
- npm 9+

### 后端启动

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API 文档自动生成于：http://localhost:8000/docs

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

开发服务器启动于：http://localhost:5173

### Docker 一键部署

```bash
docker-compose up -d
```

## 四级穿透驾驶舱

平台首页实现从集团到产线的实时穿透：

```
鲸祺集团
├── 一厂（东莞）
│   ├── 注塑车间
│   │   ├── A线
│   │   └── B线
│   └── 装配车间
│       └── C线
└── 二厂（惠州）
    └── 包装车间
        └── D线
```

点击任意节点，仪表盘数据实时切换至对应层级。

## 关键业务链路

- **订单链**：销售订单 → 工单（一键生成）→ 报工（一键完成）→ 交付 → 回款
- **物料链**：BOM → 采购订单 → 入库 → 发料 → 消耗 → 库存
- **质量链**：来料检 → 过程检 → 成品检 → 追溯 → 处置
- **设备链**：设备台账 → 实时采集 → OEE 计算 → 异常报警 → 维修工单

## 建设阶段

| 阶段 | 重点 |
|---|---|
| 一期 | 主数据统一、订单到工单、报工与库存联通、基础看板 |
| 二期 | 设备采集、质量追溯、异常闭环、WMS/QMS/EAM 深度接入 |
| 三期 | 成本核算、智能排程、经营分析、绩效联动、预测预警 |

## 许可证

MIT License
