import { useState } from 'react';

interface PriceAlertProps {
  currency: string;
  currentPrice: number;
  onSetAlert: (currency: string, targetPrice: number, type: 'above' | 'below') => void;
}

export default function PriceAlert({ currency, currentPrice, onSetAlert }: PriceAlertProps) {
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (price > 0) {
      onSetAlert(currency, price, alertType);
      setShowForm(false);
      setTargetPrice(currentPrice.toString());
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🔔 Price Alerts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Alert'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Alert when {currency} price is:</label>
            <div className="flex gap-2">
              <select
                aria-label="Alert type"
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as 'above' | 'below')}
                className="bg-slate-700 px-4 py-2 rounded-lg"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Target price"
                className="flex-1 bg-slate-700 px-4 py-2 rounded-lg"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Set Alert
          </button>
        </form>
      )}

      <div className="mt-4 text-sm text-white/40">
        <p>Current {currency} price: ${currentPrice.toFixed(2)}</p>
      </div>
    </div>
  );
}
