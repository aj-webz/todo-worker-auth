import NavbarClient from "@/components/navbar/NavbarClient";
import Sidebar from "@/components/sidebar/Sidebar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <NavbarClient />
      {children}
    </div>
  );
}
