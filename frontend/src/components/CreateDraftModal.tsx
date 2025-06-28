"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateDraftModalProps = {
  onSubmit: (formData: FormData) => void;
}

export default function CreateDraftModal({ onSubmit }: CreateDraftModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [consolidatedFile, setConsolidatedFile] = useState<File | null>(null);
  const [loadFile, setLoadFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!consolidatedFile || !loadFile || !name) {
      alert("Please fill in all the fields.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("consolidatedFile", consolidatedFile);
    formData.append("loadFile", loadFile);
    setOpen(false);
    onSubmit(formData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Draft</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Draft</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div>
            <Label>Draft Name</Label>
            <Input
              type="text"
              value={name}
              className="mt-2"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter draft name"
            />
          </div>

          <div>
            <Label>Upload Consolidated File</Label>
            <Input type="file" className="mt-2" accept=".csv,.xlsx" onChange={(e) => setConsolidatedFile(e.target.files?.[0] || null)} />
          </div>

          <div>
            <Label>Upload Load File</Label>
            <Input type="file" className="mt-2" accept=".csv,.xlsx" onChange={(e) => setLoadFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

