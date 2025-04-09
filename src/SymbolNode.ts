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

export interface TreeNodeEventHandlers {
onClick?: (event: NodeMouseEvent) => void;
onDoubleClick?: (event: NodeMouseEvent) => void;
onRightClick?: (event: NodeMouseEvent) => void;
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