# -*- coding: utf-8 -*-
"""主数据中心接口：组织、工厂、车间、产线、物料、BOM、设备台账。"""
from fastapi import APIRouter

router = APIRouter()


MASTER_DATA_BLUEPRINT = {
    "sections": [
        {
            "name": "组织架构",
            "items": ["集团", "事业部", "公司", "工厂", "部门", "岗位", "人员"],
        },
        {
            "name": "工厂与产线",
            "items": ["工厂", "车间", "产线", "工位", "班组", "节拍"],
        },
        {
            "name": "物料主数据",
            "items": ["物料分类", "物料编码", "规格型号", "计量单位", "安全库存", "替代料"],
        },
        {
            "name": "BOM 主数据",
            "items": ["产品BOM", "工艺BOM", "版本管理", "生效/失效", "损耗率", "替代件"],
        },
        {
            "name": "设备主数据",
            "items": ["设备台账", "设备分类", "设备状态", "保养周期", "点检标准", "备件关联"],
        },
    ],
    "records": {
        "organizations": [
            {"id": 1, "name": "鲸祺集团", "code": "JQ-GROUP", "parent": None, "level": "集团", "status": "启用"},
            {"id": 2, "name": "鲸祺制造事业部", "code": "JQ-MFG", "parent": "鲸祺集团", "level": "事业部", "status": "启用"},
            {"id": 3, "name": "鲸祺供应链事业部", "code": "JQ-SCM", "parent": "鲸祺集团", "level": "事业部", "status": "启用"},
        ],
        "factories": [
            {"id": 1, "name": "一厂", "code": "F001", "location": "东莞", "status": "启用"},
            {"id": 2, "name": "二厂", "code": "F002", "location": "惠州", "status": "启用"},
        ],
        "workshops": [
            {"id": 1, "name": "注塑车间", "code": "W001", "factory": "一厂", "status": "启用"},
            {"id": 2, "name": "装配车间", "code": "W002", "factory": "一厂", "status": "启用"},
            {"id": 3, "name": "包装车间", "code": "W003", "factory": "二厂", "status": "启用"},
        ],
        "lines": [
            {"id": 1, "name": "A线", "code": "L001", "workshop": "注塑车间", "takt_time": "45s", "status": "运行"},
            {"id": 2, "name": "B线", "code": "L002", "workshop": "装配车间", "takt_time": "38s", "status": "运行"},
            {"id": 3, "name": "C线", "code": "L003", "workshop": "包装车间", "takt_time": "52s", "status": "待机"},
        ],
        "materials": [
            {"id": 1, "name": "ABS 颗粒", "code": "M001", "unit": "KG", "category": "原料", "safe_stock": 1200},
            {"id": 2, "name": "五金件", "code": "M002", "unit": "PCS", "category": "辅料", "safe_stock": 5000},
            {"id": 3, "name": "包装盒", "code": "M003", "unit": "PCS", "category": "包材", "safe_stock": 3000},
        ],
        "boms": [
            {"id": 1, "product": "产品A", "version": "V1.0", "materialCount": 12, "status": "生效"},
            {"id": 2, "product": "产品B", "version": "V2.1", "materialCount": 18, "status": "生效"},
            {"id": 3, "product": "产品C", "version": "V1.4", "materialCount": 9, "status": "待审"},
        ],
        "equipments": [
            {"id": 1, "name": "注塑机01", "code": "EQ001", "line": "A线", "status": "运行", "oee": 82.3},
            {"id": 2, "name": "装配机02", "code": "EQ002", "line": "B线", "status": "运行", "oee": 76.8},
            {"id": 3, "name": "包装机03", "code": "EQ003", "line": "C线", "status": "待机", "oee": 64.5},
        ],
    },
}


@router.get("/master-data")
async def get_master_data():
    return MASTER_DATA_BLUEPRINT


@router.get("/master-data/hierarchy")
async def get_master_data_hierarchy():
    return {
        "group": {
            "name": "鲸祺集团",
            "code": "JQ-GROUP",
            "children": [
                {
                    "name": "一厂",
                    "code": "F001",
                    "children": [
                        {"name": "注塑车间", "code": "W001", "children": [{"name": "A线", "code": "L001"}, {"name": "B线", "code": "L002"}]},
                        {"name": "装配车间", "code": "W002", "children": [{"name": "C线", "code": "L003"}]},
                    ],
                },
                {
                    "name": "二厂",
                    "code": "F002",
                    "children": [
                        {"name": "包装车间", "code": "W003", "children": [{"name": "D线", "code": "L004"}]},
                    ],
                },
            ],
        }
    }
