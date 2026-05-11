import { describe, it, expect } from 'vitest';
import {
  buildGraphData,
  buildEdgesFromTransactions,
  generateMockHolders,
  generateMockTransactions,
} from '../processor';

const TEST_TOKEN = '0xTokenAddress';

const MOCK_HOLDERS = [
  { address: '0x1111111111111111111111111111111111111111', balance: '1000000', percentage: 25, rank: 1 },
  { address: '0x2222222222222222222222222222222222222222', balance: '500000', percentage: 12.5, rank: 2 },
  { address: '0x3333333333333333333333333333333333333333', balance: '250000', percentage: 6.25, rank: 3 },
  { address: '0x4444444444444444444444444444444444444444', balance: '100000', percentage: 2.5, rank: 4 },
];

const MOCK_TRANSACTIONS = [
  { from: '0x1111111111111111111111111111111111111111', to: '0x2222222222222222222222222222222222222222', value: '5000' },
  { from: '0x2222222222222222222222222222222222222222', to: '0x3333333333333333333333333333333333333333', value: '3000' },
  { from: '0x1111111111111111111111111111111111111111', to: '0x3333333333333333333333333333333333333333', value: '2000' },
  { from: '0x4444444444444444444444444444444444444444', to: '0x1111111111111111111111111111111111111111', value: '1000' },
];

describe('buildGraphData', () => {
  it('generates correct number of nodes and edges', () => {
    const result = buildGraphData({
      tokenAddress: TEST_TOKEN,
      holders: MOCK_HOLDERS,
      transactions: MOCK_TRANSACTIONS,
    });

    expect(result.nodes.length).toBe(MOCK_HOLDERS.length);
    expect(result.edges.length).toBeGreaterThan(0);
  });

  it('caps nodes at maximum limit', () => {
    const manyHolders = generateMockHolders(150);
    const result = buildGraphData({
      tokenAddress: TEST_TOKEN,
      holders: manyHolders,
      transactions: [],
    });

    expect(result.nodes.length).toBeLessThanOrEqual(100);
  });

  it('assigns correct types to nodes', () => {
    const result = buildGraphData({
      tokenAddress: TEST_TOKEN,
      holders: MOCK_HOLDERS,
      transactions: MOCK_TRANSACTIONS,
    });

    const whale = result.nodes.find(n => n.id === '0x1111111111111111111111111111111111111111');
    const holder = result.nodes.find(n => n.id === '0x4444444444444444444444444444444444444444');

    expect(whale?.type).toBe('whale');
    expect(holder?.type).toBe('holder');
  });

  it('scales node sizes based on balance', () => {
    const result = buildGraphData({
      tokenAddress: TEST_TOKEN,
      holders: MOCK_HOLDERS,
      transactions: MOCK_TRANSACTIONS,
    });

    const largest = result.nodes.find(n => n.rank === 1);
    const smallest = result.nodes.find(n => n.rank === 4);

    expect(largest?.size).toBeGreaterThan(smallest?.size || 0);
  });

  it('generates edges with correct source and target', () => {
    const result = buildGraphData({
      tokenAddress: TEST_TOKEN,
      holders: MOCK_HOLDERS,
      transactions: MOCK_TRANSACTIONS,
    });

    const edge = result.edges.find(
      e =>
        (e.source === '0x1111111111111111111111111111111111111111' &&
          e.target === '0x2222222222222222222222222222222222222222') ||
        (e.source === '0x2222222222222222222222222222222222222222' &&
          e.target === '0x1111111111111111111111111111111111111111')
    );

    expect(edge).toBeDefined();
    expect(edge?.weight).toBe(5000);
  });
});

describe('buildEdgesFromTransactions', () => {
  it('creates edges only for known node pairs', () => {
    const nodeIds = new Set([
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
    ]);

    const txs = [
      { from: '0x1111111111111111111111111111111111111111', to: '0x2222222222222222222222222222222222222222', value: '100' },
      { from: '0x1111111111111111111111111111111111111111', to: '0x9999999999999999999999999999999999999999', value: '200' },
    ];

    const edges = buildEdgesFromTransactions(txs, nodeIds);

    expect(edges.length).toBe(1);
    expect(edges[0].source).toBe('0x1111111111111111111111111111111111111111');
    expect(edges[0].target).toBe('0x2222222222222222222222222222222222222222');
  });

  it('accumulates weights for duplicate edges', () => {
    const nodeIds = new Set([
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
    ]);

    const txs = [
      { from: '0x1111111111111111111111111111111111111111', to: '0x2222222222222222222222222222222222222222', value: '100' },
      { from: '0x1111111111111111111111111111111111111111', to: '0x2222222222222222222222222222222222222222', value: '200' },
    ];

    const edges = buildEdgesFromTransactions(txs, nodeIds);

    expect(edges.length).toBe(1);
    expect(edges[0].weight).toBe(300);
    expect(edges[0].transactions).toBe(2);
  });
});

describe('generateMockHolders', () => {
  it('generates specified number of holders', () => {
    const holders = generateMockHolders(10);
    expect(holders.length).toBe(10);
  });

  it('sorts holders by balance descending', () => {
    const holders = generateMockHolders(5);
    for (let i = 0; i < holders.length - 1; i++) {
      expect(parseFloat(holders[i].balance)).toBeGreaterThanOrEqual(parseFloat(holders[i + 1].balance));
    }
  });
});

describe('generateMockTransactions', () => {
  it('generates specified number of transactions', () => {
    const addresses = ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'];
    const txs = generateMockTransactions(addresses, 20);
    expect(txs.length).toBe(20);
  });

  it('does not create self-transfers', () => {
    const addresses = ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'];
    const txs = generateMockTransactions(addresses, 50);

    for (const tx of txs) {
      expect(tx.from).not.toBe(tx.to);
    }
  });
});
