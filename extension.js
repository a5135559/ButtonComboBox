const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Register button commands
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.button1Clicked', () => {
            openWebviewPanel.createOrShow(context.extensionUri);
        }),
        vscode.commands.registerCommand('extension.button2Clicked', () => {
            vscode.window.showInformationMessage('Button 2 clicked!');
        })
    );

    // Create the view container
    const view = vscode.window.createTreeView('buttonView', {
        treeDataProvider: new ButtonViewDataProvider(),
        showCollapseAll: true
    });
}

class openWebviewPanel{
    constructor(extensionUri){
        this._extensionUri = extensionUri;
    }

    static createOrShow(){
        if(!openWebviewPanel.currentPanel){
            const panel = vscode.window.createWebviewPanel(
                'buttonWebview',
                'Button Webview',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            // Set the webview's content with a message and a combobox
            panel.webview.html = getWebviewContent();

            // Set up the webview panel message listener
            panel.webview.onDidReceiveMessage(message => {
                switch(message.command){
                    case 'optionSelected':
                        vscode.window.showInformationMessage(`Selected option: ${message.option}`);
                        return;
                }
            });

            panel.onDidDispose(() =>{ 
                openWebviewPanel.currentPanel = undefined;
            })
            openWebviewPanel.currentPanel = panel;
        }else{
            openWebviewPanel.currentPanel.reveal();
        }
    } 
}

function getWebviewContent(){
    return `<!DOCTYPE html>
    <html lang="en">
    <h1>Hello from Button Webview!</h1>
    <label for="options">Select an option:</label>
    <select id="options">
        <option value="option_1">Option 1</option>
        <option value="option_2">Option 2</option>
        <option value="option_3">Option 3</option>
    </select>
    <button id="submit">Submit</button>
    <script>
        const vscode = acquireVsCodeApi();
        const select = document.getElementById('options');
        const submitButton = document.getElementById('submit');

        submitButton.addEventListener('click', event => {
            const selectedOption = select.value;
            vscode.postMessage({ command: 'optionSelected', option: selectedOption })
        }, true);
    </script>
    `;
}

class ButtonViewDataProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        // Return the buttons as children of the root element
        return [
            new ButtonItem('Button 1', 'extension.button1Clicked'),
            new ButtonItem('Button 2', 'extension.button2Clicked')
        ];
    }
}

class ButtonItem {
    constructor(label, command) {
        this.label = label;
        this.command = {
            command,
            title: label
        };
    }
}

module.exports = {
    activate
};
