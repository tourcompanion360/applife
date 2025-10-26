import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant: "soldi" | "mente" | "corpo";
  className?: string;
}

export const StatCard = ({ title, value, subtitle, icon: Icon, variant, className }: StatCardProps) => {
  const variantStyles = {
    soldi: "bg-soldi-light border-soldi/20 hover:border-soldi/40",
    mente: "bg-mente-light border-mente/20 hover:border-mente/40",
    corpo: "bg-corpo-light border-corpo/20 hover:border-corpo/40",
  };

  const iconStyles = {
    soldi: "text-soldi",
    mente: "text-mente",
    corpo: "text-corpo",
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-lg",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-xl bg-card", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};
