"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Field } from "@/types/Field"; // Adjust path if needed
import { FieldKey } from "@/types/recordFieldKey"; // Assuming FieldKey is your type for field keys

interface ColumnSelectorProps {
  allFields: Field[];
  visibleFields: FieldKey[];
  toggleField: (key: FieldKey) => void;
};

export default function ColumnSelector({
  allFields,
  visibleFields,
  toggleField,
}: ColumnSelectorProps) {
  return (
    <div className="flex justify-end gap-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Select Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-80 overflow-auto">
          {allFields.map((field) => (
            <DropdownMenuCheckboxItem
              key={field.key}
              checked={visibleFields.includes(field.key)}
              onCheckedChange={() => toggleField(field.key)}
              onSelect={(e) => e.preventDefault()}
            >
              {field.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
