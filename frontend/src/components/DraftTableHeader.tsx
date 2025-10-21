import { Field } from "@/types/Field";
import { Record } from "@/types/record";
import { FieldKey } from "@/types/recordFieldKey";
import { TableHead, TableRow } from "./ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";


interface DraftTableHeaderProps {
  allFields: Field[];
  visibleFields: FieldKey[];
  sortBy: keyof Record;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: keyof Record, order: 'asc' | 'desc') => void;
}

export function DraftTableHeader({ allFields, visibleFields, sortBy, sortDirection, onSortChange }: DraftTableHeaderProps) {
  function handleTableHeadClick(fieldKey: keyof Record): void {
    if (sortBy === fieldKey) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(fieldKey, newDirection);
    } else {
      onSortChange(fieldKey, 'asc');
    }

  }

  return (
    <TableRow>
      {allFields.map((field) => visibleFields.includes(field.key) ?
        (
          <TableHead
            key={field.key}
            onClick={() => handleTableHeadClick(field.key)}
            className="cursor-pointer"
          >
            <div className="flex flex-row gap-x-2 items-center" >
              {field.label}
              {sortBy === field.key ? (
                sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
              ) : null}
            </div>
          </TableHead>
        ) : null
      )}

      <TableHead>Slot</TableHead>
      <TableHead>Total Slots</TableHead>
      <TableHead>FN Teachers</TableHead>
      <TableHead>AN Teachers</TableHead>
    </TableRow>
  )
};
