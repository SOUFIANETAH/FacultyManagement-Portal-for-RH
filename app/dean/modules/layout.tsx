"use client";

import RoleNav from "@/app/components/Sidebar";


export default function DeanLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {


    return (
        <div className="admin-container">

            <RoleNav />

            <main className="admin-content">{children}</main>
        </div>
    );
}

