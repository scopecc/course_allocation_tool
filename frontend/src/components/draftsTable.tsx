"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Draft } from "@/types/draft";
import axios, { AxiosResponse } from "axios";
import { toast } from "sonner";
import { Button } from "./ui";
import { DeleteDraftResponse } from "@/types/response";
import { useRouter } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { DeleteDialogModal } from "./DeleteDialogModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DraftsTableProps {
  drafts: Draft[];
  onDelete: () => void;
}

export default function DraftsTable({ drafts, onDelete }: DraftsTableProps) {
  const router = useRouter();

  const handleDelete = async (draftId: string) => {
    try {
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

  function handleExport(draftId: string): void {
    router.push(`/export/${draftId}`);
  }

  function handleEdit(draftId: string): void {
    router.push(`/draft/${draftId}`)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Date Created</TableHead>
          <TableHead>Courses</TableHead>
          <TableHead>Faculty</TableHead>
          <TableHead>Consolidated Filename</TableHead>
          <TableHead>Faculty Filename</TableHead>
          <TableHead className="pl-5">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft, index) => (
          <TableRow key={draft._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{draft.name}</TableCell>
            <TableCell>
              <Tooltip>
                <TooltipTrigger>
                  {new Date(draft.creationDate).toLocaleDateString()}
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(draft.creationDate).toLocaleTimeString()}
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>{draft.recordCount}</TableCell>
            <TableCell>{draft.facultyCount}</TableCell>
            <TableCell>{draft.consolidatedFileName}</TableCell>
            <TableCell>{draft.loadFileName}</TableCell>
            <TableCell>
              <div className="flex flex-row gap-x-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      onClick={() => handleEdit(draft._id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Pencil size={16} className="hover:scale-110 transition-transform cursor-pointer" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent> Edit </TooltipContent>
                </Tooltip>


                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExport(draft._id)}
                    >
                      <Download />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent> Export </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <DeleteDialogModal onDelete={() => handleDelete(draft._id)} />
                  </TooltipTrigger>
                  <TooltipContent> Delete </TooltipContent>
                </Tooltip>


              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
