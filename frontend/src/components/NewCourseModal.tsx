import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import useSocket from "@/hooks/useSocket";

type FormData = {
  [key: string]: string;
  courseCode: string;
  courseTitle: string;
  sNo: string;
  year: string;
  stream: string;
  L: string;
  T: string;
  P: string;
  C: string;
  courseHandlingSchool: string;
  numOfAfternoonSlots: string;
  numOfForenoonSlots: string;
};

export function NewCourseModal({ draftId }: { draftId: string }) {
  const socket = useSocket();

  const [formData, setFormData] = useState<FormData>({
    courseCode: "",
    courseTitle: "",
    sNo: "",
    year: "",
    stream: "",
    L: "",
    T: "",
    P: "",
    C: "",
    courseHandlingSchool: "",
    numOfAfternoonSlots: "",
    numOfForenoonSlots: "",
  });

  const handleChange = (
    eOrValue: React.ChangeEvent<HTMLInputElement> | { id: string; value: string }
  ) => {
    if ("target" in eOrValue) {
      const { id, value } = eOrValue.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    } else {
      const { id, value } = eOrValue;
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("createCourse", {
      senderSocketId: socket.id,
      senderDraftId: draftId,
      newCourseData: formData,
    });

    console.log("Sent course creation request:", formData);

    // optionally reset form or close modal
    setFormData({
      courseCode: "",
      courseTitle: "",
      sNo: "",
      year: "",
      stream: "",
      L: "",
      T: "",
      P: "",
      C: "",
      courseHandlingSchool: "",
      numOfAfternoonSlots: "",
      numOfForenoonSlots: "",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create new Course</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>
            Create a new course by filling out the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Course Information</FieldLegend>
              <div className="col-span-7 grid grid-cols-3 gap-4">
                <Field className="col-span-1">
                  <FieldLabel htmlFor="courseCode">Course Code</FieldLabel>
                  <Input
                    id="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    type="text"
                    placeholder="Code"
                    className="w-full"
                  />
                </Field>

                <Field className="col-span-2">
                  <FieldLabel htmlFor="courseTitle">Course Title</FieldLabel>
                  <Input
                    id="courseTitle"
                    value={formData.courseTitle}
                    onChange={handleChange}
                    type="text"
                    placeholder="Title"
                    className="w-full"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="sNo">S.No</FieldLabel>
                  <Input
                    id="sNo"
                    value={formData.sNo}
                    type="number"
                    onChange={handleChange}
                    placeholder="Serial Number"
                    className="input input-bordered w-full"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="year">Year</FieldLabel>
                  <Select
                    defaultValue=""
                    value={formData.year}
                    onValueChange={(value) => handleChange({id: "year", value})}
                  >
                    <SelectTrigger id="year">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                      <SelectItem value="2030">2030</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="stream">Course Stream</FieldLabel>
                  <Input
                    id="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    type="text"
                    placeholder="(e.g. BTECH BCE)"
                    className="input input-bordered w-full"
                  />
                </Field>
              </div>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Credits &amp; Slot Data</FieldLegend>
              <FieldDescription>Enter the credits and slot data for the course.</FieldDescription>
              <FieldGroup>
                <div className="grid grid-cols-[50px_50px_50px_52px_280px] gap-6 items-center">
                  {["L", "T", "P", "C"].map((key) => (
                    <Field key={key}>
                      <FieldLabel htmlFor={key} className="justify-center text-xs">
                        {key}
                      </FieldLabel>
                      <Input
                        id={key}
                        type="number"
                        className="w-[40px] text-center no-spinner"
                        value={formData[key]}
                        onChange={handleChange}
                      />
                    </Field>
                  ))}

                  <Field>
                    <FieldLabel htmlFor="courseHandlingSchool" className="justify-center text-xs">
                      Course Handling School
                    </FieldLabel>
                    <Input
                      id="courseHandlingSchool"
                      value={formData.courseHandlingSchool}
                      onChange={handleChange}
                      className="w-[200px]"
                    />
                  </Field>
                </div>
              </FieldGroup>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel htmlFor="numOfForenoonSlots" className="justify-center text-xs">
                      No. of Forenoon Slots
                    </FieldLabel>
                    <Input
                      id="numOfForenoonSlots"
                      value={formData.numOfForenoonSlots}
                      onChange={handleChange}
                      type="text"
                      placeholder="Forenoon Slots"
                      className="w-[200px]"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="numOfAfternoonSlots" className="justify-center text-xs">
                      No. of Afternoon Slots
                    </FieldLabel>
                    <Input
                      id="numOfAfternoonSlots"
                      value={formData.numOfAfternoonSlots}
                      onChange={handleChange}
                      type="text"
                      placeholder="Afternoon Slots"
                      className="w-[200px]"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <Field orientation="horizontal">
              <Button type="submit">Submit</Button>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
