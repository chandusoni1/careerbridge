import React, { useState, useEffect } from 'react';
import { connectionsApi } from '../../../services/connections.api';
import { LoadingSpinner, EmptyState } from '../../../components/feedback';

export const Network = ({ user }) => {
  const [activeTab, setActiveTab] = useState('connections');
  const [data, setData] = useState({
    connections: [],
    receivedRequests: [],
    sentRequests: [],
    suggestions: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState('');

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const res = await connectionsApi.getSummary();
      if (res) {
        setData({
          connections: res.connections || [],
          receivedRequests: res.receivedRequests || [],
          sentRequests: res.sentRequests || [],
          suggestions: res.suggestions || [],
        });
      }
    } catch (err) {
      console.error('Failed to load connections summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await connectionsApi.sendRequest(receiverId);
      showFeedback('Connection request sent! 🚀');
      loadNetworkData();
    } catch (err) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await connectionsApi.acceptRequest(senderId);
      showFeedback('Connection accepted! 🎉');
      loadNetworkData();
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleReject = async (senderId) => {
    try {
      await connectionsApi.rejectRequest(senderId);
      showFeedback('Request rejected.');
      loadNetworkData();
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (targetId) => {
    try {
      await connectionsApi.cancelRequest(targetId);
      showFeedback('Request cancelled.');
      loadNetworkData();
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const handleRemove = async (targetId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    try {
      await connectionsApi.removeConnection(targetId);
      showFeedback('Connection removed.');
      loadNetworkData();
    } catch (err) {
      alert(err.message || 'Failed to remove connection');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">My Professional Network 👥</h1>
          <p className="text-xs font-semibold text-slate-400">
            Connect, collaborate, and exchange referrals with peers & alumni
          </p>
        </div>

        {actionFeedback && (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl animate-fade-in">
            {actionFeedback}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-extrabold">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'connections'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          My Connections ({data.connections.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'received'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Received Requests ({data.receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'sent'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Sent Requests ({data.sentRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'suggestions'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Suggested ({data.suggestions.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching connection data..." />
      ) : (
        <div>
          {/* Tab 1: My Connections */}
          {activeTab === 'connections' && (
            <div>
              {data.connections.length === 0 ? (
                <EmptyState
                  title="No connections yet"
                  description="Explore suggested peers or browse the directory to build your network!"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.connections.map((u) => (
                    <div
                      key={u._id}
                      className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-lg shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold text-white text-sm truncate">
                            {u.name}
                          </h4>
                          <p className="text-xs text-cyan-400 font-semibold truncate">
                            {u.headline || `${u.role} • ${u.company || u.branch || 'Member'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <a
                          href={`/messages?userId=${u._id}`}
                          className="flex-1 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl text-center hover:bg-cyan-400"
                        >
                          Message 💬
                        </a>
                        <button
                          onClick={() => handleRemove(u._id)}
                          className="px-3 py-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs font-bold rounded-xl"
                          title="Remove Connection"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Received Requests */}
          {activeTab === 'received' && (
            <div>
              {data.receivedRequests.length === 0 ? (
                <EmptyState
                  title="No pending requests"
                  description="You have no incoming connection requests right now."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.receivedRequests.map((u) => (
                    <div
                      key={u._id}
                      className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 font-black flex items-center justify-center text-white shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold text-white text-sm truncate">
                            {u.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {u.headline || `${u.role} • ${u.company || u.branch || 'Member'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(u._id)}
                          className="flex-1 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-cyan-400"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Sent Requests */}
          {activeTab === 'sent' && (
            <div>
              {data.sentRequests.length === 0 ? (
                <EmptyState
                  title="No sent requests"
                  description="You have no pending outgoing connection requests."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.sentRequests.map((u) => (
                    <div
                      key={u._id}
                      className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 font-black flex items-center justify-center text-white shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold text-white text-sm truncate">
                            {u.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {u.headline || `${u.role} • ${u.company || u.branch || 'Member'}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancel(u._id)}
                        className="w-full py-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Cancel Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Suggested Connections */}
          {activeTab === 'suggestions' && (
            <div>
              {data.suggestions.length === 0 ? (
                <EmptyState
                  title="No suggestions"
                  description="Check back later for newly registered members."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.suggestions.map((u) => (
                    <div
                      key={u._id}
                      className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-lg shrink-0">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold text-white text-sm truncate">
                            {u.name}
                          </h4>
                          <p className="text-xs text-cyan-400 font-semibold truncate">
                            {u.headline || `${u.role} • ${u.company || u.branch || 'Member'}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendRequest(u._id)}
                        className="w-full py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-xs font-black rounded-xl transition"
                      >
                        + Connect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Network;
