<h1 align="center">PrepFlow</h1>

<p align="center">
  <img alt="Java" src="https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white">
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=flat-square&logo=springboot&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white">
  <img alt="Redis" src="https://img.shields.io/badge/Redis-6-DC382D?style=flat-square&logo=redis&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111111">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white">
</p>

一个面向 Java 后端面试备考的在线刷题与能力评估平台。项目功能包含题库练习、即时判分、答题历史、错题复盘、能力分析、AI 辅助解析、个人主页和后台题库管理。

## 项目简介

PrepFlow平台以选择题练习为主。用户可以按知识分类浏览题目，提交答案后查看判分结果和题目解析。系统会记录答题历史、维护错题本，并根据答题数据生成分类能力评估和 AI 学习建议。

管理员可以在后台维护题库、编辑题目、查看用户列表并管理用户状态。

## 功能

- 用户注册、登录、登出。
- 题库大厅与知识分类题目列表。
- 选择题答题、提交和结果展示。
- 答题历史查看和单次提交回顾。
- 错题本复盘和推荐复习时间控制。
- 分类正确率统计和薄弱项分析。
- AI 流式问答、题目深度解析和薄弱项学习建议。
- 个人主页、练习日历、头像上传和资料编辑。
- 管理员用户管理和题库管理。

## 技术栈

Backend：Java 17，Spring Boot 3，Maven，MyBatis-Plus，MySQL，Redis，Sa-Token，Caffeine，Spring AI，Server-Sent Events
Frontend：React 19，TypeScript，Vite，Ant Design

## 项目结构

```text
Interview-platform/
├── src/                         # 后端源码
│   └── main
│       ├── java/com/ai/interview
│       │   ├── controller        # 接口层
│       │   ├── service           # 业务层
│       │   ├── mapper            # Mapper
│       │   ├── entity            # 实体类
│       │   ├── dto               # 请求对象
│       │   ├── vo                # 响应对象
│       │   ├── strategy          # 判分策略
│       │   ├── exception         # 异常处理
│       │   └── config            # 配置类
│       └── resources
│           └── application.yml
├── frontend/                     # 前端源码
│   ├── src
│   │   ├── api                   # 接口封装
│   │   ├── components            # 页面组件
│   │   ├── types                 # 类型定义
│   │   └── utils                 # 工具函数
│   ├── package.json
│   └── vite.config.ts
├── pom.xml
└── README.md
```

## 环境要求

- JDK 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+
- Redis 6+

## 配置说明

后端配置文件位于：

```text
src/main/resources/application.yml
```

