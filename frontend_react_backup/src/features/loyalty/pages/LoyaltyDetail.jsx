import React from 'react';
import { useParams } from 'react-router-dom';

const LoyaltyDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Loyalty Card Details</h1>
      <div className="card">
        <p>Card ID: {id}</p>
        <p className="text-gray-600">Detailed view coming soon...</p>
      </div>
    </div>
  );
};

export default LoyaltyDetail;
