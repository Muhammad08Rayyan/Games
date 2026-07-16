import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignOut } from "@phosphor-icons/react/dist/ssr";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  if (!isAdmin) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-slate-900 font-bold text-xl">
          Admin
        </div>
        <form action="/auth/signout" method="post">
          <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium">
            <SignOut size={18} weight="bold" />
            Sign out
          </button>
        </form>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
