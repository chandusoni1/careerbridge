import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { directoryApi } from '../directory.api';
import { connectionsApi } from '../../../services/connections.api';
import { useAuthContext } from '../../../stores';
import { AlumniCard } from '../components/AlumniCard';
import { DirectoryFilter } from '../components/DirectoryFilter';
import { LoadingSpinner, EmptyState } from '../../../components/feedback';

export const AlumniDirectory = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthContext();

  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [actionFeedback, setActionFeedback] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Connection IDs state
  const [connectionIds, setConnectionIds] = useState({
    connected: new Set(),
    sent: new Set(),
    received: new Set(),
  });

  const loadDirectoryData = async () => {
    try {
      setLoading(true);
      const [usersRes, summaryRes] = await Promise.all([
        directoryApi.getUsers().catch(() => []),
        connectionsApi.getSummary().catch(() => ({
          connections: [],
          sentRequests: [],
          receivedRequests: [],
        })),
      ]);

      if (Array.isArray(usersRes)) {
        setDbUsers(usersRes);
      }

      if (summaryRes) {
        const connectedSet = new Set(
          (summaryRes.connections || []).map((c) => (c._id || c).toString())
        );
        const sentSet = new Set(
          (summaryRes.sentRequests || []).map((s) => (s._id || s).toString())
        );
        const receivedSet = new Set(
          (summaryRes.receivedRequests || []).map((r) => (r._id || r).toString())
        );

        setConnectionIds({
          connected: connectedSet,
          sent: sentSet,
          received: receivedSet,
        });
      }
    } catch (err) {
      console.error('Database Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectoryData();
  }, []);

  const showToast = (message) => {
    setActionFeedback(message);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleConnect = async (targetUser) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const targetId = targetUser?._id?.toString();
    if (!targetId) return;

    setActionLoadingId(targetId);
    try {
      await connectionsApi.sendRequest(targetId);
      setConnectionIds((prev) => ({
        ...prev,
        sent: new Set([...prev.sent, targetId]),
      }));
      showToast(`Connection request sent to ${targetUser.name}! 🚀`);
    } catch (err) {
      alert(err.message || 'Failed to send connection request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelRequest = async (targetUser) => {
    const targetId = targetUser?._id?.toString();
    if (!targetId) return;

    setActionLoadingId(targetId);
    try {
      await connectionsApi.cancelRequest(targetId);
      setConnectionIds((prev) => {
        const updatedSent = new Set(prev.sent);
        updatedSent.delete(targetId);
        return { ...prev, sent: updatedSent };
      });
      showToast(`Cancelled request to ${targetUser.name}.`);
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (targetUser) => {
    const targetId = targetUser?._id?.toString();
    if (!targetId) return;

    setActionLoadingId(targetId);
    try {
      await connectionsApi.acceptRequest(targetId);
      setConnectionIds((prev) => {
        const updatedReceived = new Set(prev.received);
        updatedReceived.delete(targetId);
        return {
          ...prev,
          received: updatedReceived,
          connected: new Set([...prev.connected, targetId]),
        };
      });
      showToast(`Connected with ${targetUser.name}! 🎉`);
    } catch (err) {
      alert(err.message || 'Failed to accept connection');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMessage = (targetUser) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const targetId = targetUser?._id?.toString();
    if (!targetId) return;
    navigate(`/messages?userId=${targetId}`);
  };

  const filteredUsers = dbUsers.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.company || '').toLowerCase().includes(query) ||
      (u.headline || '').toLowerCase().includes(query) ||
      (Array.isArray(u.skills) && u.skills.some((s) => s.toLowerCase().includes(query)));

    const matchesBranch = selectedBranch === 'All' || u.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs shadow-2xl shadow-cyan-500/30 flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <span>👥</span> Institutional Member Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect and directly message verified students, alumni, and campus mentors
          </p>
        </div>

        <span className="text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3.5 py-1.5 rounded-full">
          {filteredUsers.length} Members Found
        </span>
      </div>

      {/* Filters */}
      <DirectoryFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
      />

      {/* Users Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching directory users..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          message="No matching members found!"
          description="Try clearing or changing your search filters to find alumni or students."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredUsers.map((u) => {
            const uid = u._id?.toString();
            let status = 'none';
            if ((currentUser?._id || currentUser?.id)?.toString() === uid) {
              status = 'self';
            } else if (connectionIds.connected.has(uid)) {
              status = 'connected';
            } else if (connectionIds.sent.has(uid)) {
              status = 'pending';
            } else if (connectionIds.received.has(uid)) {
              status = 'received';
            }

            return (
              <AlumniCard
                key={u._id}
                user={u}
                currentUser={currentUser}
                connectionStatus={status}
                isActionLoading={actionLoadingId === uid}
                onConnect={handleConnect}
                onCancelRequest={handleCancelRequest}
                onAcceptRequest={handleAcceptRequest}
                onMessage={handleMessage}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;
