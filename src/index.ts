
import { defaultSymbolTreeOptions, NodeMouseEvent, SymbolNode, SymbolTreeOptionInputs, SymbolTreeOptions } from './SymbolNode';
import { EditorView, ViewPlugin, WidgetType, ViewUpdate } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { TreeView } from './TreeView';
import crelt from "crelt";

function displayTree(symbols: SymbolNode[], indent: string = '') {
    symbols.forEach(symbol => {
        // If the node has children, recursively display them with increased indentation
        if (symbol.children && symbol.children.length > 0) {
            console.log(`${indent}${symbol.name}:(${symbol.type})`)
            displayTree(symbol.children, indent + '  '); // Add some spaces for indentation
        }
    });
}

function extractSymbols(view: EditorView): SymbolNode[] {
    const tree = syntaxTree(view.state);
    const rootSymbols: SymbolNode[] = [];
    const stack: SymbolNode[] = [];
    const lastFiveNodes: string[] = [];

    tree.iterate({
        enter(node: SyntaxNode) {
            const name = view.state.doc.sliceString(node.from, node.to).trim();
            let newSymbol: SymbolNode | null = null;
            lastFiveNodes.push(node.type.name);

            if (lastFiveNodes.length > 5) {
                lastFiveNodes.shift(); // Remove the oldest node
            }

            // Check if we found a FunctionDefinition (function or method)
            if (node.type.name == 'FunctionDefinition' || node.type.name == "FunctionDeclaration") {
                // Create a placeholder function with the name "UnknownFunction"
                newSymbol = { name: "UnknownFunction", children: [], type: node.type.name, range: [node.from, node.to] };
            }

            if (node.type.name == 'InterfaceDeclaration') {
                // Create a placeholder function with the name "UnknownFunction"
                newSymbol = { name: "UnknownInterface", children: [], type: node.type.name, range: [node.from, node.to] };
            }

            else if (node.type.name == "ClassDefinition" || node.type.name == "ClassExpression" || node.type.name == "ClassDeclaration") {
                newSymbol = { name: "UnknownClass", children: [], type: node.type.name, range: [node.from, node.to] };
            }

            else if (node.type.name == 'AssignStatement' || node.type.name == "Declaration" || node.type.name == "VariableDeclaration") {
                newSymbol = { name: "UnknownAssignment", type: node.type.name, range: [node.from, node.to] };
            }

            else if (node.type.name == "Property" || node.type.name == "PropertyType" || node.type.name == "PropertyDeclaration") {
                newSymbol = { name: "UnknownProperty", type: node.type.name, range: [node.from, node.to] };
            }

            else if (node.type.name == "MethodDeclaration") {
                newSymbol = { name: "UnknownMethod", type: node.type.name, range: [node.from, node.to] };
            }

            else if (node.type.name == "ClassBody") {
                if (stack.length > 0) {
                    const parent = stack[stack.length - 1];
                    if (parent.name == "UnknownClass") {
                        // Found class with no name
                        parent.name = "<class>"
                        parent.type = "Class"
                    }
                }
            }

            else if (node.type.name == "PropertyDefinition") {
                if (stack.length > 0) {
                    const parent = stack[stack.length - 1];

                    if (parent.children && parent.children.length > 0) {
                        if (parent.children[parent.children.length - 1].name == "UnknownProperty") {
                            parent.children[parent.children.length - 1].name = name
                            parent.children[parent.children.length - 1].type = "Property"
                        }
                    }
                    if (parent.name == "UnknownMethod") {
                        parent.name = name
                        parent.type = "Method"
                    }
                } else {
                    const lastSymbol = rootSymbols[rootSymbols.length - 1];
                    if (lastSymbol.name == "UnknownProperty") {
                        rootSymbols[rootSymbols.length - 1].name = name
                        rootSymbols[rootSymbols.length - 1].type = "Property"
                    }
                }
            }


            // If we find a VariableName, update the current function's name if it's still "UnknownFunction"
            else if (node.type.name == 'VariableName' || node.type.name == "Identifier" || node.type.name == "VariableDefinition") {


                if (stack.length > 0) {
                    if (stack[stack.length - 1].name === "UnknownFunction") {
                        stack[stack.length - 1].name = name;
                        stack[stack.length - 1].type = "Function";
                    }
                    else if (stack[stack.length - 1].name === "UnknownClass") {
                        stack[stack.length - 1].name = name;
                        stack[stack.length - 1].type = "Class";
                    }
                    else if (stack[stack.length - 1].name === "UnknownInterface") {
                        stack[stack.length - 1].name = name;
                        stack[stack.length - 1].type = "Interface";
                    }
                    else if (stack[stack.length - 1].name === "UnknownProperty") {
                        stack[stack.length - 1].name = name;
                        stack[stack.length - 1].type = "Property";
                    }
                    else {
                        // Found a variable but its not a function
                        const parent = stack[stack.length - 1];
                        if (parent.children && parent.children.length > 0) {
                            if (parent.children[parent.children.length - 1].name == "UnknownAssignment") {

                                if (parent.type == "Class" || parent.type == "Interface") {
                                    // this is actually a property
                                    parent.children[parent.children.length - 1].name = name
                                    parent.children[parent.children.length - 1].type = "Property"
                                }
                                parent.children[parent.children.length - 1].name = name
                                parent.children[parent.children.length - 1].type = "Variable"
                            }
                        }
                    }
                }
                // If no function is on the stack, handle root level symbols
                else if (rootSymbols.length > 0) {
                    if (rootSymbols[rootSymbols.length - 1].name == "UnknownAssignment") {
                        rootSymbols[rootSymbols.length - 1].name = name
                        rootSymbols[rootSymbols.length - 1].type = "Variable"
                    }
                    else {
                        console.warn("UNHANDELED VARIABLE")
                    }
                }
            }

            else if (node.type.name == "TypeDefinition") {
                if (stack.length > 0) {

                    if (stack[stack.length - 1].name === "UnknownInterface") {
                        stack[stack.length - 1].name = name;
                        stack[stack.length - 1].type = "Interface";
                    }
                    else {
                        console.warn("UNHANDLED")
                    }
                }
            }


            else if (node.type.name == "PropertyName") {
                if (stack.length > 0) {
                    const parent = stack[stack.length - 1];

                    const expectedSequence = ["AssignStatement", "MemberExpression", "VariableName", ".", "PropertyName"];

                    if (JSON.stringify(lastFiveNodes) === JSON.stringify(expectedSequence)) {

                        if (parent.children && parent.children[parent.children.length - 1].type == "Variable") {
                            let prop = parent.children[parent.children.length - 1];
                            if (prop.name == "self") {
                                // This is actually a property on the current object
                                let ClassIndex = stack.findLastIndex(item => item.type === "Class");
                                if (ClassIndex != -1) {
                                    parent.children.pop()
                                    stack[ClassIndex].children?.push({ name: name, type: "Property", range: [node.from, node.to] })
                                }
                            }
                        }
                    }
                }
            }


            // Add it to the parent if there is one, otherwise, add to root symbols
            if (newSymbol) {
                if (stack.length > 0) {
                    const parent = stack[stack.length - 1];
                    parent.children = parent.children || [];
                    parent.children.push(newSymbol);
                } else {
                    rootSymbols.push(newSymbol);
                }

                if (["FunctionDefinition", "ClassDefinition", "FunctionDeclaration", 'InterfaceDeclaration', "ClassDeclaration", "MethodDeclaration", "ClassExpression"].includes(newSymbol.type)) {
                    stack.push(newSymbol); // Push function onto the stack
                }
            }

        },

        leave(node: SyntaxNode) {
            // When leaving a function definition, pop it from the stack
            if (["FunctionDefinition", "ClassDefinition", "FunctionDeclaration", 'InterfaceDeclaration', "ClassDeclaration", "MethodDeclaration", "ClassExpression"].includes(node.type.name)) {
                stack.pop();
            }
        }
    });
    return rootSymbols;
}

