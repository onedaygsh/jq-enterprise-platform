# API 接口文档

> 基础路径: `http://localhost:8000/api/v1`
> 
> Swagger UI: `http://localhost:8000/docs`

## 认证

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/auth/login` | 用户登录，返回 JWT Token |
| POST | `/auth/register` | 用户注册 |

请求示例：
```json
POST /auth/login
{ "username": "admin", "password": "admin123" }
```

## 集团级

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/group/blueprint` | 平台蓝图与功能清单 |
| GET | `/group/master-data` | 主数据总览 |
| GET | `/group/master-data/hierarchy` | 四级穿透树 |

## 主数据 CRUD

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/master-data/factories` | 工厂列表 |
| POST | `/master-data/factories` | 新增工厂 |
| PUT | `/master-data/factories/{id}` | 更新工厂 |
| DELETE | `/master-data/factories/{id}` | 删除工厂 |
| GET | `/master-data/workshops?factory_id=` | 车间列表 |
| POST | `/master-data/workshops` | 新增车间 |
| PUT | `/master-data/workshops/{id}` | 更新车间 |
| GET | `/master-data/lines?workshop_id=` | 产线列表 |
| POST | `/master-data/lines` | 新增产线 |
| GET | `/master-data/materials?category=` | 物料列表 |
| POST | `/master-data/materials` | 新增物料 |
| GET | `/master-data/boms?product_id=` | BOM 列表 |
| POST | `/master-data/boms` | 新增 BOM |
| GET | `/master-data/equipment?line_id=` | 设备列表 |
| POST | `/master-data/equipment` | 新增设备 |

## 制造执行

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/manufacturing/work-orders` | 工单列表 |
| POST | `/manufacturing/work-orders` | 创建工单 |
| POST | `/manufacturing/work-orders/from-order/{order_id}` | 从订单生成工单 |
| POST | `/manufacturing/work-orders/{id}/release` | 释放工单 |
| GET | `/manufacturing/production-reports` | 报工列表 |
| POST | `/manufacturing/production-reports` | 创建报工 |
| POST | `/manufacturing/production-reports/from-order/{id}` | 订单快捷报工 |
| GET | `/manufacturing/telemetry` | 设备采集列表 |
| POST | `/manufacturing/telemetry` | 上传采集数据（异常自动报警） |
| GET | `/manufacturing/alarms` | 报警列表 |
| POST | `/manufacturing/alarms` | 创建报警 |
| GET | `/manufacturing/oee?equipment_id=` | OEE 汇总 |

OEE 响应示例：
```json
{
  "equipment_id": null,
  "snapshot_count": 200,
  "availability": 85.5,
  "performance": 92.3,
  "quality": 98.1,
  "oee": 77.35,
  "output": 18460,
  "defect": 350
}
```

## 经营管理

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/business/customers` | 客户列表 |
| POST | `/business/customers` | 新增客户 |
| GET | `/business/orders` | 订单列表 |
| POST | `/business/orders` | 新增订单 |
| GET | `/business/leads` | 线索列表 |
| POST | `/business/leads` | 新增线索 |
| GET | `/business/opportunities` | 商机列表 |
| POST | `/business/opportunities` | 新增商机 |

## 战略管理

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/strategy/objectives` | 战略目标列表 |
| POST | `/strategy/objectives` | 新增目标 |
| GET | `/strategy/key-results` | 关键结果列表 |
| POST | `/strategy/key-results` | 新增 KR |
| GET | `/strategy/tasks` | 执行任务列表 |
| POST | `/strategy/tasks` | 新增任务 |

## 供应链

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/supply-chain/suppliers` | 供应商列表 |
| POST | `/supply-chain/suppliers` | 新增供应商 |
| GET | `/supply-chain/purchase-orders` | 采购订单列表 |
| POST | `/supply-chain/purchase-orders` | 新增采购单 |
| GET | `/supply-chain/warehouses` | 仓库列表 |
| POST | `/supply-chain/warehouses` | 新增仓库 |
| GET | `/supply-chain/inventory` | 库存列表 |
| POST | `/supply-chain/inventory` | 新增库存记录 |

## 产品研发

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/product/lines` | 产品线列表 |
| POST | `/product/lines` | 新增产品线 |
| GET | `/product/products` | 产品列表 |
| POST | `/product/products` | 新增产品 |
| GET | `/product/requirements` | 需求列表 |
| POST | `/product/requirements` | 新增需求 |
| GET | `/product/projects` | 项目列表 |
| POST | `/product/projects` | 新增项目 |
| GET | `/product/tasks` | 任务列表 |
| POST | `/product/tasks` | 新增任务 |
| GET | `/product/quality-checks` | 质量检查列表 |
| POST | `/product/quality-checks` | 新增质量检查 |

## 财务管理

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/finance/budgets` | 预算列表 |
| POST | `/finance/budgets` | 新增预算 |
| GET | `/finance/expenses` | 费用列表 |
| POST | `/finance/expenses` | 新增费用 |
| GET | `/finance/revenues` | 收入列表 |
| POST | `/finance/revenues` | 新增收入 |
| GET | `/finance/invoices` | 发票列表 |
| POST | `/finance/invoices` | 新增发票 |
| GET | `/finance/cost-reductions` | 降本目标列表 |
| POST | `/finance/cost-reductions` | 新增降本目标 |

## 人才发展

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/talent/recruitments` | 招聘岗位列表 |
| POST | `/talent/recruitments` | 新增岗位 |
| GET | `/talent/candidates` | 候选人列表 |
| POST | `/talent/candidates` | 新增候选人 |
| GET | `/talent/performances` | 绩效列表 |
| POST | `/talent/performances` | 新增绩效 |
| GET | `/talent/trainings` | 培训列表 |
| POST | `/talent/trainings` | 新增培训 |
| GET | `/talent/compensations` | 薪酬列表 |
| POST | `/talent/compensations` | 新增薪酬记录 |

## 外部集成

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/dashboard/tiangong` | 天工 OS 仪表盘 |
| GET | `/products/tiangong` | 天工 OS 产品列表 |
| GET | `/orders/tiangong` | 天工 OS 订单列表 |
| GET | `/suppliers/tiangong` | 天工 OS 供应商列表 |
