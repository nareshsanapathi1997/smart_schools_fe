"use client";

import { useEffect, useState } from "react";
import { ErpAddButton, ErpAdminShell, ErpModal } from "@/components/admin/ErpAdminShell";
import { ErpRowActions } from "@/components/admin/ErpRowActions";
import { StudentSelect } from "@/components/admin/StudentSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

type Tab = "routes" | "stops" | "assignments";

const emptyRoute = { name: "", vehicle_no: "", driver_name: "", driver_phone: "" };
const emptyStop = { route_id: "", stop_name: "", pickup_time: "" };
const emptyAssign = { student_id: "", route_id: "", stop_id: "" };

export default function AdminTransportPage() {
  const [tab, setTab] = useState<Tab>("routes");
  const [data, setData] = useState<{ routes: Record<string, unknown>[]; stops: Record<string, unknown>[] }>({ routes: [], stops: [] });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState(emptyRoute);
  const [stopForm, setStopForm] = useState(emptyStop);
  const [assignForm, setAssignForm] = useState(emptyAssign);
  const [reload, setReload] = useState(0);

  const load = () => {
    api.get("/erp/transport").then((r) => setData(r.data.data || { routes: [], stops: [] }));
  };
  useEffect(() => { load(); }, [reload]);

  const openCreate = () => {
    setEditingId(null);
    if (tab === "routes") setRouteForm(emptyRoute);
    if (tab === "stops") setStopForm(emptyStop);
    if (tab === "assignments") setAssignForm(emptyAssign);
    setOpen(true);
  };

  const openEditRoute = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setRouteForm({
      name: String(row.name || ""),
      vehicle_no: String(row.vehicle_no || ""),
      driver_name: String(row.driver_name || ""),
      driver_phone: String(row.driver_phone || ""),
    });
    setOpen(true);
  };

  const openEditStop = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    setStopForm({
      route_id: String(row.route_id || ""),
      stop_name: String(row.stop_name || ""),
      pickup_time: String(row.pickup_time || "").slice(0, 5),
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (tab === "routes") {
        if (editingId) await api.put(`/erp/transport/routes/${editingId}`, routeForm);
        else await api.post("/erp/transport/routes", routeForm);
      } else if (tab === "stops") {
        if (editingId) await api.put(`/erp/transport/stops/${editingId}`, stopForm);
        else await api.post("/erp/transport/stops", stopForm);
      } else {
        await api.post("/erp/transport/assign", assignForm);
      }
      setOpen(false);
      setReload((n) => n + 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  const routeName = (id: unknown) => data.routes.find((r) => r.id === id)?.name as string || "—";
  const stopsForRoute = (routeId: string) => data.stops.filter((s) => String(s.route_id) === routeId);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["routes", "stops", "assignments"] as Tab[]).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} className="rounded-xl capitalize" onClick={() => setTab(t)}>{t}</Button>
        ))}
        <ErpAddButton onClick={openCreate} label={tab === "routes" ? "Add Route" : tab === "stops" ? "Add Stop" : "Assign Student"} />
      </div>

      {tab === "routes" && (
        <ErpAdminShell
          key={`routes-${reload}`}
          title="Transport Routes"
          subtitle="Bus routes and vehicle details"
          endpoint="/erp/transport"
          columns={[
            { key: "name", label: "Route" },
            { key: "vehicle_no", label: "Vehicle" },
            { key: "driver_name", label: "Driver" },
            { key: "driver_phone", label: "Phone" },
          ]}
          rowActions={(row) => (
            <ErpRowActions
              onEdit={() => openEditRoute(row)}
              onDelete={async () => { await api.delete(`/erp/transport/routes/${row.id}`); setReload((n) => n + 1); }}
            />
          )}
        />
      )}

      {tab === "stops" && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Transport Stops</h1>
            <p className="text-muted-foreground">Pickup stops per route</p>
          </div>
          <div className="space-y-2">
            {data.stops.length === 0 && <p className="text-muted-foreground">No stops yet.</p>}
            {data.stops.map((s) => (
              <div key={String(s.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card p-4">
                <div>
                  <p className="font-medium">{String(s.stop_name)}</p>
                  <p className="text-sm text-muted-foreground">{routeName(s.route_id)} • {String(s.pickup_time || "—")}</p>
                </div>
                <ErpRowActions
                  onEdit={() => openEditStop(s)}
                  onDelete={async () => { await api.delete(`/erp/transport/stops/${s.id}`); setReload((n) => n + 1); }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "assignments" && (
        <ErpAdminShell
          key={`assign-${reload}`}
          title="Student Transport"
          subtitle="Route assignments by student"
          endpoint="/erp/transport/assignments"
          columns={[
            { key: "student_name", label: "Student" },
            { key: "admission_no", label: "Admission No" },
            { key: "route_name", label: "Route" },
            { key: "stop_name", label: "Stop", render: (r) => String(r.stop_name || "—") },
          ]}
          rowActions={(row) => (
            <ErpRowActions
              canEdit={false}
              onDelete={async () => { await api.delete(`/erp/transport/assignments/${row.id}`); setReload((n) => n + 1); }}
              deleteLabel={`Remove transport assignment for ${row.student_name}?`}
            />
          )}
        />
      )}

      <ErpModal open={open} onClose={() => { setOpen(false); setEditingId(null); }} title={
        tab === "routes" ? (editingId ? "Edit Route" : "Add Route")
          : tab === "stops" ? (editingId ? "Edit Stop" : "Add Stop")
          : "Assign Student"
      }>
        <div className="space-y-3">
          {tab === "routes" && (<>
            <Input className="rounded-xl" placeholder="Route Name" value={routeForm.name} onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })} />
            <Input className="rounded-xl" placeholder="Vehicle No" value={routeForm.vehicle_no} onChange={(e) => setRouteForm({ ...routeForm, vehicle_no: e.target.value })} />
            <Input className="rounded-xl" placeholder="Driver Name" value={routeForm.driver_name} onChange={(e) => setRouteForm({ ...routeForm, driver_name: e.target.value })} />
            <Input className="rounded-xl" placeholder="Driver Phone" value={routeForm.driver_phone} onChange={(e) => setRouteForm({ ...routeForm, driver_phone: e.target.value })} />
          </>)}
          {tab === "stops" && (<>
            <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={stopForm.route_id} onChange={(e) => setStopForm({ ...stopForm, route_id: e.target.value })}>
              <option value="">Select Route</option>
              {data.routes.map((r) => <option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}
            </select>
            <Input className="rounded-xl" placeholder="Stop Name" value={stopForm.stop_name} onChange={(e) => setStopForm({ ...stopForm, stop_name: e.target.value })} />
            <Input className="rounded-xl" type="time" value={stopForm.pickup_time} onChange={(e) => setStopForm({ ...stopForm, pickup_time: e.target.value })} />
          </>)}
          {tab === "assignments" && (<>
            <StudentSelect value={assignForm.student_id} onChange={(student_id) => setAssignForm({ ...assignForm, student_id })} required placeholder="Select Student *" />
            <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={assignForm.route_id} onChange={(e) => setAssignForm({ ...assignForm, route_id: e.target.value, stop_id: "" })}>
              <option value="">Select Route</option>
              {data.routes.map((r) => <option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}
            </select>
            <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" value={assignForm.stop_id} onChange={(e) => setAssignForm({ ...assignForm, stop_id: e.target.value })}>
              <option value="">Select Stop (optional)</option>
              {stopsForRoute(assignForm.route_id).map((s) => <option key={String(s.id)} value={String(s.id)}>{String(s.stop_name)}</option>)}
            </select>
          </>)}
          <Button className="w-full rounded-xl" onClick={save}>{editingId ? "Update" : "Save"}</Button>
        </div>
      </ErpModal>
    </>
  );
}
