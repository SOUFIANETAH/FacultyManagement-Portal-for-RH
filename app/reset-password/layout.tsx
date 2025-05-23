"use client";
import "./reset-password.css";

export default function ForgotLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return <div className="Forgot-layout">{children}</div>;
}
