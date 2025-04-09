# CodeMirror Symbol Tree Extension

This CodeMirror extension provides a **Symbol Tree sidebar** for visualizing the symbols in your code. It allows you to explore the structure of your code just like the **Outline view** in Visual Studio Code. The sidebar displays a hierarchical tree of symbols (functions, classes, variables, etc.) with nesting, making it easier to navigate large codebases.

The extension leverages the **Abstract Syntax Tree (AST)** from any language extension used for syntax highlighting. The symbol identification uses basic classification techniques, so while it works for many languages, it may not be 100% accurate for all language extensions.

## Supported Languages
- **Tested Languages**:
    - TypeScript
    - C
    - Python

- **Other Languages**:
    - May work with other language extensions, but accuracy can vary.

## Installation

Since this extension is not yet available on NPM, you can clone the repository and use it directly.

1. **Clone the repository**:

```bash
git clone https://github.com/GavinRigsby/codemirror-symboltree.git
```

2. **Import the extension**:

After cloning the repository, import the `symbolTree` extension from the appropriate path in your project.

```TypeScript
import { symbolTree } from "path/to/extension/index";  // Adjust the path as needed
```

## Usage

You can import the `symbolTree` extension and use it like any other CodeMirror extension. Here's an example of how to integrate it into your editor:

```TypeScript
import { EditorView } from "@codemirror/view";
import { symbolTree } from "path/to/extension/index";  // Import the symbolTree extension
import { languageExtension } from "@codemirror-lang-language_name"; // Your language extension

let Editor = new EditorView({
    doc: file_content,
    extensions: [
        basicSetup,
        symbolTree,
        languageExtension,
        themeExtension
    ],
    parent: container,
});
```

## Configuration

You can customize the appearance and behavior of the sidebar, such as the dock side and visibility. To update settings after initializing the editor:

```TypeScript
const symbolTreePlugin = Editor.plugin(symbolTree);

if (symbolTreePlugin) {
    symbolTreePlugin.updateOptions({
        side: 'right',  // Can be 'right' or 'left' (default is left)
        visible: true,  // If the extension is visible (default is true)
        eventHandlers: {
            // Custom event handlers can be added here (Will overwrite defaults)
        }
    });
}
```

### Options:
- **side**: Controls which side the Symbol Tree is docked (`'left'` or `'right'`).
- **visible**: Determines if the Symbol Tree is visible (default is `true`).
- **eventHandlers**: Attach custom event handlers to Symbol Tree nodes.

## Event Handlers

You can define event handlers for actions like clicking, double-clicking, or right-clicking on nodes in the Symbol Tree.

The handlers are defined as follows:

```TypeScript
export interface NodeMouseEvent {
    node: SymbolNode;
    event: MouseEvent;
}

export interface NodeKeyboardEvent {
    node: SymbolNode;
    event: KeyboardEvent;
}

export interface TreeNodeEventHandlers {
    onClick?: (event: NodeMouseEvent) => void;
    onDoubleClick?: (event: NodeMouseEvent) => void;
    onContextMenu?: (event: NodeMouseEvent) => void;
}
```

### Default Behavior:
- **onClick**: Scrolls to the clicked symbol node.
- **onDoubleClick**: Selects the code section corresponding to the symbol node.

You can override these default actions or define custom behavior as needed.

## Symbols and Node Types

The extension uses **Codicons** (the same icon set used in Visual Studio Code) to represent the types of symbols in the tree. These icons help indicate the type of each symbol (e.g., class, function, variable).

## Contributing

We welcome contributions! If you'd like to improve the extension, fix bugs, or add new features, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

---
For more information, check out the [CodeMirror documentation](https://codemirror.net/) and the [Codicons library](https://microsoft.github.io/vscode-codicons/).
