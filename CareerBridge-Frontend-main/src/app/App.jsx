import React from 'react';
import { useAuthContext } from '../stores';
import { Layout } from '../components/layout';
import { AppRoutes } from '../routes';

export function App() {
  const { user, setUser } = useAuthContext();

  return (
    <Layout user={user} setUser={setUser}>
      <AppRoutes user={user} setUser={setUser} />
    </Layout>
  );
}

export default App;
