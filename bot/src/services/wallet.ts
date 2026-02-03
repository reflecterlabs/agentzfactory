import { ec, stark, hash, CallData } from 'starknet';
import { encrypt } from '../utils/crypto';
import { Wallet } from '../types';

// Class hash de Argent X account (open source, ya deployado en mainnet)
const ARGENT_CLASS_HASH = '0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044d6eaa';

export class WalletService {
  /**
   * Genera una wallet única para un usuario
   * La dirección puede recibir STRK sin deploy previo
   */
  async generateWallet(userId: string): Promise<Omit<Wallet, 'id' | 'createdAt'>> {
    // Generar private key aleatoria criptográficamente segura
    const privateKey = stark.randomAddress();
    
    // Calcular public key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    
    // Calcular dirección del contrato de account (Argent X style)
    const address = this.calculateAccountAddress(publicKey);
    
    // Encriptar private key para almacenamiento seguro
    const encryptedPrivateKey = await encrypt(privateKey);
    
    return {
      userId,
      address,
      encryptedPrivateKey,
      publicKey
    };
  }

  /**
   * Calcula la dirección del contrato de account Argent X
   * Esta dirección puede recibir tokens ERC20 sin necesidad de deploy
   */
  private calculateAccountAddress(publicKey: string): string {
    // Constructor calldata para Argent X account
    const constructorCalldata = CallData.compile({
      owner: publicKey,
      guardian: '0' // Sin guardian para simplificar
    });
    
    // Calcular dirección: hash de class_hash + salt + constructor_calldata
    const address = hash.calculateContractAddressFromHash(
      publicKey, // salt
      ARGENT_CLASS_HASH,
      constructorCalldata,
      '0' // deployer address (0 para undepolyed)
    );
    
    return address;
  }
}

export const walletService = new WalletService();