export const SymbolTree = ViewPlugin.fromClass(
    class {
        public symbolSidebarWidget: SymbolSidebarWidget;
        public options: SymbolTreeOptions;

        constructor(view: EditorView) {
            this.options = { ...defaultSymbolTreeOptions };
            const symbols = extractSymbols(view);
            this.symbolSidebarWidget = new SymbolSidebarWidget(symbols, view, this.options);
            this.mountSidebarToView(view);
        }

        public updateOptions(options: SymbolTreeOptionInputs) {
            this.options = { ...this.options, ...options };
            this.updateSidebarVisibility();
            this.updateSidebarPosition();
        }

        // Update sidebar visibility based on current options
        updateSidebarVisibility() {
            this.symbolSidebarWidget.setVisibility(this.options.visible);
        }

        // Ensure the sidebar is correctly positioned based on the 'side' option
        updateSidebarPosition() {
            this.symbolSidebarWidget.styleSidebar(this.options.side);
        }

        // The sidebar should update when the document changes
        update(update: ViewUpdate) {
            if (update.docChanged) {
                const symbols = extractSymbols(update.view);
                const container = update.view.dom;
                if (container.contains(this.symbolSidebarWidget.container)) {
                    container.removeChild(this.symbolSidebarWidget.container)
                }
                this.symbolSidebarWidget = new SymbolSidebarWidget(symbols, update.view, this.options);
                this.mountSidebarToView(update.view)
            }
        }

        destroy() { }

        mountSidebarToView(view: EditorView) {
            // Make sure the sidebar widget is mounted in the view's DOM
            const container = view.dom;
            // Check if sidebar is already mounted, if not, append it
            if (!container.contains(this.symbolSidebarWidget.container)) {
                container.appendChild(this.symbolSidebarWidget.container);
                this.symbolSidebarWidget.styleSidebar(this.options.side);
            } else {
            }
        }
    }
);



