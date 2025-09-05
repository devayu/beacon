import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ChevronsRight } from "lucide-react";

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-accent-foreground",
      success: "text-secondary",
      destructive: "",
      outline:
        "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
      secondary:
        "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost:
        "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "size-4",
      sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
const ChevronsRightIcon = ({
  className,
  variant,
  size,
}: { className?: string } & VariantProps<typeof iconVariants>) => {
  return (
    <ChevronsRight className={cn(iconVariants({ variant, size, className }))} />
  );
};

export default ChevronsRightIcon;
