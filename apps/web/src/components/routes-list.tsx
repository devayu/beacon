import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  Globe,
  ChevronRight,
  ShoppingCart,
  Heart,
  GraduationCap,
  Landmark,
  Scale,
  Building2,
  HandHeart,
  Briefcase,
  Newspaper,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RouteListProps {
  routes: any[];
}

// Map website types to icons
const typeIconMap: Record<string, LucideIcon> = {
  ecommerce: ShoppingCart,
  healthcare: Heart,
  education: GraduationCap,
  finance: Landmark,
  legal: Scale,
  government: Building2,
  nonprofit: HandHeart,
  corporate: Briefcase,
  media: Newspaper,
  technology: Cpu,
  other: Globe,
  web: Globe,
};

const getTypeIcon = (type: string): LucideIcon => {
  const normalizedType = type?.toLowerCase() || "web";
  return typeIconMap[normalizedType] || Globe;
};

const RouteList = ({ routes }: RouteListProps) => {
  if (routes.length === 0) {
    return (
      <div className="relative text-center py-16 border-2 border-dashed border-border/40 rounded-2xl bg-card/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No routes registered yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Get started by registering a new route using the button above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {routes.map(({ id, url, createdAt, metadata }, index) => {
        const name = (metadata as any)?.name;
        const type = (metadata as any)?.type || "Web";
        const TypeIcon = getTypeIcon(type);

        return (
          <a
            key={id}
            href={`/routes/${id}`}
            className="group block h-full relative"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card
              className={cn(
                "h-full relative overflow-hidden",
                "bg-card/60 backdrop-blur-sm",
                "border-border/40 hover:border-primary/30",
                "transition-all duration-300",
                "group-hover:-translate-y-1 group-hover:shadow-lg"
              )}
            >
              <CardHeader className="pb-3 relative">
                <div className="flex items-start gap-3">
                  {/* Icon with type label below */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className={cn(
                        "relative p-2.5 rounded-xl",
                        "bg-gradient-to-br from-primary/15 to-primary/5",
                        "border border-primary/20",
                        "group-hover:border-primary/40 transition-colors"
                      )}
                    >
                      <TypeIcon className="w-5 h-5 text-primary relative" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                      {type}
                    </span>
                  </div>

                  {/* Title and URL */}
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="font-medium text-base truncate leading-tight group-hover:text-primary transition-colors">
                      {name || new URL(url).hostname}
                    </h3>
                    {name && (
                      <p className="text-xs text-muted-foreground truncate font-mono opacity-70 group-hover:opacity-100 transition-opacity mt-1">
                        {new URL(url).hostname}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-mono">
                      {format(new Date(createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      "text-muted-foreground group-hover:text-primary",
                      "transition-all duration-300"
                    )}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </span>
                    <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
};

export default RouteList;
