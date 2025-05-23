"use client";
import RoleNav from "@/app/components/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);

  // Hide navbar on specific routes if needed
  useEffect(() => {
    const hideNavbarRoutes = [
      "/admin/settings",
      "/admin/profile",
      // Add other routes where navbar should be hidden
    ];
    setShowNavbar(
      !hideNavbarRoutes.some((route) => pathname?.startsWith(route)),
    );
  }, [pathname]);

  return (
    <div className="admin-container">
      {showNavbar && <RoleNav />}
      <RoleNav />

      <main className="admin-content">{children}</main>
    </div>
  );
}
