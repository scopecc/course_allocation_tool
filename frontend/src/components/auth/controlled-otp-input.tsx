import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui";
interface InputOTPControlledProps {
  otp: number;
  setOtp: (val: number) => void;
};
export function ControlledOTPInput({ otp, setOtp }: InputOTPControlledProps) {
  return (
    <div className="space-y-2">
      <InputOTP
        maxLength={6}
        value={otp ? otp.toString() : ""}
        onChange={(val) => setOtp(Number(val))}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSeparator />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSeparator />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
