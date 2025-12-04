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
              {options?.map((option) => {
                const isDisabled = !!option.disabled;
                const isSelected = value?.value === option.value;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    // guard selection so disabled items can't be chosen
                    onSelect={() => {
                      if (isDisabled) return;
                      onChange(option.value);
                      setOpen(false);
                    }}
                    // accessibility + keyboard
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    className={cn(
                      "flex items-center px-3 py-2",
                      isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                      "group" // keep a group for nested styles if needed
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className={cn(isDisabled ? "text-muted-foreground" : "")}>
                          {option.label}
                        </span>
                        {/* Optional: show teacher names in smaller text */}
                        {option.teachers && option.teachers.length > 0 && (
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {option.teachers.join(", ")}
                          </span>
                        )}
                      </div>

                      <div className="ml-3 flex items-center space-x-2">
                        {/* optionally show a small badge when disabled */}
                        {isDisabled && (
                          <span className="text-xs text-muted-foreground">taken</span>
                        )}

                        <Check
                          className={cn(
                            "ml-auto transition-opacity",
                            isSelected && !isDisabled ? "opacity-100" : (isSelected && isDisabled ? "opacity-60" : "opacity-0")
                          )}
                        />
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
