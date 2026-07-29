import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-ivory)]">{title}</h1>
        <p className="text-sm text-[var(--color-ash)] mt-1">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus size={16} /> {actionLabel}
        </Button>
      )}
    </div>
  );
}
