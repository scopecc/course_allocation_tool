"use client";

import { Button } from "@/components/ui";
import React, { useState, useEffect } from "react";
import { DraftsTable } from "@/components";
import { Card } from "@/components/ui";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";
import { Draft } from "@/types/draft";
import { APIError } from "@/types/error";
import CreateDraftModal from "@/components/CreateDraftModal";
import { CreateDraftResponse } from "@/types/response";


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


  const handleCreateDraft = async (formData: FormData) => {
    try {
      const res: AxiosResponse<CreateDraftResponse> = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/draft`, formData, { withCredentials: true });
      if (res.status === 201) {
        toast.message('New draft created successfully.');
        fetchDrafts();
      } else {
        toast.message(res.data.message);
      }
    } catch (error) {
      console.log('Error while creating draft: ', error);
      toast.message('Error: Failed to create draft.');
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center my-10">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p> View and manage your drafts here. </p>
        <div className="flex flex-row mt-4 gap-4">
          <Button onClick={fetchDrafts} disabled={loading} variant="outline">
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <CreateDraftModal onSubmit={handleCreateDraft} />
        </div>
      </div>
      <Card className="rounded-2xl border shadow-sm overflow-hidden w-full max-w-9xl mt-0">
        {loading ? (
          <p className="p-4">Loading drafts...</p>
        ) : drafts.length === 0 ? (
          <p className="p-4">No drafts available.</p>
        ) : (
          <DraftsTable drafts={drafts} onDelete={fetchDrafts} />
        )}
      </Card>
    </div>
  )
};

export default Dashboard;
