import { DraftEdit } from "@/components";
import React from "react";

export default async function DraftPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  return <DraftEdit draftId={id} />;
}
