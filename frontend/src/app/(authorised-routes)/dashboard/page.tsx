"use client";

import { Button } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { DraftsTable } from "@/components";
import { Card } from "@/components/ui";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";
import { Draft } from "@/types/draft";
import { APIError } from "@/types/error";


const Dashboard = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response: AxiosResponse<Draft[]> = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/draft`, { withCredentials: true });
      setDrafts(response.data);
      console.log("Axios Response: ", response);
    }
    catch (error) {
      const err = error as APIError;
      toast.error(err.response?.data?.message || "Unable to Fetch Drafts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center my-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p> View and manage your drafts here. </p>
        <Button onClick={fetchDrafts} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <Card className="rounded-2xl border shadow-sm overflow-hidden w-full max-w-6xl">
        {loading ? (
          <p className="p-4">Loading drafts...</p>
        ) : drafts.length === 0 ? (
          <p className="p-4">No drafts available.</p>
        ) : (
          <DraftsTable drafts={drafts} />
        )}
      </Card>
    </div>
  )
};

export default Dashboard;
