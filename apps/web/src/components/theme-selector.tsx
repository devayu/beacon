"use client";

import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
    },
  ];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Monitor className="mr-2 size-4" />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <themeOption.icon className="mr-2 size-4" />
                {themeOption.label}
              </div>
              {theme === themeOption.value && (
                <Check className="siz-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export default ThemeSelector;
