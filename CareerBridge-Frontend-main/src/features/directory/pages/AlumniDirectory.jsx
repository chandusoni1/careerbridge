import React, { useState, useEffect } from 'react';
import { directoryApi } from '../directory.api';
import { AlumniCard } from '../components/AlumniCard';
import { DirectoryFilter } from '../components/DirectoryFilter';
import { LoadingSpinner, EmptyState } from '../../../components/feedback';

export const AlumniDirectory = () => {
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  useEffect(() => {
    let isMounted = true;
    directoryApi
      .getUsers()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDbUsers(data);
        }
      })
      .catch((err) => console.error('Database Fetch Error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = dbUsers.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || u.branch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-white">Alumni Directory 👥</h1>
        <span className="text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-full">
          Total Registered Users: {filteredUsers.length}
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
          message="No matching users found!"
          description="Try clearing or changing your search filters to find alumni or students."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <AlumniCard key={u._id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;
