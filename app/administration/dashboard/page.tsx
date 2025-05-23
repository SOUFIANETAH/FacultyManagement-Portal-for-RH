'use client';

import React, {useEffect, useState} from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  MessageCircle,
  FileDigit,
  Building
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './administ.module.css';
import {useSession} from "next-auth/react";

interface NavigationCardProps {
  icon: React.ReactNode;
  title: string;
  count?: number;
  onClick?: () => void;
}

function NavigationCard({ icon, title, count, onClick }: NavigationCardProps) {
  return (
      <div className={`${styles.card} ${styles.pageCard}`} onClick={onClick}>
        <div className={styles.iconContainer}>
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
        {count !== undefined && (
            <div className={styles.countBadge}>
              {count}
            </div>
        )}
      </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [counts, setCounts] = useState({
    personnels: 0,
    etudiants: 0,
    departements: 0,
    documents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Fetch counts from API endpoints
      const fetchCounts = async () => {
        try {
          setLoading(true);
          setError(null);

          const endpoints = [
            '/api/counts/personnels',
            '/api/counts/etudiants',
            '/api/counts/departements',
            '/api/counts/documents'
          ];

          const requests = endpoints.map(async (endpoint) => {
            const response = await fetch(endpoint);

            // Check if response is ok
            if (!response.ok) {
              throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const text = await response.text();
              console.error(`Non-JSON response from ${endpoint}:`, text);
              throw new Error(`Expected JSON response from ${endpoint}, got ${contentType}`);
            }

            return response.json();
          });

          const [
            personnelsData,
            etudiantsData,
            departementsData,
            documentsData
          ] = await Promise.all(requests);

          setCounts({
            personnels: personnelsData.count || 0,
            etudiants: etudiantsData.count || 0,
            departements: departementsData.count || 0,
            documents: documentsData.count || 0
          });
        } catch (error) {
          console.error("Error fetching counts:", error);
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          // Set default values on error
          setCounts({
            personnels: 0,
            etudiants: 0,
            departements: 0,
            documents: 3
          });
        } finally {
          setLoading(false);
        }
      };

      fetchCounts();
    }
  }, [status, session, router]);

  const menuItems = [
    {
      icon: <User className={styles.icon} size={24} />,
      title: "Personnel",
      path: '/personnels',
      count: counts.personnels
    },
    {
      icon: <GraduationCap className={styles.icon} size={24} />,
      title: "Étudiants",
      path: '/etudiants',
      count: counts.etudiants
    },
    {
      icon: <Building className={styles.icon} size={24} />,
      title: "Départements",
      path: '/departements',
      count: counts.departements
    },
    {
      icon: <FileDigit className={styles.icon} size={24} />,
      title: "Documents",
      path: '/administration/docs/generator',
      count: counts.documents
    }
  ];

  if (loading) {
    return (
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Chargement...</h1>
          </div>
        </div>
    );
  }

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Tableau de Bord Administratif</h1>
          <p className={styles.subtitle}>Gérez votre institution en un seul endroit</p>
          {error && (
              <div style={{ color: 'red', marginTop: '10px' }}>
                Erreur lors du chargement des données: {error}
              </div>
          )}
        </div>
        <div className={styles.grid}>
          {menuItems.map((item, index) => (
              <NavigationCard
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  count={item.count}
                  onClick={() => router.push(item.path)}
              />
          ))}
        </div>
      </div>
  );
}