"use client";

import { Draft } from "@/types/draft";
import { Button, Card } from "./ui";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

type DraftDetailsProps = {
  draft: Draft | null;
}

export default function DraftDetails({ draft }: DraftDetailsProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-y-4">
      <Card className="w-100 px-6 items-center">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-2">Draft Details</h1>
          <Table>
            <TableRow>
              <TableHead> Name: </TableHead>
              <TableCell> {draft?.name} </TableCell>
            </TableRow>
            <TableRow>
              <TableHead> Date Created: </TableHead>
              <TableCell> {new Date(draft?.creationDate || "").toLocaleString()} </TableCell>
            </TableRow>
            <TableRow>
              <TableHead> Consolidated File: </TableHead>
              <TableCell className="break-words whitespace-normal"> {draft?.consolidatedFileName} </TableCell>
            </TableRow>

            <TableRow>
              <TableHead> Faculty Load File: </TableHead>
              <TableCell className="break-words whitespace-normal"> {draft?.loadFileName} </TableCell>
            </TableRow>

            <TableRow>
              <TableHead> Number of Courses: </TableHead>
              <TableCell> {draft?.recordCount} </TableCell>
            </TableRow>

            <TableRow>
              <TableHead> Number of Faculty: </TableHead>
              <TableCell> {draft?.facultyCount} </TableCell>
            </TableRow>
          </Table>
        </div>
        <Button
          variant="outline"
          className="max-w-3xs"
          onClick={() => router.push(`/draft/${draft?._id}`)}
        >
          Edit Draft
        </Button>
      </Card>
    </div>
  );
};
