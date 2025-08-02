
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
import { Menu } from "lucide-react";
import Link from "next/link";
import { MegaMenu } from "./navigation/mega-menu";
import UserDropdown from "./user-dropdown";

// Types
interface NavigationLink {
  href: string;
  label: string;
  active?: boolean;
}

// Mobile navigation links
const mobileNavigationLinks: NavigationLink[] = [
  { href: "/dashboard", label: "Dashboard", active: true },
  { href: "/products", label: "Products" },
];

interface HeaderProps {
  // Add any props here if needed in the future
  // Example: user?: User;
}

/**
 * Header component that renders the main navigation bar
 * @component
 * @example
 * return <Header />
 */
const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60" role="banner">
      <header className="h-[70px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between gap-6 max-w-7xl mx-auto">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group size-9 md:hidden hover:bg-slate-100"
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle navigation menu"
                  aria-expanded={false}
                  aria-controls="mobile-navigation"
                >
                  <Menu />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                id="mobile-navigation"
                align="start"
                className="w-48 p-2 md:hidden border-slate-200 shadow-lg"
                role="navigation"
                aria-label="Main navigation"
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
              className="flex items-center gap-2 sm:gap-3 text-slate-800 hover:text-red-600 transition-colors group"
              aria-label="Simmerce - Go to dashboard"
            >
              <img
                src={Images.logo512}
                alt="Simmerce"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
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
          <div className="flex items-center gap-1 sm:gap-2">
            {/* User Dropdown */}
            <div className="ml-1">
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
