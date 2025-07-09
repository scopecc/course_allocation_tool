import { useState } from "react";
import { RowsPerPageDropdown } from "./RowsPerPageDropdown";
import { Button } from "@/components/ui/button"; // assuming shadcn/ui
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "./ui/input";

export function PaginationBar({
  currentPage,
  setCurrentPage,
  totalPages,
  rowsPerPage,
  setRowsPerPage,
  totalRecords,
}: {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  totalRecords: number;
}) {
  const [gotoPage, setGotoPage] = useState("");

  const handleGotoPage = () => {
    const page = Number(gotoPage)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6 items-center my-2">

      {/* Go to page input */}
      <div className="flex items-center gap-2 mr-4">
        <span className="text-sm">Go to page:</span>
        <Input
          type="number"
          className="w-16 h-8 text-sm"
          value={gotoPage}
          onChange={(e) => setGotoPage(e.target.value)}
        />
        / {totalPages}
        <Button size="sm" onClick={handleGotoPage}>
          Go
        </Button>
      </div>

      {/* First Page */}
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentPage(1);
          setGotoPage("1");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={currentPage === 1}
      >
        <ChevronsLeft />
      </Button>

      {/* Previous Page */}
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentPage((prev) => Math.max(prev - 1, 1));
          setGotoPage(String(currentPage));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={currentPage === 1}
      >
        <ChevronLeft />
      </Button>

      <div className="text-sm text-muted-foreground pr-4">
        Page {currentPage} &nbsp; | &nbsp;
        {(currentPage - 1) * rowsPerPage + 1} -{" "}
        {Math.min(currentPage * rowsPerPage, totalRecords)} of {totalRecords}
      </div>


      {/* Next Page */}
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
          setGotoPage(String(currentPage));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={currentPage === totalPages}
      >
        <ChevronRight />
      </Button>

      {/* Last Page */}
      <Button
        variant="secondary"
        onClick={() => {
          setCurrentPage(totalPages);
          setGotoPage(String(totalPages));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight />
      </Button>

      <div className="pl-4 text-sm gap-x-4 flex items-center text-muted-foreground">
        Rows Per Page:
        <RowsPerPageDropdown onChange={(rows) => setRowsPerPage(rows)} />
      </div>
    </div>
  );
}

