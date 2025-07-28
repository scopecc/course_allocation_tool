"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "./ui";
import { User } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface UserInfo {
  userId: string;
  employeeId: string;
  email: string;
}

interface UserAccountPopoverProps {
  userInfo: UserInfo;
}

export function UserAccountPopover({ userInfo }: UserAccountPopoverProps) {
  const router = useRouter();

  const logout = async () => {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      withCredentials: true,
    });
    router.push("/signin");
  };

  return (
    <Popover>
      <PopoverTrigger className="p-2">
        <Button variant="secondary" className="rounded-full">
          <User />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col p-4 mx-2 gap-y-2 items-center justify-center text-center">
        Signed in as:
        <div className="space-y-1">
          <div className="flex gap-2">
            <span className="font-medium">Employee ID:</span>
            <span>{userInfo?.employeeId ?? "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">Email:</span>
            <span>{userInfo?.email ?? "-"}</span>
          </div>
        </div>
        <div className="mx-5">
          <Button onClick={logout} className="mt-2 w-full">
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
