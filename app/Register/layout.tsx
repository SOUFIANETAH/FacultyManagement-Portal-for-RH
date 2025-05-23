"use client";
import "./register.css";

export default function LoginLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return <div className="login-layout">{children}</div>;
}
