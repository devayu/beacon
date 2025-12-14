import { getRegisteredRoutes } from "@/dal/routes/get-routes";
import { Badge } from "@/components/ui/badge";
import { Route } from "@beacon/db";

const RouteList = async () => {
  // const routes = await getRegisteredRoutes();
  const routes = [
    {
      id: "1",
      url: "https://example.com",
      createdAt: new Date(),
      metadata: {
        name: "Example",
        type: "URL",
      },
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      {routes.map(({ id, url, createdAt, metadata }) => {
        return (
          <a
            key={id}
            href={`/routes/${id}`}
            className="border p-4 hover:border-accent-foreground cursor-pointer rounded-md"
          >
            <div>
              {(metadata as any)?.name ? (
                <div>
                  <div className="font-serif text-lg flex items-center gap-2">
                    <p> {(metadata as any)?.name}</p>
                    <Badge variant="outline" className="font-sans">
                      {(metadata as any)?.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{url}</p>
                </div>
              ) : (
                <p className="font-serif text-lg">{url}</p>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default RouteList;
