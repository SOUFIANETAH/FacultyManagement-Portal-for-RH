// page.tsx (modules)
'use client';

import React, { useState } from 'react';
import {
  Microchip,
  Cpu,
  Network,
  Database,
  Code,
  Server,
  CircuitBoard,
  BrainCircuit,
  Laptop2,
  Wifi,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import './mod.css';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}

function ModuleCard({ icon, title, description, onClick }: ModuleCardProps) {
  return (
    <div className="module-card" onClick={onClick}>
      <div className="module-icon-container">
        {icon}
      </div>
      <div className="module-content">
        <h3 className="module-title">{title}</h3>
        {description && <p className="module-description">{description}</p>}
      </div>
    </div>
  );
}

export default function ModulesPage() {
  const router = useRouter();
  const [selectedSemester, setSelectedSemester] = useState<'S5' | 'S6'>('S5');

  const s5Modules = [
    {
      icon: <Cpu className="icon" size={32} />,
      title: "Développement Matériel",
      description: "Conception et programmation de systèmes embarqués",
      path: '/modules/dev-materiel'
    },
    {
      icon: <Code className="icon" size={32} />,
      title: "UML à Java",
      description: "Modélisation UML et implémentation en Java",
      path: '/modules/uml-java'
    },
    {
      icon: <Network className="icon" size={32} />,
      title: "Réseaux Avancés",
      description: "Architectures réseaux et protocoles avancés",
      path: '/modules/reseaux-avances'
    },
    {
      icon: <Database className="icon" size={32} />,
      title: "Bases de Données Avancées",
      description: "Optimisation et administration de bases de données",
      path: '/modules/bdd-avancees'
    },
    {
      icon: <CircuitBoard className="icon" size={32} />,
      title: "Compilation",
      description: "Théorie et pratique des compilateurs",
      path: '/modules/compilation'
    }
  ];

  const s6Modules = [
    {
      icon: <Microchip className="icon" size={32} />,
      title: "Développement Embarqué",
      description: "Programmation de systèmes embarqués temps réel",
      path: '/modules/dev-embarque'
    },
    {
      icon: <Server className="icon" size={32} />,
      title: "JEE",
      description: "Développement d'applications d'entreprise avec Java EE",
      path: '/modules/jee'
    },
    {
      icon: <Wifi className="icon" size={32} />,
      title: "Administration Réseau",
      description: "Gestion et sécurisation des infrastructures réseaux",
      path: '/modules/admin-reseau'
    },
    {
      icon: <Laptop2 className="icon" size={32} />,
      title: "Projet Informatique",
      description: "Projet transversal mettant en œuvre les compétences acquises",
      path: '/modules/projet'
    },
    {
      icon: <BrainCircuit className="icon" size={32} />,
      title: "Machine Learning",
      description: "Fondements et applications de l'apprentissage automatique",
      path: '/modules/machine-learning'
    }
  ];

  return (
    <div className="modules-container">
      <h1 className="modules-header">Modules ISOC</h1>
      
      <div className="semester-selector">
        <button 
          className={`semester-btn ${selectedSemester === 'S5' ? 'active' : ''}`}
          onClick={() => setSelectedSemester('S5')}
        >
          Semestre 5
        </button>
        <button 
          className={`semester-btn ${selectedSemester === 'S6' ? 'active' : ''}`}
          onClick={() => setSelectedSemester('S6')}
        >
          Semestre 6
        </button>
      </div>

      <div className="modules-grid">
        {(selectedSemester === 'S5' ? s5Modules : s6Modules).map((module, index) => (
          <ModuleCard
            key={index}
            icon={module.icon}
            title={module.title}
            description={module.description}
            onClick={() => router.push(module.path)}
          />
        ))}
      </div>
    </div>
  );
}
