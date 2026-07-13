import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { TopBarProvider } from "@/components/ui/TopBarContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TopBarProvider>
      <div className="flex h-screen w-full bg-gray-50/50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </TopBarProvider>
  );
}
