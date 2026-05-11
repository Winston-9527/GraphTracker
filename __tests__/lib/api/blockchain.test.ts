import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../setup';
import { BlockchainApiClient } from '@/lib/api/blockchain';

const MOCK_API_KEYS = {
  1: 'test-etherscan-key',
  56: 'test-bscscan-key',
  8453: 'test-basescan-key',
};

beforeAll(() => {
  process.env.ETHERSCAN_API_KEY = MOCK_API_KEYS[1];
  process.env.BSCSCAN_API_KEY = MOCK_API_KEYS[56];
  process.env.BASESCAN_API_KEY = MOCK_API_KEYS[8453];
});

afterAll(() => {
  delete process.env.ETHERSCAN_API_KEY;
  delete process.env.BSCSCAN_API_KEY;
  delete process.env.BASESCAN_API_KEY;
});

describe('BlockchainApiClient', () => {
  const client = new BlockchainApiClient();

  describe('getTopTokenHolders', () => {
    it('should fetch top token holders successfully', async () => {
      server.use(
        http.get('https://api.etherscan.io/api', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');
          const apikey = url.searchParams.get('apikey');

          expect(action).toBe('tokenholderlist');
          expect(apikey).toBe(MOCK_API_KEYS[1]);

          return HttpResponse.json({
            status: '1',
            message: 'OK',
            result: [
              {
                TokenHolderAddress: '0x1111111111111111111111111111111111111111',
                TokenHolderQuantity: '1000000000000000000',
              },
              {
                TokenHolderAddress: '0x2222222222222222222222222222222222222222',
                TokenHolderQuantity: '500000000000000000',
              },
            ],
          });
        })
      );

      const holders = await client.getTopTokenHolders(
        1,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        10
      );

      expect(holders).toHaveLength(2);
      expect(holders[0]).toEqual({
        address: '0x1111111111111111111111111111111111111111',
        balance: '1000000000000000000',
        percentage: expect.any(Number),
        rank: 1,
      });
      expect(holders[1]).toEqual({
        address: '0x2222222222222222222222222222222222222222',
        balance: '500000000000000000',
        percentage: expect.any(Number),
        rank: 2,
      });
    });

    it('should throw error when API returns error status', async () => {
      server.use(
        http.get('https://api.bscscan.com/api', () => {
          return HttpResponse.json({
            status: '0',
            message: 'This action requires a Pro subscription',
            result: [],
          });
        })
      );

      await expect(
        client.getTopTokenHolders(
          56,
          '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          10
        )
      ).rejects.toThrow('This action requires a Pro subscription');
    });
  });

  describe('getTokenTransfers', () => {
    it('should fetch token transfers for a specific address', async () => {
      server.use(
        http.get('https://api.bscscan.com/api', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');
          const contractaddress = url.searchParams.get('contractaddress');
          const address = url.searchParams.get('address');

          expect(action).toBe('tokentx');
          expect(contractaddress).toBe('0xdAC17F958D2ee523a2206206994597C13D831ec7');
          expect(address).toBe('0x3333333333333333333333333333333333333333');

          return HttpResponse.json({
            status: '1',
            message: 'OK',
            result: [
              {
                hash: '0xabc123',
                from: '0x1111111111111111111111111111111111111111',
                to: '0x3333333333333333333333333333333333333333',
                value: '1000000000000000000',
                timeStamp: '1699900000',
                gasPrice: '20000000000',
                gasUsed: '21000',
              },
            ],
          });
        })
      );

      const transfers = await client.getTokenTransfers(
        56,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x3333333333333333333333333333333333333333'
      );

      expect(transfers).toHaveLength(1);
      expect(transfers[0]).toEqual({
        hash: '0xabc123',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x3333333333333333333333333333333333333333',
        value: '1000000000000000000',
        timeStamp: '1699900000',
        gasPrice: '20000000000',
        gasUsed: '21000',
      });
    });

    it('should fetch all token transfers when address is not provided', async () => {
      server.use(
        http.get('https://api.basescan.org/api', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');
          expect(action).toBe('tokentx');
          expect(url.searchParams.get('address')).toBeNull();

          return HttpResponse.json({
            status: '1',
            message: 'OK',
            result: [
              {
                hash: '0xdef456',
                from: '0x4444444444444444444444444444444444444444',
                to: '0x5555555555555555555555555555555555555555',
                value: '500000000000000000',
                timeStamp: '1699900001',
              },
            ],
          });
        })
      );

      const transfers = await client.getTokenTransfers(
        8453,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      );

      expect(transfers).toHaveLength(1);
      expect(transfers[0].hash).toBe('0xdef456');
    });
  });

  describe('getAddressInfo', () => {
    it('should return address info with balance and transaction count', async () => {
      server.use(
        http.get('https://api.etherscan.io/api', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');

          if (action === 'balance') {
            return HttpResponse.json({
              status: '1',
              message: 'OK',
              result: '1500000000000000000',
            });
          }

          if (action === 'txlist') {
            return HttpResponse.json({
              status: '1',
              message: 'OK',
              result: [{ hash: '0xabc' }],
            });
          }

          return HttpResponse.json({ status: '0', message: 'Unknown action' });
        })
      );

      const info = await client.getAddressInfo(
        1,
        '0x6666666666666666666666666666666666666666'
      );

      expect(info.address).toBe('0x6666666666666666666666666666666666666666');
      expect(info.balance).toBe('1500000000000000000');
      expect(info.transactionCount).toBe(1);
      expect(info.chainId).toBe(1);
      expect(info.chainName).toBe('Ethereum');
    });

    it('should return zero balance when balance API fails', async () => {
      server.use(
        http.get('https://api.etherscan.io/api', ({ request }) => {
          const url = new URL(request.url);
          const action = url.searchParams.get('action');

          if (action === 'balance') {
            return HttpResponse.json({
              status: '0',
              message: 'Error',
              result: '0',
            });
          }

          if (action === 'txlist') {
            return HttpResponse.json({
              status: '1',
              message: 'OK',
              result: [],
            });
          }

          return HttpResponse.json({ status: '0', message: 'Unknown action' });
        })
      );

      const info = await client.getAddressInfo(
        1,
        '0x7777777777777777777777777777777777777777'
      );

      expect(info.balance).toBe('0');
    });
  });

  describe('error handling and retry', () => {
    it('should retry on 429 rate limit and eventually succeed', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.etherscan.io/api', () => {
          requestCount++;
          if (requestCount < 3) {
            return new HttpResponse(null, { status: 429 });
          }
          return HttpResponse.json({
            status: '1',
            message: 'OK',
            result: [
              {
                TokenHolderAddress: '0x1111111111111111111111111111111111111111',
                TokenHolderQuantity: '1000000000000000000',
              },
            ],
          });
        })
      );

      const holders = await client.getTopTokenHolders(
        1,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        10
      );

      expect(requestCount).toBe(3);
      expect(holders).toHaveLength(1);
    });

    it('should retry on 500 server error and eventually succeed', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.bscscan.com/api', () => {
          requestCount++;
          if (requestCount < 2) {
            return new HttpResponse(null, { status: 500 });
          }
          return HttpResponse.json({
            status: '1',
            message: 'OK',
            result: [
              {
                hash: '0xabc123',
                from: '0x1111111111111111111111111111111111111111',
                to: '0x2222222222222222222222222222222222222222',
                value: '1000000000000000000',
                timeStamp: '1699900000',
              },
            ],
          });
        })
      );

      const transfers = await client.getTokenTransfers(
        56,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        '0x3333333333333333333333333333333333333333'
      );

      expect(requestCount).toBe(2);
      expect(transfers).toHaveLength(1);
    });

    it(
      'should throw error after max retries exceeded',
      async () => {
        server.use(
          http.get('https://api.basescan.org/api', () => {
            return new HttpResponse(null, { status: 503 });
          })
        );

        await expect(
          client.getTokenTransfers(
            8453,
            '0xdAC17F958D2ee523a2206206994597C13D831ec7'
          )
        ).rejects.toThrow();
      },
      15000
    );
  });

  describe('utility methods', () => {
    it('should validate Ethereum addresses correctly', () => {
      expect(
        client.isValidAddress('0xdAC17F958D2ee523a2206206994597C13D831ec7')
      ).toBe(true);
      expect(client.isValidAddress('0xINVALID')).toBe(false);
      expect(client.isValidAddress('dac17f958d2ee523a2206206994597c13d831ec7')).toBe(
        false
      );
    });

    it('should format token amounts correctly', () => {
      expect(client.formatTokenAmount('1000000000000000000')).toBe('1');
      expect(client.formatTokenAmount('500000000000000000', 18)).toBe('0.5');
    });

    it('should generate correct explorer URLs', () => {
      expect(client.getExplorerAddressUrl(1, '0xabc')).toBe(
        'https://etherscan.io/address/0xabc'
      );
      expect(client.getExplorerTxUrl(56, '0xtx')).toBe(
        'https://bscscan.com/tx/0xtx'
      );
      expect(client.getExplorerAddressUrl(8453, '0xbase')).toBe(
        'https://basescan.org/address/0xbase'
      );
    });
  });
});
