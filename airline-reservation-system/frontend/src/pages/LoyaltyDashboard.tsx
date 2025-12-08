import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoyaltyDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view loyalty dashboard');
      navigate('/login');
      return;
    }

    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membershipData, programData] = await Promise.all([
        apiService.getMyMemberships(),
        apiService.getLoyaltyPrograms()
      ]);

      setMemberships(membershipData);
      setPrograms(programData);

      if (membershipData.length > 0) {
        setSelectedMembership(membershipData[0]);
        loadTransactions(membershipData[0].id);
      }
    } catch (error: any) {
      console.error('Error loading loyalty data:', error);
      toast.error('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (membershipId: string) => {
    try {
      const txns = await apiService.getLoyaltyTransactions(membershipId, 20);
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleEnroll = async (programId: string) => {
    setEnrolling(true);
    try {
      await apiService.enrollInLoyaltyProgram(programId);
      toast.success('Successfully enrolled in loyalty program!');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const getTierBadgeColor = (tierName: string) => {
    const colors: Record<string, string> = {
      Blue: 'bg-blue-100 text-blue-700',
      Silver: 'bg-gray-200 text-gray-700',
      Gold: 'bg-yellow-100 text-yellow-700',
      Platinum: 'bg-purple-100 text-purple-700'
    };
    return colors[tierName] || 'bg-gray-100 text-gray-700';
  };

  const formatBenefits = (benefits: any) => {
    if (!benefits) return [];

    const benefitList = [];
    if (benefits.priority_boarding) benefitList.push('Priority Boarding');
    if (benefits.lounge_access) benefitList.push('Lounge Access');
    if (benefits.extra_baggage) benefitList.push(`+${benefits.extra_baggage} Baggage`);
    if (benefits.upgrades) benefitList.push('Complimentary Upgrades');

    return benefitList;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Loyalty Programs</h1>

        {/* My Memberships */}
        {memberships.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">My Memberships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberships.map((membership) => (
                <div
                  key={membership.id}
                  className={`card cursor-pointer transition-all ${
                    selectedMembership?.id === membership.id
                      ? 'border-2 border-primary-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedMembership(membership);
                    loadTransactions(membership.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{membership.program_name}</h3>
                      <p className="text-sm text-gray-600">{membership.airline_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(membership.tier_name)}`}>
                      {membership.tier_name}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Membership Number</p>
                    <p className="font-mono font-medium">{membership.membership_number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Points Balance</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {membership.points_balance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lifetime Points</p>
                      <p className="text-lg font-medium">
                        {membership.lifetime_points.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {formatBenefits(membership.benefits).map((benefit, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        {selectedMembership && transactions.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-sm">
                        {new Date(txn.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          txn.transaction_type === 'earn' ? 'bg-green-100 text-green-700' :
                          txn.transaction_type === 'redeem' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{txn.description}</td>
                      <td className={`py-3 px-4 text-sm font-medium text-right ${
                        txn.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {txn.transaction_type === 'earn' ? '+' : '-'}{Math.abs(txn.points)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Available Programs to Enroll */}
        {programs.filter(p => !memberships.find(m => m.program_id === p.id)).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Join a Loyalty Program</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs
                .filter(p => !memberships.find(m => m.program_id === p.id))
                .map((program) => (
                  <div key={program.id} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-bold mb-2">{program.program_name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{program.airline_name}</p>
                    <p className="text-sm mb-4">
                      Earn {program.points_per_mile} point per mile flown
                    </p>
                    <button
                      onClick={() => handleEnroll(program.id)}
                      disabled={enrolling}
                      className="btn-primary w-full"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {memberships.length === 0 && programs.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500">No loyalty programs available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
