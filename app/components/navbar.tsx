"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "./navbar.css";
import { 
  FiHome, 
  FiInfo, 
  FiMail, 
  FiUser, 
  FiChevronDown, 
  FiMenu, 
  FiX,
  FiBook,
  FiCalendar,
  FiUsers
} from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.navbar-menu') && !target.closest('.navbar-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link href="/">
            <img src="/logo-2.png" alt="Faculté Des Sciences Logo" />
            <span>Faculté Des Sciences</span>
          </Link>
        </div>
      </div>
      <div className="navbar-container2">
        <div className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX className="toggle-icon" /> : <FiMenu className="toggle-icon" />}
        </div>

        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <ul className="navbar-items">
            <li className={`navbar-item ${isActive('/') ? 'active' : ''}`}>
              <Link href="/" className="navbar-link">
                <FiHome className="nav-icon" />
                <span>Home</span>
              </Link>
            </li>

            <li className={`navbar-item dropdown ${activeDropdown === 'academics' ? 'dropdown-active' : ''}`}>
              <div 
                className={`navbar-link ${pathname?.startsWith('/academics') ? 'active' : ''}`} 
                onClick={() => toggleDropdown('academics')}
              >
                <FiBook className="nav-icon" />
                <span>Academics</span>
                <FiChevronDown className={`dropdown-icon ${activeDropdown === 'academics' ? 'rotated' : ''}`} />
              </div>
              <ul className="dropdown-menu">
                <li><Link href="/academics/programs" className="dropdown-link">Programs</Link></li>
                <li><Link href="/academics/courses" className="dropdown-link">Courses</Link></li>
                <li><Link href="/academics/schedule" className="dropdown-link">Schedule</Link></li>
              </ul>
            </li>

           

            <li className={`navbar-item dropdown ${activeDropdown === 'events' ? 'dropdown-active' : ''}`}>
              <div 
                className={`navbar-link ${pathname?.startsWith('/events') ? 'active' : ''}`} 
                onClick={() => toggleDropdown('events')}
              >
                <FiCalendar className="nav-icon" />
                <span>Events</span>
                <FiChevronDown className={`dropdown-icon ${activeDropdown === 'events' ? 'rotated' : ''}`} />
              </div>
              <ul className="dropdown-menu">
                <li><Link href="/events/upcoming" className="dropdown-link">Upcoming</Link></li>
                <li><Link href="/events/past" className="dropdown-link">Past Events</Link></li>
                <li><Link href="/events/calendar" className="dropdown-link">Calendar</Link></li>
              </ul>
            </li>

            <li className={`navbar-item ${isActive('/contact') ? 'active' : ''}`}>
              <Link href="/contact" className="navbar-link">
                <FiMail className="nav-icon" />
                <span>Contact</span>
              </Link>
            </li>
          </ul>

          <div className="navbar-buttons">
            <Link href="/login" className="btn-login">
              <FiUser className="btn-icon" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
