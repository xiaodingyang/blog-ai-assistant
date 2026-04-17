#!/bin/bash

# Blog AI Assistant - 一键发布脚本
# 使用方法：bash publish.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "Blog AI Assistant - 一键发布脚本"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录执行此脚本"
    exit 1
fi

echo "📋 步骤 1/4: 检查 Git 状态"
echo "------------------------------------------"
git status
echo ""

read -p "是否继续推送到 GitHub? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 1
fi

echo ""
echo "📤 步骤 2/4: 推送到 GitHub"
echo "------------------------------------------"

# 检查是否已添加远程仓库
if git remote | grep -q "origin"; then
    echo "✅ 远程仓库已存在"
else
    echo "➕ 添加远程仓库..."
    git remote add origin https://github.com/xdy-npm/blog-ai-assistant.git
fi

echo "🚀 推送代码到 GitHub..."
git branch -M main
git push -u origin main

echo "✅ 代码已推送到 GitHub"
echo ""

read -p "是否继续发布到 npm? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ GitHub 推送完成！"
    echo "📦 npm 发布已跳过"
    exit 0
fi

echo ""
echo "🔐 步骤 3/4: 检查 npm 登录状态"
echo "------------------------------------------"

if npm whoami > /dev/null 2>&1; then
    NPM_USER=$(npm whoami)
    echo "✅ 已登录 npm，用户名: $NPM_USER"
else
    echo "❌ 未登录 npm"
    echo "请先执行: npm login"
    exit 1
fi

echo ""
echo "📦 步骤 4/4: 发布到 npm"
echo "------------------------------------------"

echo "📦 发布 @xdy-npm/blog-ai-assistant-core..."
cd packages/core
npm publish --access public
echo "✅ core 包发布成功"

echo ""
echo "📦 发布 @xdy-npm/blog-ai-assistant-server..."
cd ../server
npm publish --access public
echo "✅ server 包发布成功"

echo ""
echo "📦 发布 @xdy-npm/blog-ai-assistant-react..."
cd ../react
npm publish --access public
echo "✅ react 包发布成功"

cd ../..

echo ""
echo "=========================================="
echo "🎉 发布完成！"
echo "=========================================="
echo ""
echo "📍 GitHub: https://github.com/xdy-npm/blog-ai-assistant"
echo "📦 npm core: https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-core"
echo "📦 npm server: https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-server"
echo "📦 npm react: https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-react"
echo ""
echo "🎊 恭喜！你的开源项目已成功发布！"
