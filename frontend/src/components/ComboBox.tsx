import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CommandSeparator } from "cmdk";
import { Faculty } from "@/types/faculty";

interface ComboBoxProps {
  options: Faculty[] | undefined;
  value: Faculty | null;
  onChange: (value: string) => void;
  placeHolder: string;
}

export default function ComboBox({
  options,
  value,
  onChange,
  placeHolder,
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);

  const displayName =
    value === null ? placeHolder : `${value.prefix} ${value.name}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="max-w-[200px] justify-between"
        >
          {displayName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder="Search Faculty..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Teachers Left.</CommandEmpty>
            <CommandGroup className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b">
              <div className="flex justify-between w-full">
                <span className="w-12 ml-3 truncate">&nbsp;ID</span>

                <span className="ml-4">Name</span>
                <div className="flex gap-4 min-w-[100px] justify-end text-right">
                  <span className="ml-2">Free T</span>
                  <span className="w-12 mr-1 ">Free L</span>
                </div>
              </div>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option._id}
                  value={option.name}
                  onSelect={() => {
                    onChange(option._id);
                    setOpen(false);
                  }}
                  className="flex items-center"
                >
                  <div className="flex justify-between w-full">
                    <span className="w-12 truncate">{option.employeeId}</span>

                    <span className="ml-4">
                      {option.prefix} {option.name}
                    </span>
                    <div className="flex gap-4 min-w-[100px] justify-end text-right">
                      <span className="ml-2">
                        {option.loadT - option.loadedT}
                      </span>
                      <span className="w-12 truncate">
                        {option.loadL - option.loadedL}
                      </span>
                    </div>
                  </div>

                  <Check
                    className={cn(
                      "ml-auto",
                      value?._id === option._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
