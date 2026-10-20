import React, { useState, useEffect } from 'react';

/**
 * Reusable UserAvatar component
 * Displays user profile photo if available, with robust fallback to first letter of name.
 * Handles loading, broken/invalid image URLs, size presets, and optional online indicator.
 */
export const UserAvatar = ({
  src,
  profilePhoto,
  name = '',
  size = 'md',
  className = '',
  showOnline = false,
  isOnline = false,
  alt,
}) => {
  const photoUrl = src || profilePhoto;
  const [imageError, setImageError] = useState(false);

  // Reset error state if image url changes
  useEffect(() => {
    setImageError(false);
  }, [photoUrl]);

  // Determine size classes
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl font-black',
    '2xl': 'w-20 h-20 text-2xl font-black',
    '3xl': 'w-28 h-28 text-4xl font-black',
  };

  const sizeClass = sizeMap[size] || size;

  // Fallback initial
  const initial = name && typeof name === 'string' && name.trim().length > 0
    ? name.trim()[0].toUpperCase()
    : 'U';

  const hasValidPhoto = Boolean(photoUrl && typeof photoUrl === 'string' && photoUrl.trim().length > 0 && !imageError);

  return (
    <div className={`relative inline-flex shrink-0 ${sizeClass} ${className}`}>
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={alt || (name ? `${name}'s avatar` : 'User profile avatar')}
          onError={() => setImageError(true)}
          className="w-full h-full rounded-full object-cover border border-slate-700/60 shadow-sm"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black flex items-center justify-center select-none shadow-sm"
          aria-label={alt || (name ? `${name}'s avatar` : 'User avatar')}
        >
          {initial}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-900 ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
            } ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default UserAvatar;