class SymbolSidebarWidget extends WidgetType {
    private view: EditorView;
    private treeView: TreeView;
    container: HTMLElement;

    constructor(symbols: SymbolNode[], view: EditorView, options: SymbolTreeOptions) {
        super();
        this.view = view; // Store the view reference for scrollToSymbol
        this.container = crelt('div', { class: 'symbol-sidebar' });
        this.treeView = new TreeView(this.container, symbols, {
            eventHandlers: {
                onClick: this.scrollToSymbol.bind(this),
                onDoubleClick: this.highlightSymbol.bind(this)
            },
            ...options
        })
    }

    toDOM(view: EditorView): HTMLElement {
        return this.container;
    }

    // Scroll the editor to the symbol's line
    scrollToSymbol(event: NodeMouseEvent) {
        // Ensure the view is valid
        if (this.view && typeof this.view.lineBlockAt === 'function') {
            let block = this.view.lineBlockAt(event.node.range[0]);

            // Check if block is defined
            if (block) {
                this.view.scrollDOM.scrollTo({ top: block.top, behavior: 'smooth' });
            } else {
                console.error("Could not scroll to position specified")
            }
        } else {
            console.error('Editor view is not initialized or lineBlockAt is unavailable');
        }
    }

    highlightSymbol(event: NodeMouseEvent) {
        if (!this.view) {
            console.error("Editor view not initialized");
            return;
        }

        const from = event.node.range[0];
        const to = event.node.range[1];

        // Set the selection to the range
        this.view.dispatch({
            selection: EditorSelection.range(from, to),
            scrollIntoView: true,
        });
    }

    // Update visibility of the sidebar
    setVisibility(visibility: boolean) {
        this.container.style.display = visibility ? 'block' : 'none';
    }

    styleSidebar(side: 'left' | 'right') {
        // Position the sidebar on the left or right of the editor
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.bottom = '0';
        this.container.style.width = 'auto';  // Width of the sidebar
        this.container.style.zIndex = '10';

        if (side === 'right') {
            this.container.style.right = '0';
        } else {
            this.container.style.left = '0';
        }

        this.treeView.updatePosition(side);


        let rect = this.container.getBoundingClientRect()
        let size = rect.right - rect.left; //size of rectangle
        // Ensure the sidebar doesn't affect the editor's scroll
        this.view.dom.style.paddingLeft = side === 'left' ? `${size}px` : '0';
        this.view.dom.style.paddingRight = side === 'right' ? `${size}px` : '0';
    }
}
