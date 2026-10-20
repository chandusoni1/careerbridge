import React from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from '../../../components/common/UserAvatar';

export const AlumniCard = ({
  user,
  currentUser,
  connectionStatus = 'none', // 'connected' | 'pending' | 'received' | 'none' | 'self'
  onConnect,
  onCancelRequest,
  onAcceptRequest,
  onMessage,
  isActionLoading = false,
}) => {
  const isSelf = (currentUser?._id || currentUser?.id) === (user?._id || user?.id);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition group">
      <div className="text-center space-y-3">
        {/* Avatar with clickable profile link */}
        <Link to={`/profile/${user?._id}`} className="inline-block relative">
          <UserAvatar
            src={user?.profilePhoto}
            name={user?.name}
            size="xl"
            className="mx-auto border-2 border-slate-800 group-hover:border-cyan-500/50 transition"
          />
        </Link>

        <div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <Link
              to={`/profile/${user?._id}`}
              className="text-base font-extrabold text-white hover:text-cyan-400 transition"
            >
              {user?.name}
            </Link>
            {user?.verificationStatus === 'verified' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold" title="Verified Institutional Member">
                ✓
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              {user?.role || 'Member'}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
              {user?.college || 'CSIT'} • {user?.branch || 'CSE'}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium mt-2 line-clamp-2 leading-relaxed">
            {user?.headline || (
              user?.role === 'alumni' && user?.company
                ? `${user?.jobRole || 'Engineer'} at ${user?.company}`
                : user?.academicYear || 'Student at CSIT/CSIP'
            )}
          </p>

          {user?.company && (
            <p className="text-[11px] text-cyan-400 font-bold mt-1">
              💼 {user.company} {user.companyLocation ? `(${user.companyLocation})` : ''}
            </p>
          )}

          {user?.location && (
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              📍 {user.location}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons: Connect & Direct Message */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
        {isSelf ? (
          <span className="w-full py-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl text-center">
            You (Your Profile)
          </span>
        ) : (
          <>
            {/* Connect Action Button */}
            {connectionStatus === 'connected' ? (
              <button
                type="button"
                disabled
                className="flex-1 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-default"
              >
                <span>✓</span>
                <span>Connected</span>
              </button>
            ) : connectionStatus === 'pending' ? (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => onCancelRequest && onCancelRequest(user)}
                className="flex-1 py-2 bg-amber-500/15 hover:bg-rose-500/20 text-amber-300 hover:text-rose-300 border border-amber-500/30 hover:border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                title="Pending request. Click to cancel."
              >
                <span>⏳</span>
                <span>Requested</span>
              </button>
            ) : connectionStatus === 'received' ? (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => onAcceptRequest && onAcceptRequest(user)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>✓</span>
                <span>Accept</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => onConnect && onConnect(user)}
                className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl transition shadow-sm shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>+</span>
                <span>Connect</span>
              </button>
            )}

            {/* Direct Message Action Button */}
            <button
              type="button"
              onClick={() => onMessage && onMessage(user)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={`Send a direct message to ${user?.name}`}
            >
              <span>💬</span>
              <span>Message</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AlumniCard;
