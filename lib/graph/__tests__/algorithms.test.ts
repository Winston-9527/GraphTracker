import { describe, it, expect } from 'vitest';
import {
  classifyAddressType,
  findCommonCounterparties,
  findRelatedAddresses,
  calculateDegreeCentrality,
  findClusters,
} from '../algorithms';
import type { GraphNode, GraphEdge } from '@/types/graph';

describe('classifyAddressType', () => {
  it('classifies known exchanges correctly', () => {
    const exchanges = new Set(['0xexchangeaddress']);
    const result = classifyAddressType('0xExchangeAddress', 1000, 10000, exchanges);
    expect(result).toBe('exchange');
  });

  it('classifies whale based on balance threshold', () => {
    const result = classifyAddressType('0x1234567890123456789012345678901234567890', 4000, 10000);
    expect(result).toBe('whale');
  });

  it('classifies regular holder when below threshold', () => {
    const result = classifyAddressType('0x1234567890123456789012345678901234567890', 100, 10000);
    expect(result).toBe('holder');
  });

  it('defaults to holder for unknown patterns', () => {
    const result = classifyAddressType('0xshort', 5000, 10000);
    expect(result).toBe('holder');
  });
});

describe('findCommonCounterparties', () => {
  const transactions = [
    { from: '0xA', to: '0xB', value: '100' },
    { from: '0xA', to: '0xC', value: '200' },
    { from: '0xD', to: '0xB', value: '300' },
    { from: '0xD', to: '0xC', value: '400' },
    { from: '0xA', to: '0xE', value: '500' },
  ];

  it('finds common counterparties between two addresses', () => {
    const result = findCommonCounterparties('0xA', '0xD', transactions);
    expect(result.common).toContain('0xb');
    expect(result.common).toContain('0xc');
    expect(result.count).toBe(2);
  });

  it('returns empty when no common counterparties exist', () => {
    const result = findCommonCounterparties('0xA', '0xF', transactions);
    expect(result.common.length).toBe(0);
    expect(result.count).toBe(0);
  });

  it('handles case-insensitive address matching', () => {
    const result = findCommonCounterparties('0xa', '0xd', transactions);
    expect(result.count).toBe(2);
  });
});

describe('findRelatedAddresses', () => {
  const transactions = [
    { from: '0xA', to: '0xB', value: '100' },
    { from: '0xA', to: '0xC', value: '200' },
    { from: '0xD', to: '0xB', value: '300' },
    { from: '0xD', to: '0xC', value: '400' },
    { from: '0xA', to: '0xD', value: '500' },
  ];

  const addresses = ['0xA', '0xB', '0xC', '0xD'];

  it('identifies related addresses through common counterparties', () => {
    const result = findRelatedAddresses('0xA', addresses, transactions, 1);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].addressA).toBe('0xA');
  });

  it('sorts results by relation strength descending', () => {
    const result = findRelatedAddresses('0xA', addresses, transactions);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].relationStrength).toBeGreaterThanOrEqual(result[i + 1].relationStrength);
    }
  });

  it('respects minimum shared counterparties threshold', () => {
    const result = findRelatedAddresses('0xA', addresses, transactions, 5);
    expect(result.length).toBe(0);
  });

  it('boosts strength for direct transactions', () => {
    const result = findRelatedAddresses('0xA', addresses, transactions, 1);
    const directRelation = result.find(r => r.addressB === '0xD');
    expect(directRelation).toBeDefined();
    expect(directRelation!.relationStrength).toBeGreaterThan(0);
  });
});

describe('calculateDegreeCentrality', () => {
  it('counts connections per node correctly', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'A', type: 'holder', balance: 100, rank: 1 },
      { id: 'B', label: 'B', type: 'holder', balance: 100, rank: 2 },
      { id: 'C', label: 'C', type: 'holder', balance: 100, rank: 3 },
    ];

    const edges: GraphEdge[] = [
      { id: 'e1', source: 'A', target: 'B', weight: 1 },
      { id: 'e2', source: 'A', target: 'C', weight: 1 },
      { id: 'e3', source: 'B', target: 'C', weight: 1 },
    ];

    const centrality = calculateDegreeCentrality(nodes, edges);
    expect(centrality.get('A')).toBe(2);
    expect(centrality.get('B')).toBe(2);
    expect(centrality.get('C')).toBe(2);
  });

  it('returns zero for isolated nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'A', type: 'holder', balance: 100, rank: 1 },
      { id: 'B', label: 'B', type: 'holder', balance: 100, rank: 2 },
    ];

    const edges: GraphEdge[] = [{ id: 'e1', source: 'A', target: 'A', weight: 1 }];

    const centrality = calculateDegreeCentrality(nodes, edges);
    expect(centrality.get('B')).toBe(0);
  });
});

describe('findClusters', () => {
  it('identifies connected components', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'A', type: 'holder', balance: 100, rank: 1 },
      { id: 'B', label: 'B', type: 'holder', balance: 100, rank: 2 },
      { id: 'C', label: 'C', type: 'holder', balance: 100, rank: 3 },
      { id: 'D', label: 'D', type: 'holder', balance: 100, rank: 4 },
    ];

    const edges: GraphEdge[] = [
      { id: 'e1', source: 'A', target: 'B', weight: 1 },
      { id: 'e2', source: 'B', target: 'C', weight: 1 },
      { id: 'e3', source: 'D', target: 'D', weight: 1 },
    ];

    const clusters = findClusters(nodes, edges, 2);
    expect(clusters.length).toBe(1);
    expect(clusters[0].map(n => n.id)).toContain('A');
    expect(clusters[0].map(n => n.id)).toContain('B');
    expect(clusters[0].map(n => n.id)).toContain('C');
  });

  it('filters clusters by minimum size', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'A', type: 'holder', balance: 100, rank: 1 },
      { id: 'B', label: 'B', type: 'holder', balance: 100, rank: 2 },
      { id: 'C', label: 'C', type: 'holder', balance: 100, rank: 3 },
    ];

    const edges: GraphEdge[] = [
      { id: 'e1', source: 'A', target: 'B', weight: 1 },
    ];

    const clusters = findClusters(nodes, edges, 3);
    expect(clusters.length).toBe(0);
  });
});
