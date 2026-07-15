import React from 'react';
import * as Lucide from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function Icon({ name, className = '', size = 20 }: IconProps) {
  // Safe mapping of names to Lucide icons
  const IconComponent = (Lucide as any)[name];
  
  if (!IconComponent) {
    // Fallback icon
    return <Lucide.HelpCircle className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
