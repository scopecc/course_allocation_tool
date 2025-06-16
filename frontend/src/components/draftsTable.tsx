import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Draft } from "@/types/draft";

type DraftTableProps = {
  drafts: Draft[];
}

export default function DraftsTable({ drafts }: DraftTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Date Created</TableHead>
          <TableHead># Courses</TableHead>
          <TableHead># Faculty</TableHead>
          <TableHead>Consolidated Filename</TableHead>
          <TableHead>Faculty Filename</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drafts.map((draft, index) => (
          <TableRow key={draft._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{draft.name}</TableCell>
            <TableCell>{new Date(draft.creationDate).toLocaleDateString()}</TableCell>
            <TableCell>{draft.recordCount}</TableCell>
            <TableCell>{draft.facultyCount}</TableCell>
            <TableCell>{draft.consolidatedFileName}</TableCell>
            <TableCell>{draft.loadFileName}</TableCell>
            <TableCell>
              <a
                href={`/drafts/${draft._id}`}
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
