import React from 'react';

const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-4">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <p className="text-gray-600">Profile settings coming soon...</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <p className="text-gray-600">Notification preferences coming soon...</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Privacy</h2>
          <p className="text-gray-600">Privacy settings coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
