export interface SymbolNode {
    name: string;
    children?: SymbolNode[];
    type: string;
    range: number[];
}

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
onExpand?: (event: NodeMouseEvent) => void;
onCollapse?: (event: NodeMouseEvent) => void;
onSelect?: (event: NodeMouseEvent) => void;
onHover?: (event: NodeMouseEvent) => void;
onBlur?: (event: NodeMouseEvent) => void;
onKeyDown?: (event: NodeKeyboardEvent) => void;
}

export type SymbolTreeOptions = {
    visible: boolean,
    side: 'left' | 'right',
    eventHandlers? : TreeNodeEventHandlers,
    
}

export type SymbolTreeOptionInputs = {
    visible?: boolean,
    side?: 'left' | 'right',
    eventHandlers?: TreeNodeEventHandlers
}

export const defaultSymbolTreeOptions : SymbolTreeOptions = {
    visible: true,
    side: 'left'
};