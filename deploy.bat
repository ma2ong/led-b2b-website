@echo off
echo ========================================
echo    LED B2B网站自动部署助手
echo ========================================
echo.
echo 正在启动部署助手...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org
    pause
    exit /b 1
)

REM 运行部署助手
node deploy-assistant.js

echo.
echo 部署助手已结束
pause