import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable UserAvatar component
 * - Displays user profile photo as a clean, perfect circle everywhere.
 * - Handles loading, broken/invalid image URLs, size presets, and optional online indicator.
 * - WhatsApp-style large square DP preview on click/tap with dark backdrop, object-contain,
 *   keyboard Escape handling, outside-click closing, and background scroll locking.
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
  previewable = true,
  onClick,
}) => {
  const photoUrl = src || profilePhoto;
  const [imageError, setImageError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
  const initial =
    name && typeof name === 'string' && name.trim().length > 0
      ? name.trim()[0].toUpperCase()
      : 'U';

  const hasValidPhoto = Boolean(
    photoUrl &&
      typeof photoUrl === 'string' &&
      photoUrl.trim().length > 0 &&
      !imageError
  );

  // Lock background scroll and listen for Escape key when preview is open
  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isPreviewOpen]);

  const handleAvatarClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (hasValidPhoto && previewable) {
      e.preventDefault();
      e.stopPropagation();
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <div
        className={`relative inline-flex shrink-0 rounded-full overflow-hidden ${sizeClass} ${
          hasValidPhoto && previewable ? 'cursor-pointer hover:opacity-95' : ''
        } ${className}`}
        onClick={handleAvatarClick}
        title={hasValidPhoto && previewable ? `View ${name ? name + "'s" : ''} profile photo` : undefined}
      >
        {hasValidPhoto ? (
          <img
            src={photoUrl}
            alt={alt || (name ? `${name}'s profile avatar` : 'User profile avatar')}
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
            className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-900 pointer-events-none ${
              size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
            } ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        )}
      </div>

      {/* WhatsApp-Style DP Preview Modal */}
      {isPreviewOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
            onClick={() => setIsPreviewOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${name ? name + "'s" : 'User'} profile picture preview`}
          >
            <div
              className="relative max-w-lg w-full flex flex-col items-center justify-center animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with user name and close button */}
              <div className="w-full flex items-center justify-between py-2 px-1 text-white mb-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-extrabold text-sm md:text-base truncate">
                    {name || 'Profile Picture'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center text-base"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>

              {/* Large square preview area with centered photo, object-contain, aspect ratio preserved */}
              <div className="w-full aspect-square max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-2xl p-2">
                <img
                  src={photoUrl}
                  alt={alt || (name ? `${name}'s profile photo` : 'Profile photo preview')}
                  className="w-full h-full object-contain rounded-xl select-none"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default UserAvatar;
