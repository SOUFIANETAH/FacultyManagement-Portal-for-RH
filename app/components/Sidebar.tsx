"use client";
import React from "react";
import "./Sidebar.css";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaUserTie } from "react-icons/fa";
import { TfiAnnouncement } from "react-icons/tfi";


import {
  GraduationCap,

  Building
} from 'lucide-react';
import {
  FiHome,
  FiUser,
  FiSettings,
  FiUsers,
  FiBook,
  FiFileText,
  FiLogOut,
  FiLayout,
} from "react-icons/fi";
import {AiFillBuild} from "react-icons/ai";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

export default function Sidebar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const userRole = session?.user?.role;
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { name: "Accueil", path: "/", icon: <FiLayout /> },
      { name: "Dashboard", path: `/${userRole}/dashboard`, icon: <FiHome /> },
    ];

    const roleItems: Record<string, MenuItem[]> = {
      admin: [
        { name: "Creer Utilisateurs", path: "/admin/create", icon: <FiSettings /> },
        {
          name: "Gestion des utilisateurs",
          path: "/admin/users",
          icon: <FiUsers />,
        },
      ],
      dean: [
        { name: "Filieres", path: "/dean/filieres", icon: <FiSettings /> },
        { name: "Departements", path: "/dean/departements", icon: <AiFillBuild /> },
        { name: "Annonces", path: "/annonces", icon: <TfiAnnouncement /> },
        { name: "Modules", path: "/dean/modules", icon: <FiBook /> },


      ],
      Vicedean: [
        { name: "Dean", path: "/dean/dashboard", icon: <FiSettings /> },

      ],
      administration: [
        { name: "Docs", path: "/administration/docs/generator", icon: <FiFileText /> },
        { name: "Personnel", path: "/personnels", icon: <FaUserTie />},
        { name: "Etudiants", path: "/etudiants", icon: <GraduationCap /> },
        { name: "Departements", path: "/departements", icon: <Building /> },

      ],
    };

    return [...baseItems, ...(userRole ? roleItems[userRole] || [] : [])];
  };

  const menuItems = getMenuItems();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Navigation</h2>
      </div>

      <div className="sidebar-content">
        <div className="user-info">
          {userName && <p className="user-name">{userName}</p>}
          {userEmail && <p className="user-email">{userEmail}</p>}
        </div>

        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li key={index} onClick={() => router.push(item.path)}>
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </li>
          ))}
        </ul>

        {status === "authenticated" && (
          <button onClick={handleLogout} className="logout-button">
            <FiLogOut className="menu-icon" />
            <span className="menu-text">Déconnexion</span>
          </button>
        )}
      </div>
    </div>
  );
}
