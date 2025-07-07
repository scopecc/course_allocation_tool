"use client";

import { GetDraftResponse } from "@/types/response";
import axios, { AxiosResponse } from "axios";
import { Draft } from "@/types/draft";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import DraftDetails from "./DraftDetails";
import ExportDetails from "./ExportDetails";
import { Separator } from "@/components/ui/separator";

type ExportViewProps = {
  draftId: string;
}

export default function ExportView({ draftId }: ExportViewProps) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const fetchDraft = async () => {
    try {
      console.log("draftId is: ", draftId);
      const res: AxiosResponse<GetDraftResponse> = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`, { withCredentials: true });
      if (res.status === 200) {
        setDraft(res.data.draft);
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      toast.error('Error while fetching draft to export.');
      console.log('Error while fetching draft to export: ', error);
    }
  }
  useEffect(() => {
    fetchDraft();
  }, [draftId]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-x-4 my-2">
        <h1 className="text-3xl font-bold mb-3">Export: </h1> <h1 className="text-4xl font-bold mb-3"> {draft?.name}</h1>
      </div>
      <div className="flex flex-row gap-x-4 items-stretch h-150">
        <div className="flex flex-col items-center justify-center h-full">
          <DraftDetails draft={draft} />
        </div>
        <Separator orientation="vertical" className="w-px bg-gray-600 y-3" />
        <div className="flex flex-col items-center justify-center h-full">
          <ExportDetails draft={draft} />
        </div>
      </div>
    </div>
  );
};
