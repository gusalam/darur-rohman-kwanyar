import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/StatCard";
import { useUnit } from "@/context/UnitContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { Eye } from "lucide-react";
import { NilaiDetailDialog } from "@/components/shared/NilaiDetailDialog";

const predikat = (n: number) => n >= 90 ? "A" : n >= 80 ? "B" : n >= 70 ? "C" : "D";

export default function Raport() {
  const { unit, info } = useUnit();
  const { data: students } = useSupabaseTable<any>("students", { unit });
  const { data: grades } = useSupabaseTable<any>("grades", { unit });
  const { data: subjects } = useSupabaseTable<any>("subjects", { unit });

  const [studentId, setStudentId] = useState<string>("");
  const selected = students.find(s => s.id === studentId) ?? students[0];
  const sid = selected?.id;

  const rows = useMemo(() => {
    if (!sid) return [];
    return subjects.map((s) => {
      const list = grades.filter((g) => g.student_id === sid && g.subject_id === s.id);
      const avg = list.length ? Math.round(list.reduce((a, b) => a + Number(b.nilai), 0) / list.length) : 0;
      return { subject: s.nama, count: list.length, avg };
    }).filter(r => r.count > 0);
  }, [sid, subjects, grades]);

  const overall = rows.length ? Math.round(rows.reduce((a, b) => a + b.avg, 0) / rows.length) : 0;
  const [open, setOpen] = useState(false);
  const studentGrades = grades.filter(g => g.student_id === sid);

  return (
    <div className="space-y-6">
      <PageHeader title="Raport Akademik" subtitle={`Unit ${info.short}`} />

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold">Pilih Siswa:</span>
          <Select value={sid ?? ""} onValueChange={setStudentId}>
            <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
            <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
          </Select>
          {selected && <Button variant="outline" onClick={() => setOpen(true)}><Eye className="mr-2 h-4 w-4" /> Detail Nilai</Button>}
        </CardContent>
      </Card>

      {selected && (
        <>
          <Card className="rounded-2xl border-0 shadow-soft">
            <CardHeader><CardTitle className="font-display">Identitas Siswa</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Nama" value={selected.nama} />
              <Info label="NIS" value={selected.nis ?? "-"} />
              <Info label="Unit" value={`${info.short} — ${info.name}`} />
              <Info label="Status" value={selected.status} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display">Nilai per Mapel</CardTitle>
              <p className="text-sm text-muted-foreground">Rata-rata keseluruhan: <span className="font-bold text-primary">{overall}</span> ({predikat(overall)})</p>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead className="text-center">Jumlah Nilai</TableHead><TableHead className="text-center">Rata-rata</TableHead><TableHead className="text-center">Predikat</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.subject}>
                      <TableCell className="font-medium">{r.subject}</TableCell>
                      <TableCell className="text-center">{r.count}</TableCell>
                      <TableCell className="text-center font-bold text-primary">{r.avg}</TableCell>
                      <TableCell className="text-center"><Badge>{predikat(r.avg)}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Belum ada nilai</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <NilaiDetailDialog open={open} onOpenChange={setOpen} siswa={selected.nama} grades={studentGrades} />
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
