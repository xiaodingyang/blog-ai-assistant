# Contributing to Blog AI Assistant

感谢你对本项目的关注！我们欢迎任何形式的贡献。

## 开发环境设置

1. Fork 本仓库
2. 克隆到本地：
   ```bash
   git clone https://github.com/your-username/blog-ai-assistant.git
   cd blog-ai-assistant
   ```
3. 安装依赖：
   ```bash
   pnpm install
   ```
4. 构建项目：
   ```bash
   cd packages/core && pnpm build
   cd ../server && pnpm build
   cd ../react && pnpm build
   ```

## 开发流程

1. 创建新分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. 进行修改并测试
3. 提交更改：
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```
4. 推送到你的 Fork：
   ```bash
   git push origin feature/your-feature-name
   ```
5. 创建 Pull Request

## 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 代码规范

- 使用 TypeScript
- 遵循 ESLint 和 Prettier 配置
- 为新功能添加测试
- 更新相关文档

## 问题反馈

如果你发现 bug 或有功能建议，请在 [Issues](https://github.com/xiaodingyang/blog-ai-assistant/issues) 中提出。

## 许可证

贡献的代码将遵循项目的 MIT 许可证。
