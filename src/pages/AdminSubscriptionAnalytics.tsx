import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, DollarSign, 
  RefreshCw, Loader2, CreditCard, UserMinus, UserPlus, Calendar,
  Activity, PieChart, ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  XCircle, AlertTriangle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    cancelingSubscriptions: number;
    mrr: number;
    arr: number;
    arpu: number;
    ltv: number;
    churnRate: number;
    growthRate: number;
    newLast30Days: number;
    monthlySubscribers: number;
    annualSubscribers: number;
  };
  planDistribution: Array<{ name: string; value: number; color: string }>;
  mrrTrend: Array<{ month: string; mrr: number }>;
  growthTrend: Array<{ month: string; new: number; canceled: number; net: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    email: string;
    plan: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

const AdminSubscriptionAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('subscription-manager', {
        body: { action: 'get-analytics' }
      });

      if (fetchError) throw fetchError;
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCurrencyDetailed = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'subscription_created':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'subscription_canceled':
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'payment_success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'payment_failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'subscription_created':
        return 'New Subscription';
      case 'subscription_canceled':
        return 'Canceled';
      case 'payment_success':
        return 'Payment Received';
      case 'payment_failed':
        return 'Payment Failed';
      default:
        return type;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary;
  const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/subscriptions" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Subscriptions
            </Link>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Subscription Analytics</h1>
            <p className="text-gray-400">Real-time insights into your subscription business</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* MRR */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${(summary?.growthRate || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(summary?.growthRate || 0) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(summary?.growthRate || 0)}%
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(summary?.mrr || 0)}</p>
            <p className="text-sm text-purple-300">Monthly Recurring Revenue</p>
          </div>

          {/* Active Subscribers */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <UserPlus className="w-4 h-4" />
                +{summary?.newLast30Days || 0}
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{summary?.activeSubscriptions || 0}</p>
            <p className="text-sm text-green-300">Active Subscribers</p>
          </div>

          {/* Churn Rate */}
          <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-500/30 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex items-center gap-1 text-sm text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                {summary?.cancelingSubscriptions || 0} pending
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{summary?.churnRate || 0}%</p>
            <p className="text-sm text-red-300">Monthly Churn Rate</p>
          </div>

          {/* ARPU */}
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex items-center gap-1 text-sm text-amber-400">
                <TrendingUp className="w-4 h-4" />
                LTV: {formatCurrency(summary?.ltv || 0)}
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrencyDetailed(summary?.arpu || 0)}</p>
            <p className="text-sm text-amber-300">Avg Revenue Per User</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">ARR</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(summary?.arr || 0)}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Subscriptions</p>
            <p className="text-2xl font-bold text-white">{summary?.totalSubscriptions || 0}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Monthly Plans</p>
            <p className="text-2xl font-bold text-purple-400">{summary?.monthlySubscribers || 0}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Annual Plans</p>
            <p className="text-2xl font-bold text-amber-400">{summary?.annualSubscribers || 0}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* MRR Trend Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              MRR Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.mrrTrend || []}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value: number) => [formatCurrencyDetailed(value), 'MRR']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    fill="url(#mrrGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              Plan Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              {(analytics?.planDistribution || []).some(p => p.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={analytics?.planDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(analytics?.planDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No subscription data yet</p>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-300">Monthly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-300">Annual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Subscription Growth
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.growthTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="new" name="New" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="canceled" name="Canceled" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(analytics?.recentActivity || []).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              (analytics?.recentActivity || []).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">{activity.email}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.type.includes('created') || activity.type.includes('success')
                          ? 'bg-green-500/20 text-green-400'
                          : activity.type.includes('canceled') || activity.type.includes('failed')
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getActivityLabel(activity.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{activity.plan}</span>
                      {activity.amount > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatCurrencyDetailed(activity.amount / 100)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(activity.date)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/admin/subscriptions">
            <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscriptions
            </Button>
          </Link>
          <Link to="/admin/promo-codes">
            <Button variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Promo Codes
            </Button>
          </Link>
          <Link to="/admin/free-trials">
            <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/20">
              <Calendar className="w-4 h-4 mr-2" />
              Free Trials
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionAnalytics;
