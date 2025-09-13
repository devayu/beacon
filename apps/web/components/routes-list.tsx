import { Card } from "@/components/ui/card";
import IconButton from "@/components/ui/icon-button";
import { Route } from "@beacon/db";

type RouteListProps = {
  routes: Route[];
};
const RouteList = ({ routes = [] }: RouteListProps) => {
  return (
    <div className="flex flex-col gap-4">
      {routes.map(({ id, url, createdAt }) => {
        return (
          <a
            key={id}
            href={`/routes/${id}`}
            className="border p-4 hover:border-accent-foreground cursor-pointer rounded-md"
          >
            {url}
          </a>
        );
      })}
    </div>
  );
};

export default RouteList;
