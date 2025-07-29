import { UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Images } from "@/utils/constant";
import Link from "next/link";
import { MegaMenu } from "./navigation/mega-menu";

// Mobile navigation links
const mobileNavigationLinks = [
  { href: "/dashboard", label: "Dashboard", active: true },
  { href: "/products", label: "Products" },
  { href: "/leads", label: "Leads" },
  { href: "/inventory", label: "Inventory" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60">
      {/* Main Header - Clean with only logo, search, and actions */}
      <header className="h-[70px] px-6 md:px-8">
        <div className="flex h-full items-center justify-between gap-6 max-w-7xl mx-auto">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group size-9 md:hidden hover:bg-slate-100"
                  variant="ghost"
                  size="icon"
                >
                  <svg
                    className="pointer-events-none"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-48 p-2 md:hidden border-slate-200 shadow-lg"
              >
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {mobileNavigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink
                          href={link.href}
                          className="py-2 px-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded transition-colors block w-full"
                          active={link.active}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>

            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 text-slate-800 hover:text-red-600 transition-colors group"
            >
              <img
                src={Images.logo512}
                alt="Simmerce"
                className="w-11 h-11 rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
              />
              <div className="hidden md:block">
                <span className="text-xl font-semibold tracking-tight">
                  Simmerce
                </span>
                <div className="text-xs text-slate-500 font-medium">
                  B2B Marketplace
                </div>
              </div>
            </Link>
          </div>

          {/* Middle area - Search */}
          <div className="flex-1 mx-8 hidden md:block">
            <MegaMenu />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-3">
            {/* Chat */}
            {/* <Link href="/chat">
              <Button
                variant="outline"
                size="icon"
                className="size-10 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors relative"
              >
                <MessageCircle className="w-4 h-4 text-slate-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              </Button>
            </Link> */}

            {/* User menu */}
            <Button
              variant="outline"
              size="icon"
              className="size-10 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
