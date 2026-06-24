# Docker 部署指南

## 架构概览

```
┌─────────────────────────────────────────────┐
│             Nginx (前端容器 :80)             │
│  /         → SPA (React 静态文件)            │
│  /api/*    → 反向代理到 Backend :8000        │
│  /docs     → Swagger 文档                    │
├─────────────────────────────────────────────┤
│         FastAPI Backend (后端容器 :8000)      │
│  SQLAlchemy (异步)                           │
│  JWT 认证 + RBAC 授权                        │
├─────────────────────────────────────────────┤
│        PostgreSQL 16 (数据库容器 :5432)       │
│  持久化卷: jq_pgdata                         │
└─────────────────────────────────────────────┘
```

## 前置要求

- Docker 24.0+
- Docker Compose 2.20+
- 可用内存 ≥ 4GB
- 磁盘空间 ≥ 5GB

## 快速部署（5 分钟）

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env，修改密钥和密码
# SECRET_KEY: 必改！用 openssl rand -hex 32 生成随机值
# DB_PASSWORD: 生产环境必改
```

### 2. 构建并启动

```bash
# 构建镜像并启动所有服务
docker-compose up -d --build

# 查看启动日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 3. 验证部署

```bash
# 健康检查
curl http://localhost:8000/health

# API 文档
# 浏览器打开: http://localhost:8000/docs

# 前端应用
# 浏览器打开: http://localhost:3000
```

## 服务端口

| 服务 | 端口 | 说明 |
|---|---|---|
| 前端 Nginx | `3000` | 生产构建的 SPA + API 代理 |
| 后端 API | `8000` | FastAPI 服务 |
| PostgreSQL | `5432` | 数据库（仅内网可访问） |

## 数据持久化

| 数据卷 | 挂载路径 | 说明 |
|---|---|---|
| `jq_pgdata` | `/var/lib/postgresql/data` | PostgreSQL 数据 |
| `jq_backend_data` | `/app/data` | 后端应用数据 |

备份命令：
```bash
# 备份数据库
docker exec jq-postgres pg_dump -U jqadmin enterprise > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker exec -i jq-postgres psql -U jqadmin enterprise < backup_20260624.sql
```

## 常用运维命令

```bash
# 重启服务
docker-compose restart backend
docker-compose restart frontend

# 停止所有服务
docker-compose down

# 停止并删除数据卷（⚠️ 不可恢复）
docker-compose down -v

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# 进入容器调试
docker exec -it jq-backend /bin/bash
docker exec -it jq-postgres psql -U jqadmin -d enterprise

# 更新后重新构建
git pull
docker-compose build --no-cache
docker-compose up -d
```

## Dockerfile 说明

### 后端 (`backend/Dockerfile`)

```
python:12-slim 基础镜像
    ├── 安装系统工具（curl 健康检查）
    ├── pip install 依赖
    ├── 复制源码
    ├── 创建非 root 用户
    └── HEALTHCHECK: /health 端点
```

- 镜像大小：~200MB
- 非 root 运行，安全性更高

### 前端 (`frontend/Dockerfile`)

```
Stage 1: node:20-alpine (构建阶段)
    ├── npm ci 安装依赖
    └── npm run build 生产构建

Stage 2: nginx:1.27-alpine (运行阶段)
    ├── 复制 dist/ 静态文件
    ├── 复制 nginx.conf
    └── HEALTHCHECK: 80 端口探测
```

- 最终镜像大小：~25MB（仅含 Nginx + 静态文件）
- 构建缓存分层优化

## Nginx 配置说明

`frontend/nginx.conf` 关键配置：

```nginx
# SPA 路由: 所有 / 路径回退到 index.html
location / {
    try_files $uri $uri/ /index.html;
}

# API 代理: 前端 /api/* → 后端 :8000
location /api/ {
    proxy_pass http://backend:8000/api/;
}

# 静态资源长期缓存
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 生产环境 Checklist

- [ ] 修改 `.env` 中 `SECRET_KEY` 为随机值
- [ ] 修改 `.env` 中 `DB_PASSWORD` 为强密码
- [ ] 配置 HTTPS（Nginx + Let's Encrypt）
- [ ] 限制 `CORS_ORIGINS` 为实际域名
- [ ] 配置防火墙（仅开放 80/443）
- [ ] 设置日志轮转（logrotate）
- [ ] 配置数据库定时备份
- [ ] 添加监控（Prometheus + Grafana）

## 添加 HTTPS

```bash
# 在 docker-compose.yml 的 frontend 服务添加 certbot 或使用外部 Nginx

# 推荐方案: 外部 Nginx + Certbot
# 在宿主机安装 Nginx，配置 SSL 终止，反向代理到 docker 端口
```

## 性能调优

```yaml
# docker-compose.yml 可选配置
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 故障排查

| 问题 | 检查点 |
|---|---|
| 前端 502 | `docker-compose logs backend` 确认后端已启动 |
| 数据库连接失败 | `docker-compose logs postgres` 确认 PG 已就绪 |
| 页面白屏 | 检查浏览器控制台，确认 API baseURL 正确 |
| 容器频繁重启 | `docker-compose logs` 查看崩溃原因 |
| 端口冲突 | `netstat -ano | findstr 3000` 检查端口占用 |
