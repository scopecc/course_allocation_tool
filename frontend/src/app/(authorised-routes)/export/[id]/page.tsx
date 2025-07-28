import ExportView from "@/components/ExportView";
import React from "react";

interface ExportProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExportPage({ params }: ExportProps) {
  const { id } = await params;
  return <ExportView draftId={id} />;
}
