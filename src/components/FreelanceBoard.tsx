import { useState, useEffect, useMemo } from 'react';
import { OrderCard } from './OrderCard';
import { generateOrderPool, type GeneratedOrder, INDUSTRIES } from '@/lib/clientSystem';
import type { FreelanceOrder } from '@/lib/gameData';
import { RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PROJECT_TYPES = ['Лендинг', 'Интернет-магазин', 'SaaS', 'Портфолио', 'Блог', 'Корпоративный сайт'];

const BUDGET_RANGES = [
  { label: 'До $500', min: 0, max: 500 },
  { label: '$500 – $1000', min: 500, max: 1000 },
  { label: '$1000 – $2000', min: 1000, max: 2000 },
  { label: '$2000+', min: 2000, max: Infinity },
];

const DIFFICULTIES = [
  { value: 'easy' as const, label: 'Лёгкий' },
  { value: 'medium' as const, label: 'Средний' },
  { value: 'hard' as const, label: 'Сложный' },
];

const DEADLINES = [
  { value: 'flexible' as const, label: 'Гибкий' },
  { value: 'tight' as const, label: 'Жёсткий' },
  { value: 'yesterday' as const, label: 'Вчера!' },
];

interface FreelanceBoardProps {
  onAcceptOrder: (order: FreelanceOrder) => void;
}

export function FreelanceBoard({ onAcceptOrder }: FreelanceBoardProps) {
  const [orders, setOrders] = useState<GeneratedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<number | null>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    setOrders(generateOrderPool(10));
  }, []);

  const refreshOrders = () => {
    setOrders(generateOrderPool(10));
    clearFilters();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedIndustries([]);
    setSelectedBudgetRange(null);
    setSelectedDifficulties([]);
    setSelectedDeadlines([]);
  };

  const toggleFilter = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length || selectedIndustries.length || selectedBudgetRange !== null || selectedDifficulties.length || selectedDeadlines.length;

  // Count orders per category for filter badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.category] = (counts[o.category] || 0) + 1; });
    return counts;
  }, [orders]);

  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.industry] = (counts[o.industry] || 0) + 1; });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!order.title.toLowerCase().includes(q) && !order.description.toLowerCase().includes(q) && !order.clientName.toLowerCase().includes(q)) return false;
      }
      if (selectedCategories.length && !selectedCategories.includes(order.category)) return false;
      if (selectedIndustries.length && !selectedIndustries.includes(order.industry)) return false;
      if (selectedBudgetRange !== null) {
        const range = BUDGET_RANGES[selectedBudgetRange];
        if (order.budget < range.min || order.budget > range.max) return false;
      }
      if (selectedDifficulties.length && !selectedDifficulties.includes(order.difficulty)) return false;
      if (selectedDeadlines.length && !selectedDeadlines.includes(order.deadline)) return false;
      return true;
    });
  }, [orders, searchQuery, selectedCategories, selectedIndustries, selectedBudgetRange, selectedDifficulties, selectedDeadlines]);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Sidebar Filters */}
      {showFilters && (
        <aside className="w-[260px] min-w-[240px] border-r bg-card overflow-y-auto p-4 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              Фильтры
            </h2>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[10px] text-muted-foreground hover:text-foreground font-mono">
                Сбросить
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ключевые слова..."
              className="w-full bg-muted border rounded-md pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          {/* Categories */}
          <FilterSection title="Рубрики">
            {PROJECT_TYPES.map(cat => {
              const count = categoryCounts[cat] || 0;
              const active = selectedCategories.includes(cat);
              return (
                <FilterCheckbox
                  key={cat}
                  label={cat}
                  count={count}
                  active={active}
                  onClick={() => toggleFilter(selectedCategories, cat, setSelectedCategories)}
                />
              );
            })}
          </FilterSection>

          {/* Budget */}
          <FilterSection title="Бюджет">
            {BUDGET_RANGES.map((range, i) => (
              <FilterCheckbox
                key={range.label}
                label={range.label}
                active={selectedBudgetRange === i}
                onClick={() => setSelectedBudgetRange(selectedBudgetRange === i ? null : i)}
              />
            ))}
          </FilterSection>

          {/* Difficulty */}
          <FilterSection title="Сложность">
            {DIFFICULTIES.map(d => (
              <FilterCheckbox
                key={d.value}
                label={d.label}
                active={selectedDifficulties.includes(d.value)}
                onClick={() => toggleFilter(selectedDifficulties, d.value, setSelectedDifficulties)}
              />
            ))}
          </FilterSection>

          {/* Deadline */}
          <FilterSection title="Срок">
            {DEADLINES.map(d => (
              <FilterCheckbox
                key={d.value}
                label={d.label}
                active={selectedDeadlines.includes(d.value)}
                onClick={() => toggleFilter(selectedDeadlines, d.value, setSelectedDeadlines)}
              />
            ))}
          </FilterSection>

          {/* Industry */}
          <FilterSection title="Отрасль">
            {INDUSTRIES.filter(ind => (industryCounts[ind] || 0) > 0).map(ind => (
              <FilterCheckbox
                key={ind}
                label={ind}
                count={industryCounts[ind] || 0}
                active={selectedIndustries.includes(ind)}
                onClick={() => toggleFilter(selectedIndustries, ind, setSelectedIndustries)}
              />
            ))}
          </FilterSection>

          {/* Stats */}
          <div className="border-t pt-3 mt-3">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">📊 Статистика биржи</p>
            <div className="space-y-0.5 text-[10px] text-muted-foreground">
              <div className="flex justify-between"><span>Проектов:</span><span className="text-foreground font-mono">{orders.length}</span></div>
              <div className="flex justify-between"><span>Общий бюджет:</span><span className="text-game-gold font-mono">${orders.reduce((s, o) => s + o.budget, 0).toLocaleString()}</span></div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-mono mb-1">
                <span className="text-primary">{'>'}</span> Биржа фриланса
              </h1>
              <p className="text-muted-foreground text-sm">
                {filteredOrders.length} из {orders.length} проектов
                {hasActiveFilters && <span className="text-primary"> (фильтр активен)</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5 font-mono text-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showFilters ? 'Скрыть' : 'Фильтры'}
              </Button>
              <Button variant="outline" size="sm" onClick={refreshOrders} className="gap-1.5 font-mono text-xs">
                <RefreshCw className="h-3.5 w-3.5" /> Обновить
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedCategories.map(c => (
                <FilterChip key={c} label={c} onRemove={() => toggleFilter(selectedCategories, c, setSelectedCategories)} />
              ))}
              {selectedIndustries.map(c => (
                <FilterChip key={c} label={c} onRemove={() => toggleFilter(selectedIndustries, c, setSelectedIndustries)} />
              ))}
              {selectedBudgetRange !== null && (
                <FilterChip label={BUDGET_RANGES[selectedBudgetRange].label} onRemove={() => setSelectedBudgetRange(null)} />
              )}
              {selectedDifficulties.map(d => (
                <FilterChip key={d} label={DIFFICULTIES.find(x => x.value === d)?.label || d} onRemove={() => toggleFilter(selectedDifficulties, d, setSelectedDifficulties)} />
              ))}
              {selectedDeadlines.map(d => (
                <FilterChip key={d} label={DEADLINES.find(x => x.value === d)?.label || d} onRemove={() => toggleFilter(selectedDeadlines, d, setSelectedDeadlines)} />
              ))}
              <button onClick={clearFilters} className="text-[10px] text-destructive hover:text-destructive/80 font-mono px-2 py-0.5">
                ✕ Сбросить все
              </button>
            </div>
          )}

          {/* Orders */}
          <div className="grid gap-3">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} onAccept={onAcceptOrder} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="font-mono text-sm">Нет заказов по заданным фильтрам</p>
                <p className="text-xs mt-1">Попробуйте изменить параметры или обновить биржу</p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3 font-mono text-xs">
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-mono font-semibold text-foreground mb-2">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-2 py-1.5 rounded text-xs transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${
          active ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'
        }`}>
          {active && '✓'}
        </span>
        <span className="font-mono">{label}</span>
      </span>
      {count !== undefined && (
        <span className="text-[10px] text-muted-foreground font-mono">({count})</span>
      )}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 text-[10px] font-mono">
      {label}
      <button onClick={onRemove} className="hover:text-destructive">
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
