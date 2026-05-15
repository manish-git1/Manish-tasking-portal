import { cn } from '@/lib/utils';

interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; }
export function Card({ children, className, onClick }: CardProps) {
  return (
    <div onClick={onClick} className={cn('bg-card border border-border rounded-2xl p-5 transition-all duration-200', onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5', className)}>
      {children}
    </div>
  );
}

interface StatCardProps { title: string; value: string | number; subtitle?: string; icon: React.ReactNode; trend?: number; color?: string; }
export function StatCard({ title, value, subtitle, icon, trend, color = 'text-primary' }: StatCardProps) {
  return (
    <Card className="card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={cn('text-xs font-medium mt-2', trend >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-accent', color)}>{icon}</div>
      </div>
    </Card>
  );
}
