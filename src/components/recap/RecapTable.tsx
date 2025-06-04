import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecapTableEntry {
  date: string;
  cashToSafe: number | null;
  cashToKeep: number | null;
  extraFlow: number | null;
  tpeDiscrepancy: number | null;
  cashDiscrepancy: number | null;
}

interface RecapTableProps {
  paginatedData: RecapTableEntry[];
  closures: {
    date: { seconds: number };
    validatedBy: string;
    // Add other fields as needed
  }[];
  users: Record<string, { displayName: string; avatarUrl?: string }>;
  page: number;
  pageCount: number;
  setPage: (p: number) => void;
}

const RecapTable: React.FC<RecapTableProps> = ({ paginatedData, closures, users, page, pageCount, setPage }) => (
  <Card>
    <CardHeader>
      <CardTitle>Historique de cloture de caisse</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Coffre (€)</TableHead>
            <TableHead className="hidden md:table-cell">Caisse (€)</TableHead>
            <TableHead className="hidden md:table-cell">ExtraFlow (€)</TableHead>
            <TableHead className="hidden md:table-cell">Écart CB (€)</TableHead>
            <TableHead className="hidden md:table-cell">Écart Cash (€)</TableHead>
            <TableHead className="hidden md:table-cell">Validé par</TableHead>
            <TableHead className="md:hidden"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((entry) => {
            const isMissingData =
              entry.cashToSafe == null &&
              entry.cashToKeep == null &&
              entry.cashDiscrepancy == null &&
              entry.tpeDiscrepancy == null &&
              (entry.extraFlow == null || entry.extraFlow === 0);
            const closure = closures.find(
              (c) => new Date(c.date.seconds * 1000).toISOString().split("T")[0] === entry.date
            );
            const user = closure ? users[closure.validatedBy] : undefined;
            return (
              <TableRow
                key={entry.date}
                className={
                  isMissingData
                    ? "text-gray-500 bg-background/40"
                    : "bg-background hover:bg-accent hover:text-accent-foreground"
                }
              >
                <TableCell>{entry.date}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {entry.cashToSafe !== null ? `${entry.cashToSafe} €` : "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {entry.cashToKeep !== null ? `${entry.cashToKeep} €` : "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {entry.extraFlow !== null ? `${entry.extraFlow} €` : "N/A"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={
                      entry.tpeDiscrepancy === null
                        ? "default"
                        : entry.tpeDiscrepancy < 5
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {entry.tpeDiscrepancy !== null ? `${entry.tpeDiscrepancy} €` : "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={
                      entry.cashDiscrepancy === null
                        ? "default"
                        : entry.cashDiscrepancy < 5
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {entry.cashDiscrepancy !== null ? `${entry.cashDiscrepancy} €` : "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                        <AvatarFallback>
                          {user.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.displayName}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                {/* Mobile: Bouton pour ouvrir le dialogue */}
                <TableCell className="md:hidden">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Détails</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Détails pour {entry.date}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p><strong>Date :</strong> {entry.date}</p>
                        <p><strong>Coffre :</strong> {entry.cashToSafe !== null ? `${entry.cashToSafe} €` : "N/A"}</p>
                        <p><strong>Caisse :</strong> {entry.cashToKeep !== null ? `${entry.cashToKeep} €` : "N/A"}</p>
                        <p><strong>ExtraFlow :</strong> {entry.extraFlow !== null ? `${entry.extraFlow} €` : "N/A"}</p>
                        <p><strong>Écart CB :</strong> {entry.tpeDiscrepancy !== null ? `${entry.tpeDiscrepancy} €` : "N/A"}</p>
                        <p><strong>Écart Cash :</strong> {entry.cashDiscrepancy !== null ? `${entry.cashDiscrepancy} €` : "N/A"}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={`cursor-pointer${page === 1 ? " pointer-events-none opacity-50" : ""}`}
              onClick={() => {
                if (page > 1) setPage(Math.max(1, page - 1));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            {page} / {pageCount}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className={`cursor-pointer${page === pageCount ? " pointer-events-none opacity-50" : ""}`}
              onClick={() => {
                if (page < pageCount) setPage(Math.min(pageCount, page + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </CardContent>
    <CardFooter />
  </Card>
);

export default RecapTable;
