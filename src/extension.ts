import * as vscode from 'vscode';
import fetch from 'node-fetch';

// 存储最近的用户输入
let lastUserInput: string = '';

export function activate(context: vscode.ExtensionContext) {
	// 原有的命令面板命令
	let disposable = vscode.commands.registerCommand('shell-ai-completion-helper.generateCommand', async () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (!activeTerminal) {
			vscode.window.showErrorMessage('No active terminal found.');
			return;
		}

		const userPrompt = await vscode.window.showInputBox({
			placeHolder: "e.g., find all files larger than 10MB in the current directory",
			prompt: "Describe the command you want to generate",
			ignoreFocusOut: true,
		});

		if (!userPrompt) {
			return;
		}

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "AI is generating your command...",
			cancellable: false
		}, async () => {
			const generatedCommand = await callLLM(userPrompt);
			if (generatedCommand) {
				activeTerminal.sendText(generatedCommand, false);
			}
			// 如果 generatedCommand 为 null，错误消息已在 callLLM 内部显示
		});
	});

	// 快捷键触发命令 - 使用选中文本或输入框
	// 快捷键触发命令 - 智能获取选中文本（兼容编辑器和终端）
	let quickGenerateDisposable = vscode.commands.registerCommand('shell-ai-completion-helper.quickGenerate', async () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (!activeTerminal) {
			vscode.window.showErrorMessage('No active terminal found.');
			return;
		}

		let userPrompt = '';

		// 1. 尝试从激活的文本编辑器获取选中文本
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && !activeEditor.selection.isEmpty) {
			userPrompt = activeEditor.document.getText(activeEditor.selection).trim();
		}

		// 2. 如果编辑器没有选中文本，尝试从终端复制选中文本
		// 这是解决问题的关键：我们无法直接读取终端选择，但可以命令它复制，然后我们再读取剪贴板
		if (!userPrompt && vscode.window.activeTerminal) {
			await vscode.commands.executeCommand('workbench.action.terminal.copySelection');
			const clipboardText = await vscode.env.clipboard.readText();
			// 确保剪贴板内容不是空的，以防用户并没有在终端选择任何内容
			if (clipboardText) {
				userPrompt = clipboardText.trim();
			}
		}

		// 如果选中的文本以 # 开头（通常是注释），则去除 # 号
		if (userPrompt.startsWith('#')) {
			userPrompt = userPrompt.substring(1).trim();
		}

		// 3. 将获取到的文本作为默认值，弹出输入框让用户确认或修改
		// 这样做体验更好，因为用户可以看到将要发送给AI的内容，并有机会编辑它。
		const finalPrompt = await vscode.window.showInputBox({
			placeHolder: "e.g., 压缩/root/test目录为tar",
			prompt: "请确认或输入要生成的命令描述",
			// 将找到的文本（来自编辑器或终端）作为输入框的默认值
			value: userPrompt,
			ignoreFocusOut: true,
		});

		// 如果用户取消了输入，则直接返回
		if (!finalPrompt) {
			return;
		}

		// 使用最终确认的文本调用AI
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "AI is generating your command...",
			cancellable: false
		}, async () => {
			const generatedCommand = await callLLM(finalPrompt);
			if (generatedCommand) {
				// 在新行输出生成的命令，避免和当前行混淆
				activeTerminal.sendText('\n' + generatedCommand, false);
			}
		});
	});

	// 由于VSCode API限制，我们使用一个替代方案
	// 当用户按快捷键时，我们会提示用户输入或从剪贴板读取
	let alternativeQuickGenerate = vscode.commands.registerCommand('shell-ai-completion-helper.quickGenerateAlternative', async () => {
		const activeTerminal = vscode.window.activeTerminal;
		if (!activeTerminal) {
			vscode.window.showErrorMessage('No active terminal found.');
			return;
		}

		// 尝试从剪贴板读取内容
		let clipboardText = '';
		try {
			clipboardText = await vscode.env.clipboard.readText();
		} catch (error) {
			// 忽略剪贴板读取错误
		}

		// 检查剪贴板内容是否以 # 开头
		let userPrompt = '';
		if (clipboardText.trim().startsWith('#')) {
			userPrompt = clipboardText.trim().substring(1).trim();
		}

		// 如果剪贴板没有有效内容，提示用户输入
		if (!userPrompt) {
			const inputPrompt = await vscode.window.showInputBox({
				placeHolder: "e.g., 压缩/root/test目录为tar",
				prompt: "请输入要生成的命令描述（或先在终端输入以#开头的注释，然后复制到剪贴板）",
				ignoreFocusOut: true,
			});

			if (!inputPrompt) {
				return;
			}
			userPrompt = inputPrompt;
		}

		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "AI is generating your command...",
			cancellable: false
		}, async () => {
			const generatedCommand = await callLLM(userPrompt);
			if (generatedCommand) {
				// 在新行输出生成的命令
				activeTerminal.sendText('\n' + generatedCommand, false);
			}
		});
	});

	context.subscriptions.push(disposable, quickGenerateDisposable, alternativeQuickGenerate);
}

async function callLLM(prompt: string): Promise<string | null> {
	const config = vscode.workspace.getConfiguration('myTerminalAI');
	const apiKey = config.get<string>('apiKey');
	const apiEndpoint = config.get<string>('apiEndpoint');
	const modelName = config.get<string>('modelName');
	if (!apiKey) {
		vscode.window.showErrorMessage(
			'API Key not configured for My Terminal AI.',
			'Open Settings'
		).then(selection => {
			if (selection === 'Open Settings') {
				vscode.commands.executeCommand('workbench.action.openSettings', 'myTerminalAI.apiKey');
			}
		});
		return null;
	}
	const systemPrompt = `You are a zsh shell expert, please help me complete the following command, you should only output the completed command, no need to include any other explanation. Do not put completed command in a code block.`;

	try {
		const response = await fetch(apiEndpoint!, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: modelName,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: prompt }
				],
				max_tokens: 500,
				temperature: 0.1,
				stream: false,
			}),
			timeout: 15000,
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error('API Error Response:', errorBody);
			throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
		}

		const data = await response.json() as any;
		const command = data.choices?.[0]?.message?.content;
		if (typeof command === 'string' && command.trim().length > 0) {
			return command.trim();
		} else {
			vscode.window.showWarningMessage('The AI model returned an empty or invalid command.');
			return null;
		}
	} catch (error: any) {
		console.error("Failed to call LLM API:", error);
		vscode.window.showErrorMessage(`Error generating command: ${error.message}`);
		return null;
	}
}

export function deactivate() { }