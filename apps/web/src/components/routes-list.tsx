import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";

interface RouteListProps {
  routes: any[];
}

const RouteList = ({ routes }: RouteListProps) => {
  if (routes.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl">
        <p className="text-muted-foreground">No routes registered yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Get started by registering a new route above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {routes.map(({ id, url, createdAt, metadata }) => {
        const name = (metadata as any)?.name;
        const type = (metadata as any)?.type || "Web";

        return (
          <a
            key={id}
            href={`/routes/${id}`}
            className="group block h-full relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <Card className="h-full relative bg-card border-muted-foreground/10 transition-all duration-300 group-hover:-translate-y-1">
              <CardHeader className="pb-3 relative">
                <div className="space-y-1.5 pr-20 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                      <Globe className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-lg truncate leading-tight">
                      {name || new URL(url).hostname}
                    </h3>
                  </div>
                  {name && (
                    <p className="text-xs text-muted-foreground truncate pl-10 font-mono opacity-80">
                      {url}
                    </p>
                  )}
                </div>
                <div className="absolute top-6 right-6 px-2 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground text-[10px] font-medium border border-border/50 uppercase tracking-widest shadow-sm">
                  {type}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Added {format(new Date(createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
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
