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
      backgroundColor: ["b6e3f4","c0aede","d1d4f9","ffd803"],
      backgroundType: ["gradientLinear", "solid"],
    });
  } else if (avatarStyle === funEmoji) {
    avatar = createAvatar(funEmoji, {
      seed,
      size,
      backgroundColor: ["ffdfbf","c0aede","d1d4f9","b6e3f4"],
    });
  } else {
    avatar = createAvatar(bottts, {
      seed,
      size,
      backgroundColor: ["b6e3f4","c0aede","d1d4f9"],
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