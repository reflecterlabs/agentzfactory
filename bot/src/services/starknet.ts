import { Provider, Contract, hash } from 'starknet';
import { Payment } from '../types';
import { STRK_TOKEN_ADDRESS } from '../config';

const ERC20_ABI = [
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{ "name": "account", "type": "felt" }],
    "outputs": [{ "name": "balance", "type": "Uint256" }],
    "stateMutability": "view"
  }
];

export class StarknetMonitor {
  private provider: Provider;
  private strkContract: Contract;

  constructor() {
    this.provider = new Provider({
      sequencer: { 
        baseUrl: 'https://alpha-mainnet.starknet.io'
      }
    });
    
    this.strkContract = new Contract(
      ERC20_ABI as any,
      STRK_TOKEN_ADDRESS,
      this.provider
    );
  }

  /**
   * Verifica el balance de STRK de una dirección específica
   */
  async checkBalance(address: string): Promise<bigint> {
    try {
      const balance = await this.strkContract.balanceOf(address);
      // Balance viene como objeto { low, high }
      const low = BigInt(balance.low?.toString() || '0');
      const high = BigInt(balance.high?.toString() || '0');
      return (high << 128n) + low;
    } catch (error) {
      console.error(`Error checking balance for ${address}:`, error);
      return 0n;
    }
  }

  /**
   * Escanea múltiples direcciones y detecta pagos
   */
  async scanAddresses(payments: Payment[]): Promise<Array<{ payment: Payment; balance: bigint; received: boolean }>> {
    const results = [];

    for (const payment of payments) {
      try {
        const balance = await this.checkBalance(payment.walletAddress);
        const expectedWei = this.strkToWei(payment.expectedAmount);
        
        results.push({
          payment,
          balance,
          received: balance >= expectedWei
        });
        
        // Pequeño delay para no saturar el provider
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error scanning ${payment.walletAddress}:`, error);
        results.push({
          payment,
          balance: 0n,
          received: false
        });
      }
    }

    return results;
  }

  /**
   * Convierte STRK human-readable a wei (18 decimales)
   */
  private strkToWei(amount: string): bigint {
    const [whole, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(18, '0').slice(0, 18);
    return BigInt(whole + paddedFraction);
  }
}

export const starknetMonitor = new StarknetMonitor();