项目支持通过环境变量覆盖默认配置。本地开发时如果配置和默认值一致，可以不额外设置环境变量。

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `SERVER_PORT` | `8008` | 后端端口 |
| `MYSQL_URL` | `jdbc:mysql://localhost:3306/ai_interview?...` | MySQL 地址 |
| `MYSQL_USERNAME` | `root` | MySQL 用户名 |
| `MYSQL_PASSWORD` | 无 | MySQL 密码，必须配置 |
| `REDIS_HOST` | `localhost` | Redis 地址 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_DATABASE` | `0` | Redis 数据库 |
| `REDIS_PASSWORD` | 无 | Redis 密码，必须配置 |
| `AI_BASE_URL` | 无 | 大模型 OpenAI 兼容接口地址，必须配置 |
| `AI_API_KEY` | 无 | 大模型 API Key，必须配置 |
| `AI_MODEL` | 无 | 大模型名称，必须配置 |
| `MAX_FILE_SIZE` | `5MB` | 上传文件大小限制 |
| `MAX_REQUEST_SIZE` | `5MB` | 上传请求大小限制 |
| `UPLOAD_PATH` | 无 | 上传基础目录，必须配置；头像保存到该目录下的 `uploads/` 子目录 |

## 本地开发

### 1. 准备数据库和 Redis

创建 MySQL 数据库：

```sql
CREATE DATABASE ai_interview DEFAULT CHARACTER SET utf8mb4;
```

### 2. 启动后端

在项目根目录执行：

```powershell
.\mvnw spring-boot:run
```

默认访问地址：

```text
http://localhost:8008
```

### 3. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

本地开发时，Vite 会代理接口和头像资源：

```text
/api      -> http://localhost:8008
/uploads  -> http://localhost:8008
```
本地开发需要配置环境变量，例如：

```powershell
$env:MYSQL_PASSWORD="your-mysql-password"
$env:REDIS_PASSWORD="your-redis-password"
$env:UPLOAD_PATH="."
$env:AI_BASE_URL="your-openai-compatible-base-url"
$env:AI_API_KEY="your-llm-api-key"
$env:AI_MODEL="your-llm-model-name"
```

`UPLOAD_PATH` 表示项目目录或部署目录。后端会自动使用其下的 `uploads/` 子目录保存头像。

AI 配置使用 OpenAI 兼容接口格式，可对接兼容该协议的大模型服务。

## 常用命令

**后端**

```powershell
.\mvnw spring-boot:run
.\mvnw test
.\mvnw clean package
.\mvnw clean package -DskipTests
```

**前端**

```powershell
cd frontend
npm run dev
npm run lint
npm run build
npm run preview
```

## 部署建议

建议使用同域部署：

```text
https://your-domain.com          前端页面
https://your-domain.com/api      后端接口
https://your-domain.com/uploads  头像资源
```

这种方式可以减少跨域配置，也便于头像资源访问。

### 1. 构建后端

```bash
./mvnw clean package -DskipTests
```

生成文件：

```text
target/Interview-0.0.1-SNAPSHOT.jar
```

### 2. 构建前端

```bash
cd frontend
npm install
npm run build
```

生成文件目录：

```text
frontend/dist
```

### 3. 服务器环境变量示例

```bash
export SERVER_PORT=8008
export MYSQL_URL='jdbc:mysql://127.0.0.1:3306/ai_interview?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true'
export MYSQL_USERNAME='root'
export MYSQL_PASSWORD='your-password'
export REDIS_HOST='127.0.0.1'
export REDIS_PORT=6379
export REDIS_DATABASE=0
export REDIS_PASSWORD='your-redis-password'
export UPLOAD_PATH='/data/interview-platform'
export AI_MODEL='llm-name'
export AI_BASE_URL='your-llm-url'
export AI_API_KEY='your-llm-apikey'
```

### 4. 启动后端

```bash
java -jar target/Interview-0.0.1-SNAPSHOT.jar
```

### 5. Nginx 示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /data/interview-platform/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8008/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        alias /data/interview-platform/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

## 主要接口

**用户**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/users/register` | 注册 |
| `POST` | `/api/users/login` | 登录 |
| `POST` | `/api/users/logout` | 登出 |
| `GET` | `/api/users/me` | 当前用户信息 |
| `PUT` | `/api/users/me` | 修改个人资料 |
| `POST` | `/api/users/me/avatar` | 上传头像 |
| `GET` | `/api/users/me/profile` | 个人主页数据 |

**题目与提交**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/questions` | 题目列表 |
| `GET` | `/api/questions/{questionId}` | 题目详情 |
| `POST` | `/api/submits` | 提交答案 |
| `GET` | `/api/submits` | 答题历史 |
| `GET` | `/api/submits/wrongs/grouped-by-category` | 错题本 |
| `GET` | `/api/submits/statistics/category` | 分类统计 |
| `GET` | `/api/submits/analysis/weakness` | 薄弱项分析 |
| `GET` | `/api/submits/calendar` | 练习日历 |

**AI**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/chat/stream` | AI 流式问答 |
| `POST` | `/api/chat/analysis/deep` | AI 题目深度解析 |
| `POST` | `/api/suggestions/weakness` | AI 薄弱项学习建议 |

**管理员**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/admin/questions` | 新增题目 |
| `PUT` | `/api/admin/questions` | 修改题目 |
| `GET` | `/api/admin/questions/{questionId}` | 管理员题目详情 |
| `DELETE` | `/api/admin/questions/{questionId}` | 删除题目 |
| `GET` | `/api/admin/users` | 用户列表 |
| `PUT` | `/api/admin/users/status` | 修改用户状态 |

## 数据表

- `t_user`：用户表。
- `t_question`：题目表。
- `t_question_option`：题目选项表。
- `t_user_submit`：用户提交记录表。
- `t_user_wrong_book`：错题本表。
