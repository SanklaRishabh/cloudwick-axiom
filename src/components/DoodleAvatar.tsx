import React from 'react';
import { createAvatar } from '@dicebear/core';
import { shapes, funEmoji, bottts } from '@dicebear/collection';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DoodleAvatarProps {
  seed: string; // Use user ID or email as seed for consistency
  size?: number;
  className?: string;
  fallback?: string;
}

const DoodleAvatar: React.FC<DoodleAvatarProps> = ({ 
  seed, 
  size = 40, 
  className,
  fallback = "U"
}) => {
  // Generate different styles based on seed hash
  const getAvatarStyle = (seed: string) => {
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const styleIndex = Math.abs(hash) % 3;
    switch (styleIndex) {
      case 0:
        return shapes;
      case 1:
        return funEmoji;
      default:
        return bottts;
    }
  };

  const avatarStyle = getAvatarStyle(seed);
  
  let avatar;
  
  if (avatarStyle === shapes) {
    avatar = createAvatar(shapes, {
      seed,
      size,
      // Beautiful geometric combinations with rich colors
      backgroundColor: [
        "3b82f6", // Rich blue
        "10b981", // Emerald green  
        "f59e0b", // Amber yellow
        "ef4444", // Red
        "8b5cf6", // Purple
        "06b6d4", // Cyan
        "f97316", // Orange
        "ec4899"  // Pink
      ],
      backgroundType: ["gradientLinear", "solid"],
    });
  } else if (avatarStyle === funEmoji) {
    avatar = createAvatar(funEmoji, {
      seed,
      size,
      backgroundColor: [
        "fef3c7", // Light amber
        "ddd6fe", // Light purple
        "bfdbfe", // Light blue
        "bbf7d0", // Light green
        "fecaca", // Light red
        "fed7d7", // Light pink
        "e0e7ff", // Light indigo
        "fef9c3"  // Light yellow
      ],
    });
  } else {
    avatar = createAvatar(bottts, {
      seed,
      size,
      backgroundColor: [
        "1e293b", // Dark slate
        "0f172a", // Very dark slate
        "1f2937", // Dark gray
        "374151", // Medium gray
        "111827", // Dark blue gray
        "1e1b4b", // Dark indigo
        "581c87", // Dark purple
        "7c2d12"  // Dark orange
      ],
    });
  }

  const dataUri = avatar.toDataUri();

  return (
    <Avatar className={cn("", className)} style={{ width: size, height: size }}>
      <AvatarImage src={dataUri} alt="User avatar" />
      <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
    </Avatar>
  );
};

export default DoodleAvatar;