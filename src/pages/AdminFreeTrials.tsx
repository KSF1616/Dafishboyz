import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Mail, RefreshCw, Play, Users, AlertTriangle, 
  CheckCircle, XCircle, Calendar, Search, Filter, LogOut, Zap,
  Timer, Send, BarChart3, List, History, Plus, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FreeTrial, ReminderLog, ProcessRemindersResult } from '@/types/freeTrial';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AdminFreeTrials: React.FC = () => {
  const [trials, setTrials] = useState<FreeTrial[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessResult, setLastProcessResult] = useState<ProcessRemindersResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState<FreeTrial | null>(null);
  const [newTrialEmail, setNewTrialEmail] = useState('');
  const [extendDays, setExtendDays] = useState(7);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user, signOut, isDemo } = useAuth();

  const fetchTrials = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('free-trial-manager?action=list-trials', {
        body: { status: filterStatus === 'all' ? 'all' : filterStatus }
      });
      if (data?.success) {
        setTrials(data.trials || []);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsLoading(false);
  }, [filterStatus, toast]);

  const fetchReminderLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('free-trial-manager?action=get-reminder-logs', {
        body: { limit: 100 }
      });
      if (data?.success) {
        setReminderLogs(data.logs || []);
      }
    } catch (err: any) {
      console.error('Error fetching logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrials();
    fetchReminderLogs();
  }, [fetchTrials, fetchReminderLogs]);

  const handleProcessReminders = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('free-trial-manager?action=process-reminders', {
        body: {}
      });
      if (data?.success) {
        setLastProcessResult(data);
        toast({ 
          title: 'Reminders Processed', 
          description: `Processed ${data.processed} reminders successfully` 
        });
        fetchTrials();
        fetchReminderLogs();
      } else {
        throw new Error(data?.error || 'Failed to process reminders');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsProcessing(false);
  };

  const handleCreateTrial = async () => {
    if (!newTrialEmail) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('free-trial-manager?action=create', {
        body: { email: newTrialEmail }
      });
      if (data?.success) {
        toast({ title: 'Trial Created', description: `30-day trial created for ${newTrialEmail}` });
        setShowCreateModal(false);
        setNewTrialEmail('');
        fetchTrials();
        fetchReminderLogs();
      } else {
        throw new Error(data?.error || 'Failed to create trial');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsCreating(false);
  };

  const handleExtendTrial = async () => {
    if (!showExtendModal) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('free-trial-manager?action=extend', {
        body: { email: showExtendModal.email, days: extendDays }
      });
      if (data?.success) {
        toast({ title: 'Trial Extended', description: `Extended by ${extendDays} days` });
        setShowExtendModal(null);
        fetchTrials();
      } else {
        throw new Error(data?.error || 'Failed to extend trial');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsCreating(false);
  };

  const handleSendManualReminder = async (trial: FreeTrial, reminderType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('free-trial-manager?action=send-reminder', {
        body: { trial_id: trial.id, reminder_type: reminderType }
      });
      if (data?.success) {
        toast({ title: 'Reminder Sent', description: `${reminderType} reminder sent to ${trial.email}` });
        fetchReminderLogs();
      } else {
        throw new Error(data?.error || 'Failed to send reminder');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Filter trials
  const filteredTrials = trials.filter(trial => {
    const matchesSearch = trial.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: trials.length,
    active: trials.filter(t => t.is_active && (t.daysRemaining || 0) > 0).length,
    expired: trials.filter(t => !t.is_active || (t.daysRemaining || 0) <= 0).length,
    expiringIn7Days: trials.filter(t => t.is_active && (t.daysRemaining || 0) <= 7 && (t.daysRemaining || 0) > 0).length,
    expiringIn3Days: trials.filter(t => t.is_active && (t.daysRemaining || 0) <= 3 && (t.daysRemaining || 0) > 0).length,
    expiringIn1Day: trials.filter(t => t.is_active && (t.daysRemaining || 0) <= 1 && (t.daysRemaining || 0) > 0).length,
  };

  const getStatusBadge = (trial: FreeTrial) => {
    const days = trial.daysRemaining || 0;
    if (!trial.is_active || days <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (days <= 1) {
      return <Badge className="bg-red-500">Expires Today</Badge>;
    }
    if (days <= 3) {
      return <Badge className="bg-orange-500">Expires in {days} days</Badge>;
    }
    if (days <= 7) {
      return <Badge className="bg-yellow-500 text-black">Expires in {days} days</Badge>;
    }
    return <Badge className="bg-green-500">{days} days left</Badge>;
  };

  const getReminderBadge = (type: string, success: boolean) => {
    const colors: Record<string, string> = {
      welcome: 'bg-blue-500',
      '7_days': 'bg-yellow-500 text-black',
      '3_days': 'bg-orange-500',
      '1_day': 'bg-red-500',
      expired: 'bg-gray-500',
    };
    return (
      <Badge className={`${colors[type] || 'bg-purple-500'} ${!success ? 'opacity-50' : ''}`}>
        {type.replace('_', ' ')}
        {!success && ' (failed)'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Some operations may be limited in demo mode.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Timer className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Free Trial Manager</h1>
              <p className="text-gray-500">Manage trials and automated email reminders</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchTrials(); fetchReminderLogs(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Button 
              onClick={handleProcessReminders} 
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Process Reminders
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />New Trial
            </Button>
          </div>
        </div>

        {/* Last Process Result */}
        {lastProcessResult && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Last Reminder Processing
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Processed:</span>
                <span className="ml-2 font-semibold">{lastProcessResult.processed}</span>
              </div>
              <div>
                <span className="text-gray-500">7-Day:</span>
                <span className="ml-2 font-semibold text-yellow-600">{lastProcessResult.reminders_7_days}</span>
              </div>
              <div>
                <span className="text-gray-500">3-Day:</span>
                <span className="ml-2 font-semibold text-orange-600">{lastProcessResult.reminders_3_days}</span>
              </div>
              <div>
                <span className="text-gray-500">1-Day:</span>
                <span className="ml-2 font-semibold text-red-600">{lastProcessResult.reminders_1_day}</span>
              </div>
              <div>
                <span className="text-gray-500">Expired:</span>
                <span className="ml-2 font-semibold text-gray-600">{lastProcessResult.reminders_expired}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Processed at: {new Date(lastProcessResult.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total Trials</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                  <p className="text-xs text-gray-500">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.expiringIn7Days}</p>
                  <p className="text-xs text-gray-500">Expiring 7d</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.expiringIn3Days}</p>
                  <p className="text-xs text-gray-500">Expiring 3d</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.expiringIn1Day}</p>
                  <p className="text-xs text-gray-500">Expiring 1d</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cron Job Setup Info */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Automated Daily Reminders Setup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            To enable automated daily email reminders, set up a cron job that calls the following endpoint once per day (recommended: 9 AM):
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <p className="text-gray-500 mb-2"># Using curl (for cron-job.org, EasyCron, etc.):</p>
            <p>GET https://api.databasepad.com/functions/v1/free-trial-manager?action=process-reminders&secret=shitgames-cron-2024-secure</p>
            <p className="text-gray-500 mt-4 mb-2"># Or with POST request:</p>
            <p>POST https://api.databasepad.com/functions/v1/free-trial-manager?action=process-reminders</p>
            <p>Headers: x-cron-secret: shitgames-cron-2024-secure</p>
            <p>Body: {'{}'}</p>
          </div>
          <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-semibold text-yellow-600">7 Days Before</p>
              <p className="text-gray-500">Friendly reminder with 25% off code</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-semibold text-orange-600">3 Days Before</p>
              <p className="text-gray-500">Urgent reminder with discount offer</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-semibold text-red-600">1 Day Before</p>
              <p className="text-gray-500">Final day warning - last chance</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trials" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="trials" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <List className="w-4 h-4" />
              Trials ({filteredTrials.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <History className="w-4 h-4" />
              Reminder Logs ({reminderLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* Trials Tab */}
          <TabsContent value="trials" className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trials List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                  <p className="mt-2 text-gray-500">Loading trials...</p>
                </div>
              ) : filteredTrials.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trials found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reminders Sent</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTrials.map((trial) => (
                        <tr key={trial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{trial.email}</div>
                            {trial.promo_code && (
                              <div className="text-xs text-gray-500">Code: {trial.promo_code}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(trial)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(trial.trial_start_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(trial.trial_end_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {trial.reminder_sent_7_days && <Badge variant="outline" className="text-xs">7d</Badge>}
                              {trial.reminder_sent_3_days && <Badge variant="outline" className="text-xs">3d</Badge>}
                              {trial.reminder_sent_1_day && <Badge variant="outline" className="text-xs">1d</Badge>}
                              {trial.reminder_sent_expired && <Badge variant="outline" className="text-xs">Exp</Badge>}
                              {!trial.reminder_sent_7_days && !trial.reminder_sent_3_days && !trial.reminder_sent_1_day && !trial.reminder_sent_expired && (
                                <span className="text-xs text-gray-400">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowExtendModal(trial)}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Extend
                              </Button>
                              <Select onValueChange={(type) => handleSendManualReminder(trial, type)}>
                                <SelectTrigger className="w-28 h-8">
                                  <Send className="w-3 h-3 mr-1" />
                                  <span className="text-xs">Send</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="7_days">7-Day Reminder</SelectItem>
                                  <SelectItem value="3_days">3-Day Reminder</SelectItem>
                                  <SelectItem value="1_day">1-Day Reminder</SelectItem>
                                  <SelectItem value="expired">Expired Notice</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {reminderLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No reminder logs yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sent At</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reminderLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm">
                            {new Date(log.sent_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {log.email}
                          </td>
                          <td className="px-4 py-3">
                            {getReminderBadge(log.reminder_type, log.success)}
                          </td>
                          <td className="px-4 py-3">
                            {log.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-500">
                            {log.error_message || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Trial Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Trial</DialogTitle>
            <DialogDescription>
              Create a new 30-day free trial for a customer. A welcome email will be sent automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Customer Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={newTrialEmail}
                onChange={(e) => setNewTrialEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTrial} disabled={isCreating || !newTrialEmail}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Trial Modal */}
      <Dialog open={!!showExtendModal} onOpenChange={() => setShowExtendModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              Extend the trial for {showExtendModal?.email}. This will reset the reminder flags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="days">Extend by (days)</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={365}
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 7)}
                className="mt-1"
              />
            </div>
            {showExtendModal && (
              <div className="text-sm text-gray-500">
                Current end date: {new Date(showExtendModal.trial_end_date).toLocaleDateString()}
                <br />
                New end date: {new Date(new Date(showExtendModal.trial_end_date).getTime() + extendDays * 86400000).toLocaleDateString()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleExtendTrial} disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFreeTrials;
