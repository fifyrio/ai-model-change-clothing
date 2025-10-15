# Vercel 部署指南

本文档说明如何将 AI Model Change Clothing 项目部署到 Vercel。

## 项目结构

本项目包含两个部分：
- **根目录**: TypeScript CLI 工具（不会部署到 Vercel）
- **web-ui 目录**: Next.js 15 web 应用（将部署到 Vercel）

## 部署前准备

### 1. 安装依赖

在 `web-ui` 目录下安装依赖：

```bash
cd web-ui
npm install
```

### 2. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `OPENROUTER_API_KEY` | OpenRouter API密钥 | ✅ 是 |
| `SITE_URL` | 应用URL（自动设置为Vercel URL） | ❌ 否 |
| `SITE_NAME` | 应用名称 | ❌ 否 |

## 部署步骤

### 方式一：通过 Vercel CLI 部署

1. 安装 Vercel CLI：

```bash
npm install -g vercel
```

2. 登录 Vercel：

```bash
vercel login
```

3. 在项目根目录部署：

```bash
vercel
```

4. 按照提示完成配置：
   - 选择 scope（个人账户或团队）
   - 确认项目名称
   - 确认项目目录为当前目录
   - 配置将自动从 `vercel.json` 读取

5. 部署到生产环境：

```bash
vercel --prod
```

### 方式二：通过 Vercel Dashboard 部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)

2. 点击 "Add New..." → "Project"

3. 导入你的 Git 仓库（GitHub/GitLab/Bitbucket）

4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (保持默认，vercel.json 已配置)
   - **Build Command**: `cd web-ui && npm install && npm run build`
   - **Output Directory**: `web-ui/.next`

5. 添加环境变量：
   - 点击 "Environment Variables"
   - 添加 `OPENROUTER_API_KEY` 及其值
   - （可选）添加 `SITE_NAME`

6. 点击 "Deploy" 开始部署

## 配置说明

### vercel.json

项目根目录的 `vercel.json` 配置了以下内容：

```json
{
  "buildCommand": "cd web-ui && npm install && npm run build",
  "outputDirectory": "web-ui/.next",
  "installCommand": "cd web-ui && npm install",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "env": {
    "OPENROUTER_API_KEY": "@openrouter_api_key",
    "SITE_URL": "@site_url",
    "SITE_NAME": "@site_name"
  },
  "functions": {
    "web-ui/app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 60
    }
  }
}
```

**配置说明**：
- `buildCommand`: 构建命令，先进入 web-ui 目录安装依赖再构建
- `outputDirectory`: 输出目录为 web-ui/.next
- `framework`: 使用 Next.js 框架
- `regions`: 部署区域设置为香港（hkg1），可根据需要修改为其他区域
- `functions`: API 路由配置，设置 Node.js 20.x 运行时和 60 秒超时

### 区域选择

可用的 Vercel 区域代码：
- `hkg1`: 香港
- `sin1`: 新加坡
- `iad1`: 美国东部（华盛顿）
- `sfo1`: 美国西部（旧金山）
- `fra1`: 德国（法兰克福）

## API 路由

以下 API 端点已配置为 Vercel Serverless Functions：

- `POST /api/analyze` - 分析服装图片
- `POST /api/generate` - 生成新服装图片
- `POST /api/upload` - 上传图片
- `GET /api/results` - 获取分析结果
- `GET /api/image/[filename]` - 获取图片

## 本地测试

在部署前，建议先在本地测试：

```bash
cd web-ui
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 部署后验证

1. 访问 Vercel 提供的 URL
2. 测试图片上传功能
3. 测试图片生成功能
4. 检查 Vercel Dashboard 的日志确认 API 调用正常

## 常见问题

### 1. API 超时

如果 API 请求超时，可以在 `vercel.json` 中增加 `maxDuration`：

```json
"functions": {
  "web-ui/app/api/**/*.ts": {
    "runtime": "nodejs20.x",
    "maxDuration": 300
  }
}
```

**注意**: 免费账户最大超时为 10 秒，Pro 账户为 60 秒，Enterprise 账户为 900 秒。

### 2. 环境变量未生效

确保在 Vercel Dashboard 的项目设置中正确添加了环境变量，并重新部署。

### 3. 构建失败

检查 Vercel 构建日志，确认：
- `web-ui` 目录下的依赖已正确安装
- TypeScript 编译无错误
- Next.js 配置正确

### 4. OpenAI 依赖问题

确保 `web-ui/package.json` 包含 OpenAI 依赖：

```json
"dependencies": {
  "openai": "^4.0.0"
}
```

## 更新部署

### 使用 Git 自动部署

连接 Git 仓库后，每次推送到主分支都会自动触发部署。

### 手动重新部署

在 Vercel Dashboard 中：
1. 选择项目
2. 进入 "Deployments" 标签
3. 点击最新部署旁的 "..." 菜单
4. 选择 "Redeploy"

## 监控和日志

在 Vercel Dashboard 中可以查看：
- **Deployments**: 部署历史和状态
- **Functions**: Serverless Functions 的执行日志
- **Analytics**: 访问分析（需要订阅）
- **Logs**: 实时日志

## 性能优化建议

1. **启用 Edge Functions**: 对于不需要完整 Node.js 运行时的 API，考虑使用 Edge Functions
2. **图片优化**: 使用 Next.js Image 组件自动优化图片
3. **缓存策略**: 合理设置 API 响应的缓存头
4. **代码分割**: Next.js 自动进行代码分割，确保页面按需加载

## 安全建议

1. **API Key 保护**: 确保 `OPENROUTER_API_KEY` 只在服务端使用，不要暴露到客户端
2. **速率限制**: 在 API 路由中实现速率限制，防止滥用
3. **输入验证**: 对所有用户输入进行验证和清理
4. **HTTPS**: Vercel 自动提供 HTTPS，确保所有请求都通过 HTTPS

## 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [OpenRouter API 文档](https://openrouter.ai/docs)
