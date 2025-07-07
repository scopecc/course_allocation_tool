import { DraftEdit } from "@/components";
import React from "react";

interface DraftPageProps {
  params: {
    id: string;
  }
}

export default async function DraftPage({ params }: DraftPageProps) {
  const { id } = await params;
  return <DraftEdit draftId={id} />
};
