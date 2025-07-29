'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { SetStateAction, useState } from "react";

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleMenuChange = (value: SetStateAction<string>) => {
    setActiveMenu(value);
    setIsOpen(value !== "");
  };

  return (
    <div className="hidden lg:flex">
      <NavigationMenu value={activeMenu} onValueChange={handleMenuChange}>
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/products"
              onClick={handleLinkClick}
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50/50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-red-50/50 data-[state=open]:bg-red-50/50",
                "text-slate-700"
              )}
            >
              Products
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              href="/leads"
              onClick={handleLinkClick}
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-red-50/50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-red-50/50 data-[state=open]:bg-red-50/50",
                "text-slate-700"
              )}
            >
              Leads
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
