"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  KeyRound,
  Loader2,
  RefreshCw,
  Ban,
  CheckCircle,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { ErpModal } from "@/components/admin/ErpAdminShell";
import { StudentSelect } from "@/components/admin/StudentSelect";
import { FacultySelect } from "@/components/admin/FacultySelect";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

type Tab = "portal" | "teacher";

interface PortalAccount {
  id: string;
  username: string;
  account_type: string;
  is_active: boolean;
  student_name: string;
  admission_no: string;
  class_level?: string;
  last_login?: string;
}

interface TeacherAccount {
  id: string;
  username: string;
  is_active: boolean;
  faculty_name?: string;
  department?: string;
  faculty_email?: string;
  last_login?: string;
}

export default function AdminPortalsPage() {
  const [tab, setTab] = useState<Tab>("portal");
  const [accounts, setAccounts] = useState<PortalAccount[]>([]);
  const [teacherAccounts, setTeacherAccounts] = useState<TeacherAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [provisioning, setProvisioning] = useState(false);

  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ type: "portal" | "teacher"; id: string; username: string } | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  const limit = 25;

  const loadPortal = useCallback(() => {
    setLoading(true);
    api.get("/erp/portal/accounts", { params: { page, limit, search: search.trim() || undefined } })
      .then((res) => {
        setAccounts(res.data.data || []);
        const p = res.data.pagination;
        if (p) { setTotal(p.total); setTotalPages(p.totalPages); }
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  const loadTeachers = useCallback(() => {
    setLoading(true);
    api.get("/erp/teacher/accounts", { params: { page, limit, search: search.trim() || undefined } })
      .then((res) => {
        setTeacherAccounts(res.data.data || []);
        const p = res.data.pagination;
        if (p) { setTotal(p.total); setTotalPages(p.totalPages); }
      })
      .catch(() => setTeacherAccounts([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (tab === "portal") loadPortal();
    else loadTeachers();
  }, [tab, loadPortal, loadTeachers]);

  const provisionPortals = async () => {
    setProvisioning(true);
    try {
      const res = await api.post("/erp/portal/provision");
      alert(res.data.message || "Done");
      loadPortal();
    } catch (err) {
      alert(getApiErrorMessage(err, "Provision failed"));
    } finally {
      setProvisioning(false);
    }
  };

  const provisionTeachers = async () => {
    setProvisioning(true);
    try {
      const res = await api.post("/erp/teacher/provision");
      alert(res.data.message || "Done");
      loadTeachers();
    } catch (err) {
      alert(getApiErrorMessage(err, "Provision failed"));
    } finally {
      setProvisioning(false);
    }
  };

  const createStudentPortal = async () => {
    if (!selectedStudentId) return alert("Select a student");
    try {
      const res = await api.post(`/erp/portal/provision/student/${selectedStudentId}`);
      const d = res.data.data;
      alert(
        `${res.data.message}\n\nStudent login: ${d?.student_username}\nParent login: ${d?.parent_username}\nDefault password: ${d?.default_password}`
      );
      setCreateStudentOpen(false);
      setSelectedStudentId("");
      loadPortal();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to create portal accounts"));
    }
  };

  const createTeacherAccount = async () => {
    if (!selectedFacultyId) return alert("Select a faculty member");
    try {
      const res = await api.post("/erp/teacher/accounts", {
        faculty_id: selectedFacultyId,
        username: teacherUsername.trim() || undefined,
        password: teacherPassword.trim() || undefined,
      });
      const d = res.data.data;
      alert(`${res.data.message}${d?.default_password ? `\nPassword: ${d.default_password}` : ""}`);
      setCreateTeacherOpen(false);
      setSelectedFacultyId("");
      setTeacherUsername("");
      setTeacherPassword("");
      loadTeachers();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to create teacher account"));
    }
  };

  const openReset = (type: "portal" | "teacher", id: string, username: string) => {
    setResetTarget({ type, id, username });
    setResetPassword("");
    setResetOpen(true);
  };

  const submitReset = async () => {
    if (!resetTarget) return;
    try {
      const url = resetTarget.type === "portal"
        ? `/erp/portal/accounts/${resetTarget.id}/reset-password`
        : `/erp/teacher/accounts/${resetTarget.id}/reset-password`;
      const res = await api.patch(url, resetPassword.trim() ? { password: resetPassword.trim() } : {});
      const pwd = res.data.data?.default_password;
      alert(pwd ? `Password reset for ${resetTarget.username}\nNew password: ${pwd}` : res.data.message || "Password reset");
      setResetOpen(false);
    } catch (err) {
      alert(getApiErrorMessage(err, "Reset failed"));
    }
  };

  const togglePortal = async (account: PortalAccount) => {
    const action = account.is_active ? "deactivate" : "activate";
    if (!confirm(`${action} ${account.username}?`)) return;
    try {
      await api.patch(`/erp/portal/accounts/${account.id}/toggle`, { is_active: !account.is_active });
      loadPortal();
    } catch (err) {
      alert(getApiErrorMessage(err, "Update failed"));
    }
  };

  const toggleTeacher = async (account: TeacherAccount) => {
    const action = account.is_active ? "deactivate" : "activate";
    if (!confirm(`${action} ${account.username}?`)) return;
    try {
      await api.patch(`/erp/teacher/accounts/${account.id}/toggle`, { is_active: !account.is_active });
      loadTeachers();
    } catch (err) {
      alert(getApiErrorMessage(err, "Update failed"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Portal & Login Management</h1>
          <p className="text-muted-foreground">Create and reset parent, student, and teacher logins</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant={tab === "portal" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("portal")}>
          <Users className="h-4 w-4" /> Parent & Student
        </Button>
        <Button variant={tab === "teacher" ? "default" : "outline"} className="rounded-xl" onClick={() => setTab("teacher")}>
          <BookOpen className="h-4 w-4" /> Teachers
        </Button>
      </div>

      {tab === "portal" && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <GlowCard className="p-6">
              <Users className="mb-3 h-8 w-8 text-primary" />
              <h3 className="text-lg font-bold">Parent Login</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Username: <code>{`{admission_no}_parent`}</code><br />
                Default password: last 4 digits of admission number
              </p>
              <Link href="/portal/login?as=parent" className="mt-4 inline-block">
                <Button variant="outline" className="rounded-xl">Open Parent Portal</Button>
              </Link>
            </GlowCard>
            <GlowCard className="p-6">
              <GraduationCap className="mb-3 h-8 w-8 text-violet-600" />
              <h3 className="text-lg font-bold">Student Login</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Username: <code>{`{admission_no}`}</code><br />
                Default password: last 4 digits of admission number
              </p>
              <Link href="/portal/login?as=student" className="mt-4 inline-block">
                <Button variant="outline" className="rounded-xl">Open Student Portal</Button>
              </Link>
            </GlowCard>
          </div>

          <GlowCard className="mt-6 p-6">
            <h3 className="font-bold">Create Parent & Student Logins</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Accounts are auto-created when you add a student. Use these options for bulk import or individual setup.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="rounded-xl" onClick={() => setCreateStudentOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create for One Student
              </Button>
              <Button variant="outline" className="rounded-xl" disabled={provisioning} onClick={provisionPortals}>
                {provisioning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Provision All Students
              </Button>
            </div>
          </GlowCard>
        </>
      )}

      {tab === "teacher" && (
        <GlowCard className="p-6">
          <h3 className="font-bold">Teacher Login</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Username: faculty email (or auto-generated). Default password: <code>teacher123</code>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="rounded-xl" onClick={() => setCreateTeacherOpen(true)}>
              <UserPlus className="h-4 w-4" /> Create Teacher Login
            </Button>
            <Button variant="outline" className="rounded-xl" disabled={provisioning} onClick={provisionTeachers}>
              {provisioning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Provision All Faculty
            </Button>
            <Link href="/teacher/login">
              <Button variant="outline" className="rounded-xl">Open Teacher Portal</Button>
            </Link>
          </div>
        </GlowCard>
      )}

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold">{tab === "portal" ? "Parent & Student Accounts" : "Teacher Accounts"}</h3>
        <AdminTableToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          placeholder={tab === "portal" ? "Search username, student, admission no..." : "Search username, teacher name..."}
        />
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : tab === "portal" ? (
          <AdminListTable
            rows={accounts}
            rowKey={(a) => a.id}
            emptyMessage="No portal accounts. Create for a student or run Provision All."
            columns={[
              { key: "username", label: "Username" },
              { key: "account_type", label: "Type", render: (a) => <span className="capitalize">{a.account_type}</span> },
              { key: "student_name", label: "Student" },
              { key: "admission_no", label: "Admission No" },
              { key: "class_level", label: "Class" },
              {
                key: "is_active",
                label: "Status",
                render: (a) => (
                  <span className={a.is_active ? "text-emerald-600" : "text-muted-foreground"}>
                    {a.is_active ? "Active" : "Inactive"}
                  </span>
                ),
              },
            ]}
            actions={(a) => (
              <>
                <Button variant="outline" size="sm" className="rounded-xl" title="Reset password" onClick={() => openReset("portal", a.id, a.username)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={a.is_active ? "destructive" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => togglePortal(a)}
                >
                  {a.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </Button>
              </>
            )}
          />
        ) : (
          <AdminListTable
            rows={teacherAccounts}
            rowKey={(a) => a.id}
            emptyMessage="No teacher accounts. Create one or run Provision All Faculty."
            columns={[
              { key: "username", label: "Username" },
              { key: "faculty_name", label: "Teacher" },
              { key: "department", label: "Department" },
              {
                key: "is_active",
                label: "Status",
                render: (a) => (
                  <span className={a.is_active ? "text-emerald-600" : "text-muted-foreground"}>
                    {a.is_active ? "Active" : "Inactive"}
                  </span>
                ),
              },
              {
                key: "last_login",
                label: "Last Login",
                render: (a) => a.last_login ? new Date(String(a.last_login)).toLocaleString() : "—",
              },
            ]}
            actions={(a) => (
              <>
                <Button variant="outline" size="sm" className="rounded-xl" title="Reset password" onClick={() => openReset("teacher", a.id, a.username)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={a.is_active ? "destructive" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => toggleTeacher(a)}
                >
                  {a.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </Button>
              </>
            )}
          />
        )}
      </div>

      <ErpModal open={createStudentOpen} onClose={() => setCreateStudentOpen(false)} title="Create Parent & Student Logins">
        <p className="mb-4 text-sm text-muted-foreground">Creates both parent and student portal accounts for the selected student.</p>
        <label className="mb-1 block text-sm font-medium">Student</label>
        <StudentSelect value={selectedStudentId} onChange={setSelectedStudentId} required />
        <p className="mt-3 text-xs text-muted-foreground">Default password = last 4 digits of admission number for both accounts.</p>
        <div className="mt-6 flex gap-2">
          <Button className="rounded-xl" onClick={createStudentPortal} disabled={!selectedStudentId}>Create Logins</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setCreateStudentOpen(false)}>Cancel</Button>
        </div>
      </ErpModal>

      <ErpModal open={createTeacherOpen} onClose={() => setCreateTeacherOpen(false)} title="Create Teacher Login">
        <label className="mb-1 block text-sm font-medium">Faculty Member</label>
        <FacultySelect value={selectedFacultyId} onChange={(id) => setSelectedFacultyId(id)} placeholder="Select teacher" />
        <label className="mb-1 mt-4 block text-sm font-medium">Username (optional)</label>
        <Input className="rounded-xl" placeholder="Uses faculty email if empty" value={teacherUsername} onChange={(e) => setTeacherUsername(e.target.value)} />
        <label className="mb-1 mt-3 block text-sm font-medium">Password (optional)</label>
        <Input className="rounded-xl" placeholder="Default: teacher123" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} />
        <div className="mt-6 flex gap-2">
          <Button className="rounded-xl" onClick={createTeacherAccount} disabled={!selectedFacultyId}>Create Login</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setCreateTeacherOpen(false)}>Cancel</Button>
        </div>
      </ErpModal>

      <ErpModal open={resetOpen} onClose={() => setResetOpen(false)} title={`Reset Password — ${resetTarget?.username || ""}`}>
        <p className="mb-4 text-sm text-muted-foreground">
          Leave blank to reset to default:
          {resetTarget?.type === "portal" ? " last 4 digits of admission number" : " teacher123"}
        </p>
        <label className="mb-1 block text-sm font-medium">New password (optional)</label>
        <Input type="password" className="rounded-xl" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Custom password" />
        <div className="mt-6 flex gap-2">
          <Button className="rounded-xl" onClick={submitReset}>Reset Password</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setResetOpen(false)}>Cancel</Button>
        </div>
      </ErpModal>
    </div>
  );
}
