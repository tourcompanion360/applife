import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: "soldi" | "mente" | "corpo";
  onNavigate: () => void;
  stats?: { label: string; value: string | number }[];
}

export const SectionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  variant, 
  onNavigate,
  stats = []
}: SectionCardProps) => {
  const gradientStyles = {
    soldi: "bg-gradient-soldi",
    mente: "bg-gradient-mente",
    corpo: "bg-gradient-corpo",
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className={cn("p-8 text-white relative overflow-hidden", gradientStyles[variant])}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
        <div className="relative z-10">
          <Icon className="h-12 w-12 mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          onClick={onNavigate}
          variant="outline" 
          className="w-full"
        >
          Vai alla sezione
        </Button>
      </div>
    </Card>
  );
};
