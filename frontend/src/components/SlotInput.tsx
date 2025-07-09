import { useEffect, useState } from "react";
import { Input } from "./ui/input";


interface SlotInputProps {
  value: string;
  placeholder: string;
  className?: string;
  onCommit: (value: string) => void;
};

export const SlotInput = ({ value, placeholder, className, onCommit }: SlotInputProps) => {
  const [localVal, setLocalVal] = useState<string>(value);

  useEffect(() => {
    setLocalVal(value)
  }, [value]);

  return (
    <Input
      type="text"
      placeholder={placeholder}
      className={className || ""}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => onCommit(localVal)}
    />
  );
}
