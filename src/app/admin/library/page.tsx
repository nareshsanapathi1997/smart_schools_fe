"use client";

import { useEffect, useState } from "react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { StudentSelect } from "@/components/admin/StudentSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

const emptyBookForm = { title: "", author: "", isbn: "", category: "", copies_total: "1", shelf_location: "" };

export default function AdminLibraryPage() {
  const [tab, setTab] = useState<"books" | "issues">("books");
  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [issues, setIssues] = useState<Record<string, unknown>[]>([]);
  const [open, setOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBookForm);
  const [issueForm, setIssueForm] = useState({ book_id: "", student_id: "", due_date: "" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.get("/erp/library/books").then((r) => setBooks(r.data.data || []));
    if (tab === "issues") api.get("/erp/library/issues").then((r) => setIssues(r.data.data || []));
  }, [tab, reload]);

  const openCreate = () => { setEditingId(null); setForm(emptyBookForm); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setForm({
      title: String(row.title || ""),
      author: String(row.author || ""),
      isbn: String(row.isbn || ""),
      category: String(row.category || ""),
      copies_total: String(row.copies_total ?? "1"),
      shelf_location: String(row.shelf_location || ""),
    });
    setOpen(true);
  };

  const saveBook = async () => {
    try {
      if (editingId) await api.put(`/erp/library/books/${editingId}`, form);
      else await api.post("/erp/library/books", form);
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button variant={tab === "books" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("books")}>Books</Button>
        <Button variant={tab === "issues" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("issues")}>Issues</Button>
        {tab === "issues" && <Button variant="outline" className="rounded-xl" onClick={() => setIssueOpen(true)}>Issue Book</Button>}
      </div>
      {tab === "books" ? (
        <ErpAdminShell key={reload} title="Library" subtitle="Book catalog and availability" endpoint="/erp/library/books"
          actions={<ErpAddButton onClick={openCreate} label="Add Book" />}
          columns={[
            { key: "title", label: "Title" },
            { key: "author", label: "Author" },
            { key: "copies_available", label: "Available" },
            { key: "category", label: "Category" },
          ]}
          rowActions={(row) => (
            <ErpRowActions
              onEdit={() => openEdit(row)}
              onDelete={async () => { await api.delete(`/erp/library/books/${row.id}`); setReload((n) => n + 1); }}
              deleteLabel={`Remove book "${row.title}"?`}
            />
          )}
        />
      ) : (
        <div className="space-y-2">
          {issues.map((i) => (
            <GlowCard key={String(i.id)} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-medium">{String(i.book_title)}</p><p className="text-sm text-muted-foreground">{String(i.student_name)} • Due {i.due_date ? new Date(String(i.due_date)).toLocaleDateString() : "—"}</p></div>
              {i.status === "issued" && (
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={async () => {
                    const fineInput = prompt("Fine amount (₹) on return — leave blank or 0 if none:", "0");
                    if (fineInput === null) return;
                    const fine_amount = Number(fineInput) || 0;
                    try {
                      await api.patch(`/erp/library/issues/${i.id}/return`, { fine_amount });
                      setReload((n) => n + 1);
                    } catch (err) {
                      alert(getApiErrorMessage(err, "Return failed"));
                    }
                  }}
                >
                  Return
                </Button>
              )}
            </GlowCard>
          ))}
        </div>
      )}
      <ErpModal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Book" : "Add Book"}>
        <div className="space-y-3">
          <Input className="rounded-xl" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input className="rounded-xl" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <Input className="rounded-xl" placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <Input className="rounded-xl" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input className="rounded-xl" type="number" placeholder="Copies" value={form.copies_total} onChange={(e) => setForm({ ...form, copies_total: e.target.value })} />
          <Input className="rounded-xl" placeholder="Shelf Location" value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={saveBook}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </ErpModal>
      <ErpModal open={issueOpen} onClose={() => setIssueOpen(false)} title="Issue Book">
        <div className="space-y-3">
          <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={issueForm.book_id} onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })}>
            <option value="">Select Book</option>
            {books.filter((b) => Number(b.copies_available) > 0).map((b) => (
              <option key={String(b.id)} value={String(b.id)}>{String(b.title)} ({String(b.copies_available)} available)</option>
            ))}
          </select>
          <StudentSelect value={issueForm.student_id} onChange={(student_id) => setIssueForm({ ...issueForm, student_id })} required placeholder="Select Student *" />
          <Input className="rounded-xl" type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} />
          <Button className="w-full rounded-xl" onClick={async () => {
            try {
              await api.post("/erp/library/issues", issueForm);
              setIssueOpen(false);
              setReload((n) => n + 1);
            } catch (err) {
              alert(getApiErrorMessage(err, "Issue failed"));
            }
          }}>Issue</Button>
        </div>
      </ErpModal>
    </>
  );
}
