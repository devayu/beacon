import { Skeleton } from "@/components/ui/skeleton";

const RouteListLoader = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className={`flex flex-col space-y-3 p-4 border rounded-md`}
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </>
  );
};

export default RouteListLoader;
