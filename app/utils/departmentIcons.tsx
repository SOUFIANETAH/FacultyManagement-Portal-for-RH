// utils/departmentIcons.tsx
import React from 'react';
import {
    Code,
    Calculator,
    Atom,
    FlaskConical,
    Leaf,
    Mountain,
    MoreHorizontal,
    BookOpen,
    Languages,
    Coins,
    HeartPulse,
    Scale,
    Landmark,
    Building2,
    History,
    Palette,
    Music,
    Radio
} from 'lucide-react';

/**
 * Returns an appropriate icon based on the department name
 */
export function getIconForDepartment(departmentName: string) {
    const name = departmentName.toLowerCase();

    // Technical departments
    if (name.includes('informatique') || name.includes('computer'))
        return <Code className="icon" size={40} />;

    if (name.includes('mathématique') || name.includes('math'))
        return <Calculator className="icon" size={40} />;

    if (name.includes('physique') || name.includes('physics'))
        return <Atom className="icon" size={40} />;

    if (name.includes('chimie') || name.includes('chemical') || name.includes('chemistry'))
        return <FlaskConical className="icon" size={40} />;

    if (name.includes('biologie') || name.includes('biology') || name.includes('bio'))
        return <Leaf className="icon" size={40} />;

    if (name.includes('géologie') || name.includes('geology') || name.includes('earth'))
        return <Mountain className="icon" size={40} />;

    // Humanities and social sciences
    if (name.includes('littérature') || name.includes('literature') || name.includes('lettre'))
        return <BookOpen className="icon" size={40} />;

    if (name.includes('langue') || name.includes('language') || name.includes('linguistic'))
        return <Languages className="icon" size={40} />;

    if (name.includes('économie') || name.includes('economic') || name.includes('finance') || name.includes('gestion'))
        return <Coins className="icon" size={40} />;

    if (name.includes('médecine') || name.includes('medical') || name.includes('santé') || name.includes('health'))
        return <HeartPulse className="icon" size={40} />;

    if (name.includes('droit') || name.includes('law') || name.includes('juridique') || name.includes('legal'))
        return <Scale className="icon" size={40} />;

    if (name.includes('politique') || name.includes('political') || name.includes('government'))
        return <Landmark className="icon" size={40} />;

    if (name.includes('architecture') || name.includes('civil') || name.includes('bâtiment'))
        return <Building2 className="icon" size={40} />;

    if (name.includes('histoire') || name.includes('history'))
        return <History className="icon" size={40} />;

    if (name.includes('art') || name.includes('design') || name.includes('visual'))
        return <Palette className="icon" size={40} />;

    if (name.includes('musique') || name.includes('music'))
        return <Music className="icon" size={40} />;

    if (name.includes('communication') || name.includes('media') || name.includes('journalisme'))
        return <Radio className="icon" size={40} />;

    // Default icon if no match is found
    return <MoreHorizontal className="icon" size={40} />;
}