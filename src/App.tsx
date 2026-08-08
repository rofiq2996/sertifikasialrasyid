/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppContext } from './lib/AppContext';
import { Login } from './components/Login';
import { MainLayout } from './components/MainLayout';
import { AdminValidasiSertifikat } from './views/AdminValidasiSertifikat';

const MainApp = () => {
  const { user } = useAppContext();
  const isVerifyPage = new URLSearchParams(window.location.search).has('verify');

  if (isVerifyPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden p-6 md:p-10 border border-gray-100 dark:border-gray-700">
          <AdminValidasiSertifikat />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 font-medium">Sistem Monitoring Hafalan Al-Qur'an &copy; 2026</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
