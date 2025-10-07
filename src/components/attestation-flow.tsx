import type { Edge, Node } from '@xyflow/react';

import { Position, ReactFlow } from '@xyflow/react';
import { useMemo } from 'react';

import type { AttestationComponent } from '@/lib/types';

import { AttestationNode } from '@/components/attestation-node';

const HORIZONTAL_SPACING = 300; // Space between nodes horizontally (left to right)
const VERTICAL_SPACING = 150; // Space between nodes vertically (top to bottom)

type AttestationFlowProps = {
    data: AttestationComponent;
};

const nodeTypes = {
    custom: AttestationNode
};

export function AttestationFlow({ data }: AttestationFlowProps) {
    // Calculate nodes and edges whenever data changes
    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let nodeId = 0; // Counter for generating unique node IDs

        // CREATE ROOT NODE: "THIS CHAT"
        const rootNodeId = 'root-this-chat';
        nodes.push({
            id: rootNodeId,
            type: 'custom',
            position: { x: 0, y: 0 },
            data: {
                label: 'This Chat',
                description: 'Current chat session',
                hasQuote: false
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
        } as Node);

        // RECURSIVE TREE BUILDING FUNCTION
        // This function walks through the component tree and creates nodes/edges
        const buildTree = (
            component: AttestationComponent, // Current component to process
            x: number, // X position for this node
            y: number, // Y position for this node
            parentId: string | null // ID of parent node (null for root)
        ): void => {
            const currentNodeId = `node-${nodeId++}`;

            // CREATE NODE
            // Each node represents a component in the attestation hierarchy

            nodes.push({
                id: currentNodeId,
                position: { x, y },
                data: {
                    label: component.componentName,
                    description: component.description,
                    hasQuote: component.quote
                },
                type: 'custom', // Use custom AttestationNode component
                sourcePosition: Position.Bottom, // Edges exit from bottom
                targetPosition: Position.Top // Edges enter from top

            });

            // CREATE EDGE (CONNECTION FROM PARENT)
            // Connect this node to its parent (skip for root node)

            if (parentId) {
                edges.push({
                    id: `edge-${parentId}-${currentNodeId}`,
                    source: parentId, // Parent node ID
                    target: currentNodeId, // This node ID
                    type: 'smoothstep' // Smooth curved edges
                });
            }

            // PROCESS CHILDREN
            // Recursively create child nodes
            // MODIFY THIS SECTION TO CHANGE LAYOUT STRATEGY

            if (component.childComponent && component.childComponent.length > 0) {
                const childCount = component.childComponent.length;

                // LAYOUT STRATEGY: HORIZONTAL
                // Children are placed horizontally below the parent
                // Centered around the parent's X position

                // Calculate starting X position to center children under parent
                const totalWidth = (childCount - 1) * HORIZONTAL_SPACING;
                const startX = x - totalWidth / 2;

                component.childComponent.forEach((child, index) => {
                    // Calculate X position for this child
                    const childX = startX + (index * HORIZONTAL_SPACING);

                    // Calculate Y position (one level down)
                    const childY = y + VERTICAL_SPACING;

                    // Recursively build this child's subtree
                    buildTree(child, childX, childY, currentNodeId);
                });

                // ============================================================
                // ALTERNATIVE LAYOUT STRATEGIES (commented out)
                // ============================================================

                // STRATEGY 1: Vertical stacking (children in a column)
                // component.childComponent.forEach((child, index) => {
                //     const childX = x + HORIZONTAL_SPACING;
                //     const childY = y + (index * VERTICAL_SPACING);
                //     buildTree(child, childX, childY, currentNodeId);
                // });

                // STRATEGY 2: Diagonal cascade
                // component.childComponent.forEach((child, index) => {
                //     const childX = x + (index * 100);
                //     const childY = y + VERTICAL_SPACING + (index * 50);
                //     buildTree(child, childX, childY, currentNodeId);
                // });

                // STRATEGY 3: Compact alternating
                // component.childComponent.forEach((child, index) => {
                //     const childX = x + (index % 2 === 0 ? -150 : 150);
                //     const childY = y + VERTICAL_SPACING + (Math.floor(index / 2) * 100);
                //     buildTree(child, childX, childY, currentNodeId);
                // });
            }
        };

        // START BUILDING FROM ROOT
        // Build the tree starting below "This Chat" root node

        buildTree(data, 0, VERTICAL_SPACING, rootNodeId);

        return { nodes, edges };
    }, [data]);

    return (
        <div className="h-full w-full bg-muted rounded-md">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView // Auto-fit the view to show all nodes

                // INTERACTIVITY CONFIGURATION
                // Panning enabled for scrolling through large trees

                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                elementsSelectable={false}
                zoomOnScroll={true} // Enable zoom with mouse wheel
                zoomOnPinch={true} // Enable zoom on touch devices
                zoomOnDoubleClick={true} // Enable zoom on double click
                panOnScroll={true} // Enable pan with scroll (when holding shift)
                panOnDrag={true} // Enable panning by dragging
                preventScrolling={true} // Prevent page scroll when interacting
                minZoom={0.1}
                maxZoom={1.5}
                fitViewOptions={{
                    padding: 0.15, // 15% padding around edges
                    minZoom: 0.2, // Allow zooming out to see full tree
                    maxZoom: 1.2 // Allow slight zoom in for details
                }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: {
                        strokeWidth: 2,
                        stroke: '#64748b', // Slate gray color
                        strokeDasharray: '8,4' // Dashed line pattern
                    }
                }}
                proOptions={{ hideAttribution: true }}
            />
        </div>
    );
}
