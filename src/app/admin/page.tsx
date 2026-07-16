import { notFound } from "next/navigation";

import { AdminBulkEventImport, AdminCleanupTestData } from "@/components/AdminTools";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Admin tools</h1>
      <div className="mt-6 space-y-6">
        <AdminBulkEventImport />
        <AdminCleanupTestData />
      </div>
    </div>
  );
}
