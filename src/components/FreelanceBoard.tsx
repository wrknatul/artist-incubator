import { OrderCard } from './OrderCard';
import { FREELANCE_ORDERS, type FreelanceOrder } from '@/lib/gameData';

interface FreelanceBoardProps {
  onAcceptOrder: (order: FreelanceOrder) => void;
}

export function FreelanceBoard({ onAcceptOrder }: FreelanceBoardProps) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-mono mb-1">
            <span className="text-primary">{'>'}</span> Биржа фриланса
          </h1>
          <p className="text-muted-foreground text-sm">Выбери заказ и начни кодить 💻</p>
        </div>

        <div className="grid gap-4">
          {FREELANCE_ORDERS.map(order => (
            <OrderCard key={order.id} order={order} onAccept={onAcceptOrder} />
          ))}
        </div>
      </div>
    </div>
  );
}
