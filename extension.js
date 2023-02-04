const vscode = require('vscode');
const path = require('path')
const fs = require('fs');

const createDirectory = (activeUri, componentName) => {
	const isDir = fs.existsSync(activeUri) && fs.lstatSync(activeUri).isDirectory();

	let lastpath = isDir ? activeUri : path.dirname(activeUri)
	let newFolderPath = path.join(lastpath, componentName)
	fs.mkdirSync(newFolderPath)

	return newFolderPath
}

const createComponent = (uri, componentName) => {
	try {
		const config = vscode.workspace.getConfiguration('create-react-component');
		const wsedit = new vscode.WorkspaceEdit();
		const componentTemplateFileName = path.join(__dirname, 'templates', 'component.template.jsx');
		const indexTemplateFileName = path.join(__dirname, 'templates', 'index.template.js');

		let indexContent = fs.readFileSync(indexTemplateFileName).toString()
			.replace(/__COMPONENT_NAME__/g, componentName)

		let componentContent = fs.readFileSync(componentTemplateFileName).toString()
			.replace(/__COMPONENT_NAME__/g, componentName)

		const indexFileUri = vscode.Uri.file(uri + `/index.js`);
		wsedit.createFile(indexFileUri);
		wsedit.insert(indexFileUri, new vscode.Position(0, 0), indexContent);

		const componentFileUri = vscode.Uri.file(uri + `/${componentName}.${config.componentExtension}`);
		wsedit.createFile(componentFileUri)
		wsedit.insert(componentFileUri, new vscode.Position(0, 0), componentContent)

		const stylesFileUri = vscode.Uri.file(uri + `/${componentName}.module.${config.stylesExtension}`);
		wsedit.createFile(stylesFileUri)

		vscode.workspace.applyEdit(wsedit);
		vscode.workspace
	} catch (error) {
		console.log(error);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('create-react-component.createComponent', async function (folder) {
		const componentName = await vscode.window.showInputBox({
			placeHolder: "ComponentName",
			prompt: "Enter component name",
		});

		const uri = folder;
		const componentPath = createDirectory(uri.fsPath, componentName);
		createComponent(componentPath, componentName);
	});
	context.subscriptions.push(disposable);
}

module.exports = {
	activate
}
