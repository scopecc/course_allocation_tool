import React from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { XCircleIcon } from "lucide-react";

interface DeleteSlotButtonProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  className?: string;
}

const DeleteSlotButton = ({
  onConfirm,
  title = "Remove this slot?",
  description = "This will permanently remove the selected teacher and slot assignment.",
  className = "",
}: DeleteSlotButtonProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          title="Remove Teacher"
          variant="link"
          className={`absolute -right-4 -top-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform hover:scale-115 text-red-500 z-10 ${className}`}
        >
          <XCircleIcon size={14} />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSlotButton;
