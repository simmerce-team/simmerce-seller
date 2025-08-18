"use client"

import {
  LayoutGrid,
  MessageCircle,
  ShoppingBag
} from "lucide-react"
import * as React from "react"

import { AppHeader } from "@/components/layout/app-header"
import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

// This is sample data.
const 
  navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Products",
      url: "/products",
      icon: ShoppingBag,
      items: [
        {
          title: "Add Product",
          url: "/products/add",
        },
        {
          title: "All Products",
          url: "/products",
        },
      ],
    },
    {
      title: "Enquiries",
      url: "/enquiries",
      icon: MessageCircle,
    },
  ];


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  const {user, signOut} = useAuth();

  if(!user) {
    return null;
  }

  const profile = {
    name: user?.user_metadata.full_name || "",
    email: user?.email || "",
    avatar: user?.user_metadata.avatar_url,
    plan: user?.user_metadata.plan || "Free",
  }
  
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <AppHeader plan={profile.plan}/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profile} signOut={signOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
