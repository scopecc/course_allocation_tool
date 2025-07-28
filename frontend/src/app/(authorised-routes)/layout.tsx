"use client";

import React, { ReactNode, useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import axios from "axios";
import { ModeToggle } from "@/components/mode-toggle";
import { UserAccountPopover } from "@/components/UserAccountPopover";

interface UserInfo {
  userId: string;
  employeeId: string;
  email: string;
}

const AuthorizedLayout = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        { withCredentials: true }
      );
      setUserInfo(res.data.user);
      console.log(res.data);
    } catch (err) {
      console.log("im too old for ts", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center h-screen w-full">
      <div className="flex flex-row w-full place-content-around">
        <nav className="w-full">
          <NavigationMenu className="mx-2">
            <NavigationMenuList className="flex justify-center gap-2 my-2">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/dashboard">Dashboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div>
          {/* TODO: add username modal here */}
          <UserAccountPopover userInfo={userInfo!} />
        </div>
      </div>
      <section className="w-full px-4">{children}</section>
      <div className="fixed bottom-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
};

export default AuthorizedLayout;
