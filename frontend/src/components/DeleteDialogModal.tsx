import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface DeleteDialogModalProps {
  onDelete: () => void | Promise<void>;
}

export function DeleteDialogModal({ onDelete }: DeleteDialogModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="ghost" size="sm">
          <Trash size={16} className="hover:scale-110 text-red-600 transition-transform" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this draft?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the draft.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-red hover:bg-red-100">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Yes, Delete it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
