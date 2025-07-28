// import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RowsPerPageDropdown({
  onChange,
}: {
  onChange: (rows: number) => void;
}) {
  // const [value, setValue] = useState(15);
  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={(value) => onChange(Number(value))}>
        <SelectTrigger className="w-[100px] bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
          <SelectValue placeholder="Rows/Page" />
        </SelectTrigger>
        <SelectContent className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
          {[5, 10, 15, 20, 25].map((val) => (
            <SelectItem key={val} value={val.toString()}>
              {val}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
