// page.tsx (filiere)
'use client';

import React from 'react';
import {
  Globe,
  Network,
  BrainCircuit,
  Database,
  Cpu,
  Server,
  Code,
  Binary,
  CircuitBoard,
  Wifi,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import './fil.css';

interface NavigationCardProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}

function NavigationCard({ icon, title, onClick }: NavigationCardProps) {
  return (
    <div className="dashboard-card page-card" onClick={onClick}>
      <div className="icon-container">
        {icon}
      </div>
      <h3 className="card-title">{title}</h3>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const menuItems = [
    {
      icon: <Globe className="icon" size={40} />,
      title: "ISOC", // Réseaux et systèmes communicants
      path: '/matieres'
    },
    {
      icon: <BrainCircuit className="icon" size={40} />,
      title: "SMI", // Systèmes et moyens informatiques
      path: '/smi'
    },
    {
      icon: <Database className="icon" size={40} />,
      title: "SDIA", // Systèmes digitaux et intelligence artificielle
      path: '/sdia'
    },
    {
      icon: <CircuitBoard className="icon" size={40} />,
      title: "Digitalisation",
      path: '/digitalisation'
    },
    {
      icon: <Cpu className="icon" size={40} />,
      title: "Génie Informatique",
      path: '/genie-info'
    },
    {
      icon: <Network className="icon" size={40} />,
      title: "SIRO", // Systèmes informatiques et réseaux option
      path: '/siro'
    }
  ];
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {menuItems.map((item, index) => (
          <NavigationCard
            key={index}
            icon={item.icon}
            title={item.title}
            onClick={() => router.push(item.path)}
          />
        ))}
      </div>
    </div>
  );
}