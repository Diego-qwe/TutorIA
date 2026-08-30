import Sidebar from "@/components/Sidebar";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      <Sidebar />

      <main className="flex-1 bg-slate-100 p-8">
        {children}
      </main>

    </div>
  );
}