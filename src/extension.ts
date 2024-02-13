import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("vscode-barrel-generator.generate", () => {
		if (!vscode.window.activeTextEditor) {
			vscode.window.showErrorMessage("No active text editor found");
			return;
		}
		const editor = vscode.window.activeTextEditor!;

		if (path.basename(editor.document.uri.path) !== "index.ts") {
			vscode.window.showErrorMessage("Please run this command from an index.ts file");
			return;
		}

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		if (!workspaceFolder) {
			vscode.window.showErrorMessage("No workspace folder found");
			return;
		}

		const workspaceFolderPath: string = workspaceFolder!.uri.path;
		const currentFilePath = path.normalize(path.dirname(editor.document.uri.path));
		const relativePath = path.relative(workspaceFolderPath, currentFilePath);

		const relativeSearchPattern = new vscode.RelativePattern(
			workspaceFolderPath,
			relativePath + "/**/*.{ts,tsx}"
		);

		const files = vscode.workspace.findFiles(relativeSearchPattern);

		const lines = new Array<string>();
		const directoriesToSkip = new Array<string>();

		files.then(uris => {
			if (!uris || uris.length === 0) {
				vscode.window.showErrorMessage("No files found to import");
				return;
			}
			uris.forEach(uri => {
				const relativePath = path.relative(currentFilePath, uri.path);
				const fileName = path.basename(uri.path);
				if (fileName !== "index.ts") {
					lines.push(relativePath);
				} else {
					const dir = path.dirname(relativePath);
					if (dir !== ".") {
						directoriesToSkip.push(path.dirname(relativePath));
					}
				}
			});
			const barrelContent = lines
				.filter(line => !directoriesToSkip.includes(path.dirname(line)))
				.sort()
				.map(l => `export * from "./${l.replace(/\\/g, "/")}";`)
				.join("\n");

			const barrelPath = `${currentFilePath}/index.ts`;
			vscode.workspace.fs.writeFile(
				vscode.Uri.file(barrelPath),
				new TextEncoder().encode(barrelContent)
			);
		});
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}
