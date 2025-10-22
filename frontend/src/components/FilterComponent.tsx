import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/types/Field";
import { FieldKey } from "@/types/recordFieldKey";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui";

interface FilterComponentProps {
  columns: Field[];
  onFilterSubmit: (selectedColumn: FieldKey | null, selectedValue: string) => void;
}

export function FilterComponent({ columns, onFilterSubmit }: FilterComponentProps) {
  const [selectedColumn, setSelectedColumn] = useState<FieldKey | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("");

  return (
    <div className="flex flex-row items-center gap-x-2">
      Filter on:
      <Select onValueChange={(column: FieldKey) => setSelectedColumn(column)}>
        <SelectTrigger>
          <SelectValue placeholder="Column Name" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column.key} value={column.key}>
              {column.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ArrowRight size={18} />

      <Input
        type="text"
        className="w-42"
        onChange={(e) => setSelectedValue(e.target.value.toString())}
      />

      <Button onClick={() => onFilterSubmit(selectedColumn, selectedValue)}>Filter</Button>

    </div>
  )
}
