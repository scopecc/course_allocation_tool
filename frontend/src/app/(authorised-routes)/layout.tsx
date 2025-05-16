"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthorizedLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    }
  }, []);
  return <div>{children}</div>;
};

export default AuthorizedLayout;
