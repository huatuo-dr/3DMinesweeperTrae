# GitHub Pages 部署指南

本文档将指导你如何使用 GitHub Actions 将 3D Minesweeper 游戏自动部署到 GitHub Pages。

## 前置条件

1.  你需要一个 [GitHub](https://github.com/) 账号。
2.  你的本地代码已经关联到了一个 GitHub 仓库。

## 步骤一：确认自动化配置

项目已经内置了自动化部署配置 (`.github/workflows/deploy.yml`)。
只要你将代码推送到 `main` 或 `master` 分支，GitHub Actions 就会自动触发构建和部署流程。

## 步骤二：配置 GitHub 仓库权限（关键）

为了让自动化脚本有权限将构建好的代码推送到你的仓库，你需要进行以下设置：

1.  登录 GitHub，进入你的 **3Dminesweeper** 仓库页面。
2.  点击顶部导航栏的 **Settings**（设置）。
3.  在左侧侧边栏中，向下滚动找到 **Actions**，点击展开，然后选择 **General**。
4.  在右侧页面中，向下滚动到最底部的 **Workflow permissions**（工作流权限）区域。
5.  勾选 **Read and write permissions**（读写权限）。
6.  点击 **Save**（保存）按钮。

## 步骤三：推送代码

在你的本地终端中，执行以下命令将代码推送到 GitHub：

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "配置 GitHub Actions 自动部署"

# 推送到远程仓库
git push
```

## 步骤四：查看部署进度

1.  回到 GitHub 仓库页面。
2.  点击顶部导航栏的 **Actions**。
3.  你应该能看到一个名为 **Deploy to GitHub Pages** 的工作流正在运行（黄色旋转图标）。
4.  等待图标变成绿色对勾（✅），表示构建和部署成功。

## 步骤五：开启 GitHub Pages

1.  点击顶部导航栏的 **Settings**（设置）。
2.  在左侧侧边栏中，找到 **Pages**（页面）。
3.  在 **Build and deployment**（构建和部署）区域：
    *   **Source**: 确保选择 `Deploy from a branch`。
    *   **Branch**: 选择 `gh-pages` 分支（这是自动化脚本自动创建的分支），文件夹选择 `/ (root)`。
4.  点击 **Save**（保存）。

## 步骤六：访问你的游戏

设置保存后，GitHub Pages 页面顶部会显示类似如下的提示：

> Your site is live at `https://<你的用户名>.github.io/3DMinesweeperTrae/`

点击该链接，即可开始游玩你的 3D 扫雷游戏！

## 常见问题

**Q: 打开页面是空白的？**
A: 
1. 检查 `vite.config.ts` 中的 `base` 配置是否正确。默认为 `/3DMinesweeperTrae/`，这要求你的 GitHub 仓库名必须是 `3DMinesweeperTrae`。如果你的仓库名不同，请修改 `base` 为 `/你的仓库名/`。
2. 确保在 GitHub Pages 设置中选择了正确的分支 (`gh-pages`)。

**Q: 刷新页面出现 404 错误？**
A: 项目已配置使用 `HashRouter`（在 URL 中带有 `#`），这兼容 GitHub Pages。如果你修改回了 `BrowserRouter`，刷新非根路径会导致 404。
