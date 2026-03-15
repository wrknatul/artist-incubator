import { useState, useEffect } from 'react';
import { OrderCard } from './OrderCard';
import { generateOrderPool, type GeneratedOrder } from '@/lib/clientSystem';
import type { FreelanceOrder } from '@/lib/gameData';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FreelanceBoardProps {
  onAcceptOrder: (order: FreelanceOrder) => void;
}

export function FreelanceBoard({ onAcceptOrder }: FreelanceBoardProps) {
  const [orders, setOrders] = useState<GeneratedOrder[]>([]);

  useEffect(() => {
    setOrders(generateOrderPool(4));
  }, []);

  const refreshOrders = () => {
    setOrders(generateOrderPool(4));
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-mono mb-1">
              <span className="text-primary">{'>'}</span> Биржа фриланса
            </h1>
            <p className="text-muted-foreground text-sm">Выбери заказ и начни кодить 💻</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshOrders} className="gap-1.5 font-mono text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Обновить
          </Button>
        </div>

        <div className="grid gap-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onAccept={onAcceptOrder} />
          ))}
        </div>
      </div>
    </div>
  );
}
