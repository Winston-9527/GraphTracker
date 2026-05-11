import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenInfo } from '../TokenInfo';
import type { BinanceAlphaToken } from '@/types';

const mockToken: BinanceAlphaToken = {
  alphaId: 'alpha-001',
  symbol: 'PEPE',
  name: 'Pepe',
  chainId: '1',
  chainName: 'Ethereum',
  contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  price: '0.00001234',
  percentChange24h: '+15.42',
  volume24h: '2456789012',
  marketCap: '5234567890',
  liquidity: '890123456',
  totalSupply: '420690000000000',
  circulatingSupply: '420690000000000',
  iconUrl: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  chainIconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  bnExclusiveState: false,
};

const bscToken: BinanceAlphaToken = {
  ...mockToken,
  chainId: '56',
  chainName: 'BSC',
  contractAddress: '0x55d398326f99059fF775485246999027B3197955',
};

describe('TokenInfo', () => {
  it('renders empty state when no token is provided', () => {
    render(<TokenInfo token={null} />);

    expect(screen.getByText('Select a token to view details')).toBeInTheDocument();
  });

  it('renders token details correctly', () => {
    render(<TokenInfo token={mockToken} />);

    expect(screen.getByText('PEPE')).toBeInTheDocument();
    expect(screen.getByText('Pepe')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText(/Market Cap/)).toBeInTheDocument();
    expect(screen.getByText(/Volume \(24h\)/)).toBeInTheDocument();
  });

  it('displays truncated contract address', () => {
    render(<TokenInfo token={mockToken} />);

    expect(screen.getByTestId('contract-address')).toHaveTextContent('0x6982...1933');
  });

  it('shows positive change in emerald color', () => {
    render(<TokenInfo token={mockToken} />);

    const changeEl = screen.getByText('+15.42%');
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.className).toContain('text-emerald-400');
  });

  it('shows negative change in rose color', () => {
    const negativeToken = { ...mockToken, percentChange24h: '-8.23' };
    render(<TokenInfo token={negativeToken} />);

    const changeEl = screen.getByText('-8.23%');
    expect(changeEl.className).toContain('text-rose-400');
  });

  it('renders external explorer link with correct URL', () => {
    render(<TokenInfo token={mockToken} />);

    const link = screen.getByTestId('explorer-link');
    expect(link).toHaveAttribute('href', 'https://etherscan.io/token/0x6982508145454Ce325dDbE47a25d4ec3d2311933');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders BscScan link for BSC token', () => {
    render(<TokenInfo token={bscToken} />);

    const link = screen.getByTestId('explorer-link');
    expect(link).toHaveAttribute('href', 'https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955');
    expect(link).toHaveTextContent('BscScan');
  });

  it('renders Binance Alpha link', () => {
    render(<TokenInfo token={mockToken} />);

    const link = screen.getByTestId('alpha-link');
    expect(link).toHaveAttribute('href', 'https://www.binance.com/en/alpha/token/PEPE');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('copies address to clipboard when copy button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<TokenInfo token={mockToken} />);

    const copyBtn = screen.getByTestId('copy-address-btn');
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith(mockToken.contractAddress);
  });

  it('does not render explorer link for unsupported chain', () => {
    const unknownChainToken = { ...mockToken, chainId: '999' };
    render(<TokenInfo token={unknownChainToken} />);

    expect(screen.queryByTestId('explorer-link')).not.toBeInTheDocument();
    expect(screen.getByTestId('alpha-link')).toBeInTheDocument();
  });
});
