'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Loader2, Network } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/Card';
import {
  GraphData,
  GraphLayout,
  GraphNode,
  GraphEdge,
  DEFAULT_GRAPH_STYLE,
} from '@/types/graph';
import { cn } from '@/app/lib/utils';

cytoscape.use(coseBilkent);

export interface GraphViewerProps {
  graphData: GraphData | null;
  layout?: GraphLayout;
  isLoading?: boolean;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const DEFAULT_LAYOUT: GraphLayout = {
  name: 'cose',
  padding: 20,
  animate: true,
  animationDuration: 500,
};

const LAYOUT_CONFIGS: Record<string, cytoscape.LayoutOptions> = {
  cose: {
    name: 'cose-bilkent',
    padding: 20,
    animate: true,
    animationDuration: 500,
    nodeRepulsion: 4500,
    edgeElasticity: 0.45,
    nestingFactor: 0.1,
    gravity: 0.25,
    numIter: 2500,
    tile: true,
    tilingPaddingVertical: 10,
    tilingPaddingHorizontal: 10,
    gravityRangeCompound: 1.5,
    gravityCompound: 1.0,
    gravityRange: 3.8,
    initialEnergyOnIncremental: 0.3,
  } as cytoscape.LayoutOptions,
  circle: {
    name: 'circle',
    padding: 20,
    animate: true,
    animationDuration: 500,
    avoidOverlap: true,
    radius: undefined,
    startAngle: 0,
    sweep: 2 * Math.PI,
    clockwise: true,
    sort: undefined,
  },
  grid: {
    name: 'grid',
    padding: 20,
    animate: true,
    animationDuration: 500,
    avoidOverlap: true,
    avoidOverlapPadding: 10,
    condense: false,
    rows: undefined,
    cols: undefined,
    position: undefined,
    sort: undefined,
  },
  concentric: {
    name: 'concentric',
    padding: 20,
    animate: true,
    animationDuration: 500,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: false,
    concentric: function (node: cytoscape.NodeSingular) {
      return node.degree();
    },
    levelWidth: function () {
      return 1;
    },
    sweep: 2 * Math.PI,
    clockwise: true,
    startAngle: 0,
  },
};

export function GraphViewer({
  graphData,
  layout = DEFAULT_LAYOUT,
  isLoading = false,
  onNodeClick,
  className,
}: GraphViewerProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [isLayoutRunning, setIsLayoutRunning] = useState(false);

  const elements = useMemo(() => {
    if (!graphData) return [];

    const nodes = graphData.nodes.map((node: GraphNode) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        balance: node.balance,
        rank: node.rank,
        address: node.address,
        percentage: node.percentage,
        color: node.color || DEFAULT_GRAPH_STYLE.nodeColors[node.type],
        size: node.size || Math.max(20, Math.min(60, node.rank * 5 + 20)),
      },
    }));

    const edges = graphData.edges.map((edge: GraphEdge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        label: edge.label,
        color: edge.color || DEFAULT_GRAPH_STYLE.edgeColor,
        width: edge.width || Math.max(1, Math.min(5, edge.weight / 2)),
      },
    }));

    return [...nodes, ...edges];
  }, [graphData]);

  const stylesheet = useMemo(
    () => [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'width': 'data(size)',
          'height': 'data(size)',
          'label': 'data(label)',
          'color': '#ffffff',
          'font-size': '12px',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-outline-color': '#1a1a2e',
          'text-outline-width': 2,
          'border-width': 2,
          'border-color': '#ffffff',
          'border-opacity': 0.3,
        },
      },
      {
        selector: 'edge',
        style: {
          'width': 'data(width)',
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'opacity': 0.7,
        },
      },
      {
        selector: ':selected',
        style: {
          'background-color': DEFAULT_GRAPH_STYLE.selectedNodeColor,
          'border-color': '#ffffff',
          'border-width': 3,
          'border-opacity': 1,
        },
      },
      {
        selector: '.highlighted',
        style: {
          'line-color': DEFAULT_GRAPH_STYLE.highlightedEdgeColor,
          'target-arrow-color': DEFAULT_GRAPH_STYLE.highlightedEdgeColor,
          'width': 4,
          'opacity': 1,
        },
      },
    ],
    []
  );

  const runLayout = useCallback(
    (cy: cytoscape.Core, layoutConfig: GraphLayout) => {
      if (!cy || elements.length === 0) return;

      setIsLayoutRunning(true);

      const layoutOptions = LAYOUT_CONFIGS[layoutConfig.name] || LAYOUT_CONFIGS.cose;
      const layoutInstance = cy.layout({
        ...layoutOptions,
        animate: layoutConfig.animate ?? true,
        animationDuration: layoutConfig.animationDuration ?? 500,
        ...(layoutConfig.padding !== undefined && { padding: layoutConfig.padding }),
      } as cytoscape.LayoutOptions);

      layoutInstance.on('layoutstop', () => {
        setIsLayoutRunning(false);
      });

      layoutInstance.run();
    },
    [elements.length]
  );

  const handleCyInit = useCallback(
    (cy: cytoscape.Core) => {
      cyRef.current = cy;

      cy.on('tap', 'node', (event) => {
        const nodeId = event.target.id();
        onNodeClick?.(nodeId);
      });

      cy.on('mouseover', 'node', (event) => {
        event.target.animate({
          style: { 'border-width': 4, 'border-opacity': 0.8 },
          duration: 200,
        });
      });

      cy.on('mouseout', 'node', (event) => {
        event.target.animate({
          style: { 'border-width': 2, 'border-opacity': 0.3 },
          duration: 200,
        });
      });

      runLayout(cy, layout);
    },
    [layout, onNodeClick, runLayout]
  );

  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      runLayout(cyRef.current, layout);
    }
  }, [layout, elements.length, runLayout]);

  if (isLoading) {
    return (
      <Card className={cn('h-[500px] flex items-center justify-center', className)}>
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
          <p className="text-zinc-400 text-sm">Generating graph visualization...</p>
        </CardContent>
      </Card>
    );
  }

  if (!graphData || elements.length === 0) {
    return (
      <Card className={cn('h-[500px] flex items-center justify-center', className)}>
        <CardContent className="flex flex-col items-center gap-4">
          <Network className="h-12 w-12 text-zinc-600" />
          <div className="text-center">
            <p className="text-zinc-300 font-medium">No Graph Data</p>
            <p className="text-zinc-500 text-sm mt-1">
              Enter a token address to visualize the holder network
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-0">
        <div
          className="relative w-full h-[500px]"
          style={{ backgroundColor: DEFAULT_GRAPH_STYLE.backgroundColor }}
        >
          <CytoscapeComponent
            elements={elements}
            stylesheet={stylesheet}
            style={{
              width: '100%',
              height: '100%',
            }}
            cy={handleCyInit}
            minZoom={0.1}
            maxZoom={3}
            wheelSensitivity={0.3}
          />
          {isLayoutRunning && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-400">Arranging...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default GraphViewer;
