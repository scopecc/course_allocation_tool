"use client";

import React, { ReactNode, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

const AuthorizedLayout = ({ children }: { children: ReactNode }) => {

  return (
    <div className="flex flex-col items-center h-screen w-screen">
      <nav className="w-full">
        <NavigationMenu className="mx-2">
          <NavigationMenuList  className="flex justify-center gap-2 my-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/dashboard">Dashboard</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/export">Export</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <section className="w-full px-4">
        {children}
      </section>
      <div className="fixed bottom-4 right-4">
        <ModeToggle />
      </div>
    </div>
  )
};

export default AuthorizedLayout;
