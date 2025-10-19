import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVault, faCashRegister, faCreditCard, faCoins, faMoneyBill1Wave } from "@fortawesome/free-solid-svg-icons";

interface RecapTableEntry {
  date: string;
  cashToSafe: number | null;
  cashToKeep: number | null;
  extraFlow: number | null;
  tpeDiscrepancy: number | null;
  cashDiscrepancy: number | null;
}

type CompactedEntry = RecapTableEntry | { type: 'gap'; startDate: string; endDate: string };

interface RecapTableProps {
  paginatedData: CompactedEntry[];
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

const RecapTable: React.FC<RecapTableProps> = ({ paginatedData, closures, users, page, pageCount, setPage }) => {
  // Les données sont déjà compactées dans RecapSection
  return (
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
          {paginatedData.map((item, index) => {
            // Vérifier si c'est une ligne "gap" (période sans données)
            if ('type' in item && item.type === 'gap') {
              return (
                <TableRow key={`gap-${item.startDate}-${item.endDate}`} className="text-muted-foreground italic bg-background/20">
                  <TableCell colSpan={7} className="text-center py-4">
                    Du {item.startDate} au {item.endDate} - Aucune donnée
                  </TableCell>
                </TableRow>
              );
            }

            // C'est une entrée normale
            const entry = item as RecapTableEntry;
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
                {/* Mobile: Bouton pour ouvrir le drawer */}
                <TableCell className="md:hidden">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button>Détails</Button>
                    </DrawerTrigger>
                    <DrawerContent className="sticky p-4">
                      <DrawerHeader>
                        <DrawerTitle>Détails pour le {entry.date}</DrawerTitle>
                        <DrawerDescription>
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
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="space-y-2 mb-12">
                        <ul className="divide-y divide-muted/40">
                          <li className="flex items-center gap-3 py-2">
                            <span className="w-7 flex justify-center text-primary">
                              <FontAwesomeIcon icon={faVault} />
                            </span>
                            <span className="flex-1">Coffre</span>
                            <span className="font-semibold text-right">
                              {entry.cashToSafe !== null ? `${entry.cashToSafe} €` : "N/A"}
                            </span>
                          </li>
                          <li className="flex items-center gap-3 py-2">
                            <span className="w-7 flex justify-center">
                              <FontAwesomeIcon icon={faCashRegister} />
                            </span>
                            <span className="flex-1">Caisse</span>
                            <span className="font-semibold text-right">
                              {entry.cashToKeep !== null ? `${entry.cashToKeep} €` : "N/A"}
                            </span>
                          </li>
                          <li className="flex items-center gap-3 py-2">
                            <span className="w-7 flex justify-center">
                              <FontAwesomeIcon icon={faMoneyBill1Wave} />
                            </span>
                            <span className="flex-1">ExtraFlow</span>
                            <span className="font-semibold text-right">
                              {entry.extraFlow !== null ? `${entry.extraFlow} €` : "N/A"}
                            </span>
                          </li>
                          <li className="flex items-center gap-3 py-2">
                            <span className="w-7 flex justify-center">
                              <FontAwesomeIcon icon={faCreditCard} />
                            </span>
                            <span className="flex-1">Écart CB</span>
                            <span
                              className={`font-semibold text-right ${
                                entry.tpeDiscrepancy !== null && entry.tpeDiscrepancy >= 5 ? "text-destructive" : ""
                              }`}
                            >
                              {entry.tpeDiscrepancy !== null ? `${entry.tpeDiscrepancy} €` : "N/A"}
                            </span>
                          </li>
                          <li className="flex items-center gap-3 py-2">
                            <span className="w-7 flex justify-center">
                              <FontAwesomeIcon icon={faCoins} />
                            </span>
                            <span className="flex-1">Écart Cash</span>
                            <span
                              className={`font-semibold text-right ${
                                entry.cashDiscrepancy !== null && entry.cashDiscrepancy >= 5 ? "text-destructive" : ""
                              }`}
                            >
                              {entry.cashDiscrepancy !== null ? `${entry.cashDiscrepancy} €` : "N/A"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </DrawerContent>
                  </Drawer>
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
};

export default RecapTable;
