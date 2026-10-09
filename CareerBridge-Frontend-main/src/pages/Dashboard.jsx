import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apibase } from '../config';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apibase}/auth/users`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Data fetch error: ", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Alumni Network Dashboard 🎓</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition cursor-pointer">Logout</button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Registered Users List</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                  <th className="py-3 px-4 border-b">Naam</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Role</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 border-b">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'alumni' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
