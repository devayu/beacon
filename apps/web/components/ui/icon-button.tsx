"use client";
import { Button, ButtonVariants } from "@/components/ui/button";
import ChevronsRightIcon from "@/components/ui/chevron-right-icon";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const borderClasses = {
  secondary: "border-secondary",
  ghost: "border-border",
  destructive: "border-secondary",
  success: "border-secondary",
  default: "border-border",
  link: "border-border",
  outline: "border-border",
};
const IconButton = (
  props: React.ComponentProps<"button"> &
    ButtonVariants & { iconClassName?: string }
) => {
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
        buttonRef.current?.removeEventListener("mouseenter", onMouseEnter);
        buttonRef.current?.removeEventListener("mouseleave", onMouseLeave);
      };
    },
    { scope: buttonRef }
  );
  return (
    <Button
      variant={props.variant}
      {...props}
      className={cn(
        "border-[1px] uppercase text-xs tracking-wider h-10 py-1 px-0 gap-0 cursor-pointer hover:border-[1px] font-sans",
        props.className
      )}
      ref={buttonRef}
    >
      <div className="p-4">{props.children}</div>
      <div
        className={cn(
          "border-l-1 h-full flex items-center justify-center p-2 border-border",
          props.variant && borderClasses[props.variant]
        )}
        ref={divRef}
      >
        <ChevronsRightIcon
          variant={props.variant}
          className={props.iconClassName}
        ></ChevronsRightIcon>
      </div>
    </Button>
  );
};

export default IconButton;
// 1px solid #bfbfbf
