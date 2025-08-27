import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { MultiSelect } from "./multi-select";
import { TheorySlotOptions, LabSlotOptions } from "@/types/SlotOptions";


interface SlotInputProps {
  value: string[];
  placeholder: string;
  className?: string;
  type: "theory" | "lab";
  autoSize?: boolean | undefined;
  onCommit: (value: string[]) => void;
};

export const SlotInput = ({ value, placeholder, className, type, autoSize, onCommit }: SlotInputProps) => {
  const initValue = value.length === 1 && value[0] === "" ? undefined : value;
  const [localVal, setLocalVal] = useState<string[] | undefined>(initValue);

  useEffect(() => {
    setLocalVal(initValue)
  }, [initValue]);

  return (
    <div
      className={className || "max-w-48"}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          if (localVal !== undefined && localVal !== initValue) {
            onCommit(localVal);
          }
        }
      }}
    >
      <MultiSelect
        options={type === "theory" ? TheorySlotOptions : LabSlotOptions}
        defaultValue={localVal}
        onValueChange={(value) => setLocalVal(value)}
        placeholder={placeholder}
        variant="secondary"
        maxCount={4}
        hideSelectAll={true}
        maxWidth="90%"
        minWidth="20%"
        autoSize={autoSize}
        onClearOptions={() => onCommit([])}
      />
    </div>
  );
}

