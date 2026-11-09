import React from 'react';
import {
  Activity,
  BookOpen,
  Calendar,
  Camera,
  Car,
  Flower2,
  Hammer,
  HelpCircle,
  Laptop,
  Paintbrush,
  Scissors,
  ShieldAlert,
  Sparkles,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Paintbrush':
      return <Paintbrush className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Monitor':
    case 'Laptop':
      return <Laptop className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Flower':
    case 'Flower2':
      return <Flower2 className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
