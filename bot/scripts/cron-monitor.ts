import { starknetMonitor } from '../src/services/starknet';
import * as db from '../src/services/database';
import { Payment } from '../src/types';

// Procesar pagos pendientes
async function processPayments() {
  console.log(`[${new Date().toISOString()}] 🔍 Escaneando pagos pendientes...`);
  
  try {
    // Obtener pagos pendientes no expirados
    const pendingPayments = await db.getPendingPayments();
    
    if (pendingPayments.length === 0) {
      console.log('No hay pagos pendientes.');
      return;
    }
    
    console.log(`Encontrados ${pendingPayments.length} pagos pendientes`);
    
    // Escanear direcciones
    const results = await starknetMonitor.scanAddresses(pendingPayments);
    
    for (const result of results) {
      if (result.received && result.payment.status === 'pending') {
        console.log(`✅ Pago recibido: ${result.payment.id} - ${result.payment.walletAddress}`);
        
        // Marcar como recibido
        // Necesitamos el txHash, por ahora usamos un placeholder
        await db.markPaymentReceived(result.payment.id, 'pending_tx_lookup');
        
        // Activar PRO
        if (result.payment.creationId) {
          await activatePro(result.payment);
        }
        
        // Notificar al usuario (requeriría integración con Telegram API)
        // Por ahora solo loggeamos
        console.log(`🎉 PRO activado para usuario ${result.payment.userId}`);
      }
    }
    
    console.log('✅ Escaneo completado');
    
  } catch (error) {
    console.error('❌ Error en processPayments:', error);
  }
}

// Activar PRO para una creación
async function activatePro(payment: Payment) {
  try {
    if (!payment.creationId) return;
    
    // TODO: Implementar activación real PRO
    // 1. Crear proyecto Supabase
    // 2. Migrar datos mock
    // 3. Actualizar URLs
    
    await db.updateCreationToPro(payment.creationId, `https://pro.agentzfactory.com/${payment.creationId}`);
    await db.markPaymentConfirmed(payment.id);
    
    console.log(`✅ PRO activado para creación ${payment.creationId}`);
  } catch (error) {
    console.error('Error activando PRO:', error);
  }
}

// Ejecutar
processPayments().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
