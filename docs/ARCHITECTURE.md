# 企业管理系统架构设计文档

## 设计理念
基于华为管理方法论：封闭式思维、双系统理论、知行合一、统一语言、IPD

## 系统模块
1. 战略管理中心 (Strategy)
2. 业务管理中心 (Business/CRM)  
3. 产品管理中心 (Product/IPD)
4. 财务管理中心 (Finance)
5. 人才管理中心 (Talent/HR)
6. 供应链管理中心 (Supply Chain)
7. 系统基础服务 (Platform)

## 技术栈
- 后端: FastAPI + SQLAlchemy + Celery + Redis
- 数据库: PostgreSQL/SQLite
- 前端: React 18 + TypeScript + Ant Design Pro
- 部署: Docker + Docker Compose
