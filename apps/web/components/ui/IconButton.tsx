"use client";
import { Button } from "@/components/ui/button";
import { ChevronsRight } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP); // register the hook to avoid React version discrepancies

const IconButton = (props: React.ComponentProps<"button">) => {
  const divRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useGSAP(
    (context, contextSafe) => {
      if (buttonRef == null || divRef == null) return;
      if (contextSafe == null) return;
      const onMouseEnter = contextSafe(() => {
        gsap.to(divRef.current, {
          height: "50%",
          duration: 0.25,
          ease: "power2.out",
        });
      });
      const onMouseLeave = contextSafe(() => {
        gsap.to(divRef.current, {
          height: "100%",
          duration: 0.25,
          ease: "power2.out",
        });
      });

      buttonRef.current?.addEventListener("mouseenter", onMouseEnter);
      buttonRef.current?.addEventListener("mouseleave", onMouseLeave);

      return () => {
        // <-- cleanup
        buttonRef.current?.removeEventListener("mouseenter", onMouseEnter);
        buttonRef.current?.removeEventListener("mouseleave", onMouseLeave);
      };
    },
    { scope: buttonRef }
  );
  return (
    <Button
      variant="default"
      {...props}
      className="border-[1px] bg-secondary uppercase text-xs tracking-wider h-10 py-1 px-0 gap-0 hover:border-accent-foreground cursor-pointer hover:border-[1px]"
      ref={buttonRef}
    >
      <div className="p-4">{props.children}</div>
      <div
        className="border-l-1 h-full flex items-center justify-center p-2 border-border"
        ref={divRef}
      >
        <ChevronsRight className="size-4 text-[#ff2d2d]" />
      </div>
    </Button>
  );
};

export default IconButton;
// 1px solid #bfbfbf
