import React, { useEffect, useState } from 'react';
import { loyaltyAPI } from '../services/api';
import toast from 'react-hot-toast';

const Loyalty = () => {
  const [cards, setCards] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data } = await loyaltyAPI.getCards();
        setCards(data.cards);
        setSummary(data.summary);
      } catch (error) {
        toast.error('Failed to load loyalty cards');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Loyalty Programs</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-600">Total Cards</h3>
          <p className="text-2xl font-bold">{summary.totalCards || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600">Total Value</h3>
          <p className="text-2xl font-bold">AED {summary.totalValue || '0.00'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <h3 className="font-bold text-lg mb-2">{card.loyaltyProgram.name}</h3>
            <p className="text-2xl font-bold text-accent-600 mb-2">
              {parseFloat(card.currentPoints).toFixed(0)} pts
            </p>
            <p className="text-sm text-gray-600">
              ≈ AED {parseFloat(card.currentBalanceAed).toFixed(2)}
            </p>
            {card.memberTier && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-accent-100 text-accent-800 rounded">
                {card.memberTier}
              </span>
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600">No loyalty cards yet. Add your first card to start tracking rewards!</p>
          <button className="btn-primary mt-4">+ Add Loyalty Card</button>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
