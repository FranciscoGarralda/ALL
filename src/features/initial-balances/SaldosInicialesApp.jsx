import React, { useState, useEffect } from 'react';
import { Wallet, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { formatAmountWithCurrency } from '../../shared/components/forms';
import { initialBalanceService } from '../../shared/services/initialBalanceService';
import { walletTypes, walletTypesTC, monedas } from '../../shared/constants';
import { safeParseFloat } from '../../shared/services/safeOperations';

function SaldosInicialesApp() {
  const [balances, setBalances] = useState({});
  const [selectedMoneda, setSelectedMoneda] = useState('PESO');
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar saldos iniciales al montar
  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = () => {
    const currentBalances = initialBalanceService.getAllBalancesByCuenta();
    setBalances(currentBalances);
    setHasChanges(false);
  };

  // Obtener todas las cuentas disponibles
  const allWallets = [...new Set([...walletTypes, ...walletTypesTC])];

  // Manejar cambio de saldo
  const handleBalanceChange = (cuenta, moneda, value) => {
    const newBalances = { ...balances };
    if (!newBalances[cuenta]) {
      newBalances[cuenta] = {};
    }
    newBalances[cuenta][moneda] = value;
    setBalances(newBalances);
    setHasChanges(true);
  };

  // Guardar todos los cambios
  const handleSaveAll = () => {
    Object.entries(balances).forEach(([cuenta, monedas]) => {
      Object.entries(monedas).forEach(([moneda, monto]) => {
        initialBalanceService.setBalance(cuenta, moneda, monto);
      });
    });
    setHasChanges(false);
    alert('Saldos iniciales guardados correctamente');
  };

  // Calcular total por moneda
  const totalesPorMoneda = {};
  Object.values(balances).forEach(cuentaMonedas => {
    Object.entries(cuentaMonedas || {}).forEach(([moneda, monto]) => {
      if (!totalesPorMoneda[moneda]) {
        totalesPorMoneda[moneda] = 0;
      }
      totalesPorMoneda[moneda] += safeParseFloat(monto, 0);
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3 safe-top safe-bottom pt-24">
      <div className="w-full px-2 sm:px-3 lg:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Saldos Iniciales</h1>
                  <p className="text-sm text-gray-600">Configurar saldos de apertura por cuenta</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadBalances}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Recargar"
                >
                  <RefreshCw size={20} />
                </button>
                {hasChanges && (
                  <button
                    onClick={handleSaveAll}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save size={18} />
                    <span className="hidden sm:inline">Guardar Cambios</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Selector de moneda */}
          <div className="p-3 sm:p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {monedas.filter(m => m.value !== '').map(moneda => (
                <button
                  key={moneda.value}
                  onClick={() => setSelectedMoneda(moneda.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedMoneda === moneda.value
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{moneda.emoji}</span>
                  {moneda.value}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de saldos por cuenta */}
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-4">
              {/* Total de la moneda seleccionada */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total {selectedMoneda}</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatAmountWithCurrency(totalesPorMoneda[selectedMoneda] || 0, selectedMoneda)}
                  </span>
                </div>
              </div>

              {/* Lista de cuentas */}
              <div className="space-y-2">
                {allWallets.map(wallet => {
                  const saldoActual = balances[wallet]?.[selectedMoneda] || '';
                  
                  return (
                    <div key={wallet} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{wallet}</p>
                          <p className="text-xs text-gray-500">Saldo inicial en {selectedMoneda}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={saldoActual}
                            onChange={(e) => handleBalanceChange(wallet, selectedMoneda, e.target.value)}
                            placeholder="0.00"
                            className="w-32 sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-right"
                            step="0.01"
                          />
                          {saldoActual && (
                            <span className="text-sm text-gray-600 hidden sm:inline">
                              = {formatAmountWithCurrency(saldoActual, selectedMoneda)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">¿Para qué sirven los saldos iniciales?</p>
              <p>
                Los saldos iniciales representan el dinero que tenías en cada cuenta antes de 
                empezar a usar el sistema. El módulo de Saldos sumará todos los movimientos 
                a partir de estos valores iniciales para mostrar el saldo actual real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaldosInicialesApp;