import * as vscode from 'vscode';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
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

	context.subscriptions.push(disposable);
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