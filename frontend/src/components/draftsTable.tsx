"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Draft } from "@/types/draft";
import axios, { AxiosResponse } from "axios";
import { toast } from "sonner";
import { Button } from "./ui";
import { DeleteDraftResponse } from "@/types/response";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash } from "lucide-react";

type DraftTableProps = {
  drafts: Draft[];
  onDelete: () => void;
}

export default function DraftsTable({ drafts, onDelete }: DraftTableProps) {
  const router = useRouter();

  const handleDelete = async (draftId: string) => {
    try {
      alert('Do you want to delete this draft ?');
      const res: AxiosResponse<DeleteDraftResponse> = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message);
        onDelete();
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      console.log('Error while deleting draft: ', error);
      toast.error('Failed to delete draft.');
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Date Created</TableHead>
          <TableHead># Courses</TableHead>
          <TableHead># Faculty</TableHead>
          <TableHead>Consolidated Filename</TableHead>
          <TableHead>Faculty Filename</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft, index) => (
          <TableRow key={draft._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{draft.name}</TableCell>
            <TableCell>{new Date(draft.creationDate).toLocaleDateString()}</TableCell>
            <TableCell>{draft.recordCount}</TableCell>
            <TableCell>{draft.facultyCount}</TableCell>
            <TableCell>{draft.consolidatedFileName}</TableCell>
            <TableCell>{draft.loadFileName}</TableCell>
            <TableCell>
              <div className="flex flex-row ">
                <Button
                  variant="link"
                  size="sm"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  onClick={() => router.push(`/draft/${draft._id}`)}
                  size="sm"
                  variant="link"
                >
                  <Pencil size={16} className="hover:scale-110 transition-transform cursor-pointer" />
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleDelete(draft._id)}
                >
                  <Trash size={16} className="hover:scale-110 transition-transform cursor-pointer" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
