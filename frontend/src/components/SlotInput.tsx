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


interface SlotInputProps {
  value: { value: string, label: string } | null;
  placeHolder: string;
  options: { value: string, label: string, disabled: boolean, teachers?: string[] }[] | undefined;
  onChange: (value: string) => void;
};

export const SlotInput = ({ value, placeHolder, options, onChange }: SlotInputProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-[150px] justify-center ${value === null ? "text-gray-500" : "text-foreground"}`}
        >
          {value ? value.label : placeHolder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0">
        <Command>
          <CommandInput placeholder={placeHolder} className="h-9" />
          <CommandList>
            <CommandEmpty>No Teachers Left.</CommandEmpty>
            <CommandSeparator />
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex items-center"
                >
                  <div className="flex justify-between w-full">
                    {option.label}
                  </div>

                  <Check
                    className={cn(
                      "ml-auto",
                      value?.value === option.value ? "opacity-100" : "opacity-0"
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
