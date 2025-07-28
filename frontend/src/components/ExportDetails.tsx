"use client";

import { Draft } from "@/types/draft";
import { Card } from "@/components/ui/card";
import { SelectComponent } from "./SelectComponent";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { toast } from "sonner";

interface ExportDetailsProps {
  draft: Draft | null;
}

type FormValues = {
  selectedDept: string;
  mainFilename: string;
  allocationFilename: string;
};

export default function ExportDetails({ draft }: ExportDetailsProps) {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/draft/export/${draft?._id}`,
        {
          selectedDept: data.selectedDept,
          mainFilename: data.mainFilename,
          allocationFilename: data.allocationFilename,
        },
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.mainFilename || "export"}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed, ", error);
      toast.error("Failed to export file");
    }
  };

  const uniqueDepartments = Array.from(
    new Set(
      draft?.records
        .map((record) => record.stream.trim())
        .filter((v) => v.trim() !== "")
    )
  );

  useEffect(() => {
    register("selectedDept", { required: true });
  }, [register]);

  return (
    <Card className="max-w-6xl px-12">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col my-2 px-2 gap-y-2 items-center">
          <h1 className="font-bold text-2xl"> Export Details </h1>
          <Table>
            <TableRow>
              <TableHead>
                <Label> Select Department: </Label>
              </TableHead>

              <TableCell>
                <SelectComponent
                  placeHolder="Select School"
                  values={uniqueDepartments}
                  onSelect={(value) => {
                    setValue("selectedDept", value, { shouldValidate: true });
                    trigger("selectedDept");
                  }}
                />
                {errors.selectedDept && (
                  <span className="text-red-500">This field is required</span>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableHead>
                <Label>Enter Main Sheet Filename:</Label>
              </TableHead>

              <TableCell>
                <Textarea
                  placeholder="e.g. BCE_WINTER 24-25"
                  {...register("mainFilename", { required: true })}
                />
                {errors.mainFilename && (
                  <span className="text-red-500">This field is required</span>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableHead className="break-words whitespace-normal">
                <Label>Enter Allocation Sheet (filled) Filename:</Label>
              </TableHead>

              <TableCell className="break-words whitespace-normal">
                <Textarea
                  placeholder={"e.g. " + draft?.loadFileName + "-filled"}
                  {...register("allocationFilename", { required: true })}
                />
                {errors.allocationFilename && (
                  <span className="text-red-500">This field is required</span>
                )}
              </TableCell>
            </TableRow>
          </Table>
          <Button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download Files
          </Button>
        </div>
      </form>
    </Card>
  );
}
