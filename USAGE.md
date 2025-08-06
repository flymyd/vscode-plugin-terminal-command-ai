# Shell AI Completion Helper - 使用说明

这个VSCode插件提供了AI驱动的终端命令生成功能，支持多种使用方式。

## 功能特性

- 🚀 **快捷键触发**: 通过快捷键快速生成命令
- 📝 **多种输入方式**: 支持选中文本、剪贴板、手动输入
- 🖥️ **跨平台**: 支持Windows和macOS的不同快捷键
- ⚙️ **可配置**: 支持自定义API端点和模型

## 使用方法

### 快捷键 + 选中文本（推荐）

1. 在终端或任意文件中输入注释：
   ```bash
   # 压缩/root/test目录为tar文件
   ```

2. 选中这行文本

3. 按快捷键：
   - **Windows/Linux**: `Ctrl + Shift + X`
   - **macOS**: `Cmd + Shift + X`

4. AI会在终端中生成对应的命令：
   ```bash
   tar -cvf /root/test.tar /root/test
   ```

### 方法2: 快捷键 + 手动输入

1. 按快捷键（如果没有选中文本或剪贴板内容）
2. 在弹出的输入框中输入命令描述
3. AI生成对应的命令

### 方法3: 命令面板

1. 按 `Cmd + Shift + P` (macOS) 或 `Ctrl + Shift + P` (Windows/Linux)
2. 输入 "TerminalCommandAI: Generate Terminal Command"
3. 在输入框中描述要生成的命令

## 配置说明

在VSCode设置中配置以下选项：

- **API Endpoint**: LLM服务的API端点（默认：OpenAI）
- **Model Name**: 使用的模型名称（默认：gpt-4o-mini）
- **API Key**: 你的API密钥
- **Quick Generate Keybinding**: 自定义快捷键（默认：ctrl+x）
- 可选值：`ctrl+shift+x`, `ctrl+x`, `ctrl+shift+g`, `ctrl+alt+x`

## 使用技巧

1. **注释格式**: 以 `#` 开头的文本会被识别为命令描述
2. **中文支持**: 完全支持中文描述，如 "# 压缩文件夹"
3. **复杂命令**: 可以描述复杂的操作，AI会生成相应的命令组合
4. **终端焦点**: 确保终端窗口处于活动状态时使用快捷键

## 示例

```bash
# 查找当前目录下所有.js文件
# 结果: find . -name "*.js" -type f

# 创建一个新的git分支并切换
# 结果: git checkout -b new-branch-name

# 压缩整个项目目录，排除node_modules
# 结果: tar --exclude='node_modules' -czf project.tar.gz .

# 查看端口8080的占用情况
# 结果: lsof -i :8080
```

## 故障排除

1. **快捷键不工作**: 确保终端窗口处于焦点状态
2. **API错误**: 检查API密钥和端点配置
3. **没有生成命令**: 确保输入的描述清晰明确
4. **权限问题**: 某些命令可能需要sudo权限

## 注意事项

- 生成的命令仅供参考，执行前请仔细检查
- 涉及系统关键操作的命令请谨慎使用
- API调用可能产生费用，请注意使用频率