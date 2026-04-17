# GitHub 仓库创建步骤

## 1. 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `blog-ai-assistant`
   - Description: `轻量级博客 AI 问答助手，基于 RAG 架构，支持文章检索和分类扩展`
   - Public（公开）
   - ❌ 不要勾选 "Add a README file"
   - ❌ 不要勾选 "Add .gitignore"
   - ❌ 不要勾选 "Choose a license"
3. 点击 "Create repository"

## 2. 推送代码到 GitHub

创建完成后，在本地执行：

```bash
cd c:/Users/34662/Desktop/work/blog-ai-assistant

# 添加远程仓库
git remote add origin https://github.com/xiaodingyang/blog-ai-assistant.git

# 推送代码
git branch -M main
git push -u origin main
```

## 3. 验证

访问 https://github.com/xiaodingyang/blog-ai-assistant 查看代码是否上传成功。

---

**下一步：发布到 npm**
