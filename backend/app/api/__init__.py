# -*- coding: utf-8 -*-
"""API v1 路由聚合。"""
from fastapi import APIRouter

from app.api import (
    business,
    finance,
    group_blueprint,
    manufacturing,
    master_data,
    master_data_crud,
    product,
    strategy,
    supply_chain,
    talent,
)

api_router = APIRouter(prefix="/api/v1")

# 集团级（蓝图 + 主数据总览）
group_router = APIRouter(prefix="/group")
group_router.include_router(group_blueprint.router, tags=["集团蓝图"])
group_router.include_router(master_data.router, tags=["集团主数据"])
api_router.include_router(group_router)

# 各业务域
api_router.include_router(business.router, prefix="/business", tags=["经营管理"])
api_router.include_router(strategy.router, prefix="/strategy", tags=["战略管理"])
api_router.include_router(product.router, prefix="/product", tags=["产品研发"])
api_router.include_router(finance.router, prefix="/finance", tags=["财务管理"])
api_router.include_router(talent.router, prefix="/talent", tags=["人才发展"])
api_router.include_router(supply_chain.router, prefix="/supply-chain", tags=["供应链"])
api_router.include_router(manufacturing.router, prefix="/manufacturing", tags=["制造执行"])
api_router.include_router(master_data_crud.router, prefix="/master-data", tags=["主数据CRUD"])
