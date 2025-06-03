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

    useEffect(() => {
        const hideNavbarRoutes = [
            "/admin/settings",
            "/admin/profile",
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
