# 发布到 npm 指南

## 前置准备

### 1. 注册 npm 账号

访问 https://www.npmjs.com/signup 注册账号。

### 2. 登录 npm

```bash
npm login
```

输入用户名、密码和邮箱。

### 3. 验证登录状态

```bash
npm whoami
```

应该显示你的用户名。

## 发布流程

### 方式一：手动发布（推荐首次发布）

```bash
cd c:/Users/34662/Desktop/work/blog-ai-assistant

# 1. 确保代码已构建
cd packages/core && pnpm build
cd ../server && pnpm build
cd ../react && pnpm build

# 2. 发布 core 包
cd packages/core
npm publish --access public

# 3. 发布 server 包
cd ../server
npm publish --access public

# 4. 发布 react 包
cd ../react
npm publish --access public
```

### 方式二：使用 GitHub Actions 自动发布

1. 在 npm 生成 Access Token：
   - 访问 https://www.npmjs.com/settings/your-username/tokens
   - 点击 "Generate New Token" → "Classic Token"
   - 选择 "Automation"
   - 复制生成的 token

2. 在 GitHub 仓库添加 Secret：
   - 访问 https://github.com/xiaodingyang/blog-ai-assistant/settings/secrets/actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴刚才复制的 token
   - 点击 "Add secret"

3. 创建版本标签并推送：
   ```bash
   cd c:/Users/34662/Desktop/work/blog-ai-assistant
   
   git tag v0.1.0
   git push origin v0.1.0
   ```

4. GitHub Actions 会自动构建并发布到 npm

## 版本更新

### 更新版本号

```bash
# 补丁版本（bug 修复）：0.1.0 -> 0.1.1
cd packages/core && npm version patch
cd ../server && npm version patch
cd ../react && npm version patch

# 次版本（新功能）：0.1.0 -> 0.2.0
cd packages/core && npm version minor
cd ../server && npm version minor
cd ../react && npm version minor

# 主版本（破坏性更新）：0.1.0 -> 1.0.0
cd packages/core && npm version major
cd ../server && npm version major
cd ../react && npm version major
```

### 发布新版本

```bash
# 手动发布
cd packages/core && npm publish
cd ../server && npm publish
cd ../react && npm publish

# 或使用 GitHub Actions
git tag v0.1.1
git push origin v0.1.1
```

## 验证发布

发布成功后，访问：
- https://www.npmjs.com/package/@xiaodingyang/blog-ai-assistant-core
- https://www.npmjs.com/package/@xiaodingyang/blog-ai-assistant-server
- https://www.npmjs.com/package/@xiaodingyang/blog-ai-assistant-react

## 常见问题

### 1. 403 Forbidden

确保：
- 已登录 npm：`npm whoami`
- 包名未被占用
- 使用 `--access public` 发布 scoped 包

### 2. 包名冲突

如果 `@xdy-npm` scope 不可用，需要：
1. 在 npm 创建 organization
2. 或使用其他 scope 名称

### 3. 版本号已存在

不能发布相同版本号，需要更新版本：
```bash
npm version patch
```

## 撤销发布

⚠️ 谨慎使用！发布后 72 小时内可撤销：

```bash
npm unpublish @xiaodingyang/blog-ai-assistant-core@0.1.0
```

## 下一步

发布成功后：
1. 在 README 中添加 npm 徽章
2. 在 GitHub 创建 Release
3. 更新 CHANGELOG.md
4. 在社区分享你的项目
