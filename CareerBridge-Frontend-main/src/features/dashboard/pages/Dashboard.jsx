import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../services/apiClient';
import { storage } from '../../../utils';
import { UserTable } from '../components/UserTable';
import { LoadingSpinner } from '../../../components/feedback';

export const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/auth/users')
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((error) => {
        console.error('Data fetch error: ', error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    storage.clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Alumni Network Dashboard 🎓</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition cursor-pointer text-sm"
          >
            Logout
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6 border border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-4">Registered Users List</h2>
          {loading ? (
            <LoadingSpinner text="Loading users..." />
          ) : (
            <UserTable users={users} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
