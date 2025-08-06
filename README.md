# Terminal Command AI

[![Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher.your-extension-name.svg)](https://marketplace.visualstudio.com/items?itemName=your-publisher.your-extension-name)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/your-publisher.your-extension-name.svg)](https://marketplace.visualstudio.com/items?itemName=your-publisher.your-extension-name)

[简体中文](./README_zh-CN.md) | English

This VSCode extension provides AI-powered terminal command generation with multiple ways to use it.

## Features

- 🚀 **Hotkey Trigger**: Quickly generate commands with a keyboard shortcut.
- 📝 **Multiple Input Methods**: Supports selected text, clipboard content, and manual input.
- 🖥️ **Cross-Platform**: Supports different hotkeys for Windows, Linux, and macOS.
- ⚙️ **Configurable**: Customize the API endpoint, model, and other settings.

## How to Use

### Method 1: Hotkey + Selected Text (Recommended)

1.  Type a comment in the terminal or any file:
    ```bash
    # Compress the /root/test directory into a tar file
    ```
2.  Select this line of text.
3.  Press the hotkey:
    -   **Windows/Linux**: `Ctrl + Shift + X`
    -   **macOS**: `Cmd + Shift + X`
4.  The AI will generate the corresponding command in the terminal:
    ```bash
    tar -cvf /root/test.tar /root/test
    ```

### Method 2: Hotkey + Manual Input

1.  Press the hotkey without any selected text or clipboard content.
2.  Enter a description of the command in the input box that appears.
3.  The AI will generate the corresponding command.

### Method 3: Command Palette

1.  Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux).
2.  Type "TerminalCommandAI: Generate Terminal Command".
3.  Describe the command you want to generate in the input box.

## Configuration

Configure the following options in your VSCode settings:

-   **`terminalCommandAI.apiEndpoint`**: The API endpoint for the LLM service (Default: OpenAI).
-   **`terminalCommandAI.modelName`**: The name of the model to use (Default: `gpt-4o-mini`).
-   **`terminalCommandAI.apiKey`**: Your API key.
-   **`terminalCommandAI.quickGenerateKeybinding`**: Customize the quick generation hotkey (Default: `ctrl+x`).
    -   Available options: `ctrl+shift+x`, `ctrl+x`, `ctrl+shift+g`, `ctrl+alt+x`.
-   **`terminalCommandAI.terminalPreference`**: Choose your preferred terminal language/shell.

## Pro Tips

1.  **Comment Format**: Text starting with `#` is recognized as a command description.
2.  **Multi-language Support**: Works well with descriptions in any language, e.g., "# 压缩文件夹".
3.  **Complex Commands**: Describe complex operations, and the AI will generate the corresponding command pipelines.
4.  **Terminal Focus**: Ensure the terminal window is active when using the hotkey.

## Examples

```bash
# Find all .js files in the current directory
# Result: find . -name "*.js" -type f

# Create a new git branch and switch to it
# Result: git checkout -b new-branch-name

# Compress the entire project directory, excluding node_modules
# Result: tar --exclude='node_modules' -czf project.tar.gz .

# Check which process is using port 8080
# Result: lsof -i :8080
```

## Troubleshooting

1.  **Hotkey Not Working**: Make sure the terminal window is in focus.
2.  **API Error**: Check your API key and endpoint configuration in the settings.
3.  **No Command Generated**: Ensure your description is clear and specific.
4.  **Permission Issues**: Some commands may require `sudo` privileges to run.

## Disclaimer

-   The generated commands are for reference only. Please review them carefully before execution.
-   Use commands that modify system-critical files with extreme caution.
-   API calls may incur costs from your provider. Please monitor your usage.