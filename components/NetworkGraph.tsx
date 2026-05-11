'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import type { GraphData, GraphNode } from '@/types/graph';
import { graphDataToElements, getCytoscapeStylesheet, getDefaultLayout } from '@/lib/graph/styles';

if (typeof window !== 'undefined') {
  cytoscape.use(coseBilkent);
}

export interface NetworkGraphProps {
  data: GraphData;
  onNodeSelect?: (node: GraphNode | null) => void;
  height?: string;
  className?: string;
}

export default function NetworkGraph({
  data,
  onNodeSelect,
  height = '600px',
  className = ''
}: NetworkGraphProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodeCount, setNodeCount] = useState(data.nodes.length);
  const [edgeCount, setEdgeCount] = useState(data.edges.length);

  const elements = React.useMemo(() => graphDataToElements(data), [data]);
  const stylesheet = React.useMemo(() => getCytoscapeStylesheet(), []);
  const layout = React.useMemo(() => getDefaultLayout(), []);

  useEffect(() => {
    setNodeCount(data.nodes.length);
    setEdgeCount(data.edges.length);
  }, [data]);

  const handleNodeTap = useCallback(
    (evt: cytoscape.EventObject) => {
      const cyNode = evt.target;
      const nodeData = cyNode.data();
      const node: GraphNode = {
        id: nodeData.id,
        label: nodeData.label,
        type: nodeData.type,
        balance: nodeData.balance,
        rank: nodeData.rank,
        address: nodeData.address,
        percentage: nodeData.percentage,
        size: nodeData.size,
        color: nodeData.color
      };
      setSelectedNode(node);
      onNodeSelect?.(node);

      const cy = cyRef.current;
      if (!cy) return;

      cy.nodes().removeClass('highlighted dimmed');
      cy.edges().removeClass('highlighted dimmed');

      cyNode.addClass('highlighted');

      const neighbors = cyNode.neighborhood();
      neighbors.addClass('highlighted');

      cy.nodes().not(cyNode).not(neighbors).addClass('dimmed');
      cy.edges().not(neighbors.edges()).addClass('dimmed');
    },
    [onNodeSelect]
  );

  const handleBackgroundTap = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);

    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('highlighted dimmed');
    cy.edges().removeClass('highlighted dimmed');
  }, [onNodeSelect]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.on('tap', 'node', handleNodeTap);
    cy.on('tap', handleBackgroundTap);

    const layoutInstance = cy.layout(layout as cytoscape.LayoutOptions);
    layoutInstance.run();

    return () => {
      cy.off('tap', 'node', handleNodeTap);
      cy.off('tap', handleBackgroundTap);
    };
  }, [handleNodeTap, handleBackgroundTap, layout]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().remove();
    cy.add(elements);

    const layoutInstance = cy.layout(layout as cytoscape.LayoutOptions);
    layoutInstance.run();
  }, [elements, layout]);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <CytoscapeComponent
        cy={(cy: cytoscape.Core) => {
          cyRef.current = cy;
        }}
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layout}
        wheelSensitivity={0.2}
        minZoom={0.1}
        maxZoom={3}
      />

      <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-200 px-3 py-2 rounded-lg text-xs backdrop-blur-sm border border-slate-700">
        <div className="font-semibold mb-1">Network Overview</div>
        <div>Nodes: {nodeCount}</div>
        <div>Edges: {edgeCount}</div>
      </div>

      {selectedNode && (
        <div className="absolute bottom-3 right-3 bg-slate-900/90 text-slate-200 p-4 rounded-xl backdrop-blur-sm border border-slate-700 max-w-xs shadow-xl">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedNode.color || '#4a90d9' }}
            />
            {selectedNode.label}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Type</span>
              <span className="capitalize">{selectedNode.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rank</span>
              <span>#{selectedNode.rank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Balance</span>
              <span>{formatNumber(selectedNode.balance)}</span>
            </div>
            {selectedNode.percentage && (
              <div className="flex justify-between">
                <span className="text-slate-400">Share</span>
                <span>{selectedNode.percentage.toFixed(2)}%</span>
              </div>
            )}
            {selectedNode.address && (
              <div className="flex justify-between">
                <span className="text-slate-400">Address</span>
                <span className="font-mono truncate max-w-[120px]">
                  {selectedNode.address.slice(0, 6)}...{selectedNode.address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
