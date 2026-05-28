"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErpRowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
  deleteLabel?: string;
}

export function ErpRowActions({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  deleteLabel = "Remove this record?",
}: ErpRowActionsProps) {
  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm(deleteLabel)) return;
    await onDelete();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit && onEdit && (
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onEdit} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {canDelete && onDelete && (
        <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleDelete} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
