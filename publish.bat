@echo off
REM Blog AI Assistant - 一键发布脚本 (Windows)
REM 使用方法：双击运行或在命令行执行 publish.bat

echo ==========================================
echo Blog AI Assistant - 一键发布脚本
echo ==========================================
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误：请在项目根目录执行此脚本
    pause
    exit /b 1
)

echo 📋 步骤 1/4: 检查 Git 状态
echo ------------------------------------------
git status
echo.

set /p CONTINUE_GITHUB="是否继续推送到 GitHub? (y/n): "
if /i not "%CONTINUE_GITHUB%"=="y" (
    echo ❌ 已取消
    pause
    exit /b 1
)

echo.
echo 📤 步骤 2/4: 推送到 GitHub
echo ------------------------------------------

REM 检查是否已添加远程仓库
git remote | findstr "origin" >nul
if %errorlevel% equ 0 (
    echo ✅ 远程仓库已存在
) else (
    echo ➕ 添加远程仓库...
    git remote add origin https://github.com/xdy-npm/blog-ai-assistant.git
)

echo 🚀 推送代码到 GitHub...
git branch -M main
git push -u origin main

if %errorlevel% neq 0 (
    echo ❌ GitHub 推送失败
    echo 💡 提示：请先在 GitHub 创建仓库 blog-ai-assistant
    pause
    exit /b 1
)

echo ✅ 代码已推送到 GitHub
echo.

set /p CONTINUE_NPM="是否继续发布到 npm? (y/n): "
if /i not "%CONTINUE_NPM%"=="y" (
    echo ✅ GitHub 推送完成！
    echo 📦 npm 发布已跳过
    pause
    exit /b 0
)

echo.
echo 🔐 步骤 3/4: 检查 npm 登录状态
echo ------------------------------------------

npm whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未登录 npm
    echo 请先执行: npm login
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm whoami') do set NPM_USER=%%i
echo ✅ 已登录 npm，用户名: %NPM_USER%

echo.
echo 📦 步骤 4/4: 发布到 npm
echo ------------------------------------------

echo 📦 发布 @xdy-npm/blog-ai-assistant-core...
cd packages\core
call npm publish --access public
if %errorlevel% neq 0 (
    echo ❌ core 包发布失败
    cd ..\..
    pause
    exit /b 1
)
echo ✅ core 包发布成功

echo.
echo 📦 发布 @xdy-npm/blog-ai-assistant-server...
cd ..\server
call npm publish --access public
if %errorlevel% neq 0 (
    echo ❌ server 包发布失败
    cd ..\..
    pause
    exit /b 1
)
echo ✅ server 包发布成功

echo.
echo 📦 发布 @xdy-npm/blog-ai-assistant-react...
cd ..\react
call npm publish --access public
if %errorlevel% neq 0 (
    echo ❌ react 包发布失败
    cd ..\..
    pause
    exit /b 1
)
echo ✅ react 包发布成功

cd ..\..

echo.
echo ==========================================
echo 🎉 发布完成！
echo ==========================================
echo.
echo 📍 GitHub: https://github.com/xdy-npm/blog-ai-assistant
echo 📦 npm core: https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-core
echo 📦 npm server: https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-server
echo 📦 npm react: https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-react
echo.
echo 🎊 恭喜！你的开源项目已成功发布！
echo.
pause
