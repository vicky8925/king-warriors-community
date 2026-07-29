import { AuthGuard } from "@/components/admin/AuthGuard";
import { Sidebar } from "@/components/admin/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10">{children}</div>
      </div>
    </AuthGuard>
  );
}
