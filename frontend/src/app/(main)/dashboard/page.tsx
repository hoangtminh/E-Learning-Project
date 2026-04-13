'use client';

import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect } from 'react';

export const Dashboard = () => {
  const { user, getUser } = useAuth();
  useEffect(() => {
    console.log(user);
  }, [user]);
  return <div>Dashboard</div>;
};

export default Dashboard;
