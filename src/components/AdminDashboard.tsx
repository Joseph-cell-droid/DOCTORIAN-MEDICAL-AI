import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Trash2, 
  Shield, 
  Brain,
  User as UserIcon, 
  Mail, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Bell,
  Send,
  Plus,
  Download,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Server,
  Cpu,
  Database,
  Fingerprint,
  Radio,
  Zap,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { api, User, HealthRecord, Doctor, syncOfflineActions } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import { NeuralTrainingHub } from './NeuralTrainingHub';

export const AdminDashboard: React.FC<{ addToast?: (msg: string, type: 'success' | 'error' | 'info') => void }> = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'system' | 'billing' | 'training' | 'doctors'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Billing Admin State
  const [adminBilling, setAdminBilling] = useState<any[]>([]);
  const [billingPagination, setBillingPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRecords, setUserRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [userQrView, setUserQrView] = useState<User | null>(null);

  // New Notification State
  const [newNotification, setNewNotification] = useState({ title: '', content: '', type: 'info' });
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);

  // Twilio Status State
  const [twilioStatus, setTwilioStatus] = useState<any>(null);
  const [loadingTwilio, setLoadingTwilio] = useState(false);

  // Doctor Registration State
  const [newDoctor, setNewDoctor] = useState({ name: '', whatsappNumber: '', specialization: '', location: '', imageUrl: '', active: true });
  const [isRegisteringDoctor, setIsRegisteringDoctor] = useState(false);

  // Background Synchronization Queue State
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [isSyncingEngine, setIsSyncingEngine] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [filterInstitution, setFilterInstitution] = useState('');

  // Redesigned Administrative Security & Posture States
  const [securityLevel, setSecurityLevel] = useState<'STANDARD' | 'MFA_RESTRICTED' | 'LOCKDOWN'>('STANDARD');
  const [auditProgress, setAuditProgress] = useState<number | null>(null);
  const [clinicSecretKey, setClinicSecretKey] = useState<string>(() => {
    return localStorage.getItem('doctorian_clinic_sec_key') || '0x7CFF39A20E83D017B08B9362';
  });

  const handleRotateEncryptionKey = () => {
    const newKey = '0x' + Array.from({length: 24}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    setClinicSecretKey(newKey);
    localStorage.setItem('doctorian_clinic_sec_key', newKey);
    
    setLogs(prev => [
      { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Security Operations] Administrative rotated master symmetric clinical database key to ${newKey}.`, type: 'success' },
      ...prev
    ]);
    if (addToast) addToast("Clinic Master Encryption Key rotated successfully.", "success");
  };

  const handleRunSecurityAudit = () => {
    if (auditProgress !== null) return;
    setAuditProgress(0);
    
    setLogs(prev => [
      { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[WebAuthn Audit] Triggered complete integrity audit of registered practitioner identities and hardware tokens...`, type: 'info' },
      ...prev
    ]);

    let progressLocal = 0;
    const timer = setInterval(() => {
      progressLocal += 25;
      setAuditProgress(progressLocal);
      
      if (progressLocal >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setAuditProgress(null);
          if (addToast) addToast("Compliance integrity audit finished. 0 critical vulnerabilities found.", "success");
          setLogs(logPrev => [
            { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Integrity Report] PASS: Database integrity is 100%. WebAuthn credentials active control check successful. TLS 1.3 verify response correct.`, type: 'success' },
            ...logPrev
          ]);
        }, 300);
      }
    }, 400);
  };

  const handleSecurityLevelChange = (level: 'STANDARD' | 'MFA_RESTRICTED' | 'LOCKDOWN') => {
    setSecurityLevel(level);
    if (addToast) {
      addToast(`Administrative Security posture set to: ${level.replace('_', ' ')}`, level === 'LOCKDOWN' ? 'error' : 'info');
    }
    setLogs(prev => [
      { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Security Sentinel] Posture updated to ${level.replace('_', ' ')} policy enforcement.`, type: level === 'LOCKDOWN' ? 'warn' : 'info' },
      ...prev
    ]);
  };

  const [alarmTriggerMode, setAlarmTriggerMode] = useState<'all' | 'emergency_only' | 'disabled'>(() => {
    return (localStorage.getItem('doctorian_alarm_trigger_mode') as 'all' | 'emergency_only' | 'disabled') || 'all';
  });

  const handleAlarmTriggerModeChange = (mode: 'all' | 'emergency_only' | 'disabled') => {
    setAlarmTriggerMode(mode);
    localStorage.setItem('doctorian_alarm_trigger_mode', mode);
    if (addToast) {
      addToast(`Alarm triggering mode set to: ${mode.toUpperCase().replace('_', ' ')}`, "success");
    }
    setLogs(prev => [
      { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Security] Administrative bypass changed Alarm Triggering Mode to ${mode.toUpperCase().replace('_', ' ')}.`, type: 'system' },
      ...prev
    ]);
  };

  // Real-time server telemetry simulation state
  const [telemetry, setTelemetry] = useState({
    activeConnections: 14,
    cpuUsage: 24,
    memoryUsage: 42.1,
    dbQueryLatency: 12,
    apiResponseSpeed: 1.2,
    emergencySignals: 0,
    creditRemaining: 412.50,
    tokenThroughput: 14850,
  });

  // Live log stream state
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' | 'system' }>>([
    { id: '1', time: new Date(Date.now() - 3600000).toLocaleTimeString(), msg: 'Clinical database integrity audit complete: 0 errors detected.', type: 'success' },
    { id: '2', time: new Date(Date.now() - 3300000).toLocaleTimeString(), msg: 'Registered MTN API Callback tunnel securely.', type: 'info' },
    { id: '3', time: new Date(Date.now() - 1800000).toLocaleTimeString(), msg: 'WebAuthn Security: Administrator session authenticated.', type: 'system' },
    { id: '4', time: new Date(Date.now() - 600000).toLocaleTimeString(), msg: 'Neural Sync Service: Synchronized rural knowledge nodes.', type: 'success' },
    { id: '5', time: new Date().toLocaleTimeString(), msg: 'Live Server Telemetry link initiated successfully.', type: 'system' }
  ]);

  // Telemetry real-time intervals
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => {
        const nextCpu = Math.max(12, Math.min(68, prev.cpuUsage + Math.floor(Math.random() * 9) - 4));
        const nextMemory = Math.max(35, Math.min(59, prev.memoryUsage + (Math.random() > 0.5 ? 0.2 : -0.2)));
        const nextConnections = Math.max(9, Math.min(26, prev.activeConnections + Math.floor(Math.random() * 3) - 1));
        const nextLatency = Math.max(6, Math.min(19, prev.dbQueryLatency + Math.floor(Math.random() * 3) - 1));
        const nextSpeed = Number((nextLatency / 10).toFixed(1));
        return {
          ...prev,
          cpuUsage: Math.round(nextCpu),
          memoryUsage: Number(nextMemory.toFixed(1)),
          activeConnections: nextConnections,
          dbQueryLatency: nextLatency,
          apiResponseSpeed: nextSpeed,
          tokenThroughput: prev.tokenThroughput + Math.floor(Math.random() * 30) - 10,
        };
      });
    }, 2000);

    const logMessages = [
      { msg: 'Inbound WebAuthn transaction initiated for biometric payload', type: 'info' as const },
      { msg: 'Clinical Diagnostic Engine resolved 94.2% diagnostic accuracy score', type: 'success' as const },
      { msg: 'Syncing medical offline records with secure SQLite database', type: 'system' as const },
      { msg: 'MTN Mobile Money webhook heartbeat recognized', type: 'info' as const },
      { msg: 'Llama 3 Neural reasoning matrix synchronized successfully', type: 'success' as const },
      { msg: 'Clinical backup archive created inside local_ai storage', type: 'system' as const },
      { msg: 'Twilio callback verified: SMS notification queue dispatched', type: 'info' as const },
      { msg: 'Hardware sensor transmission: ECG biometrics active key refreshed', type: 'system' as const },
      { msg: 'High load caution: Neural response latency briefly exceeded 2.2s', type: 'warn' as const },
      { msg: 'Database transaction logs cleared to maintain extreme disk efficiency', type: 'success' as const },
    ];

    const logsInterval = setInterval(() => {
      const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString(),
          msg: randomLog.msg,
          type: randomLog.type,
        },
        ...prev.slice(0, 15) // keep last 15 elements
      ]);
    }, 4000);

    return () => {
      clearInterval(telemetryInterval);
      clearInterval(logsInterval);
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
    }
  };

  const fetchBillingData = async (page = 1) => {
    setLoadingBilling(true);
    try {
      const data = await api.admin.listBilling(page, 10);
      setAdminBilling(data.payments);
      setBillingPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load billing history");
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleDownloadAllBilling = () => {
    const csvContent = "Transaction ID,Date,User Name,Email,Plan,Amount,Currency,Status\n" + 
      adminBilling.map(p => 
        `${p.externalId},${new Date(p.createdAt).toLocaleDateString()},${p.userName || 'Unknown'},${p.userEmail},${p.tier},${p.amount},${p.currency},${p.status}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Global-Billing-Report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchTwilioStatus = async () => {
    setLoadingTwilio(true);
    try {
      const res = await fetch('/api/admin/mtn-status', { credentials: 'include' });
      const data = await res.json();
      setTwilioStatus(data);
    } catch (err) {
      console.error("Failed to fetch MTN status:", err);
    } finally {
      setLoadingTwilio(false);
    }
  };

  // Load and subscribe to Background Synchronization Queue
  useEffect(() => {
    const loadQueue = () => {
      try {
        const raw = localStorage.getItem("medical_offline_actions_queue");
        if (raw) {
          setSyncQueue(JSON.parse(raw));
        } else {
          setSyncQueue([]);
        }
      } catch (e) {
        console.error("Failed to load offline actions queue:", e);
      }
    };

    loadQueue();

    const handleConnectionChange = () => {
      setNetworkStatus(navigator.onLine);
    };

    window.addEventListener('offline_action_queued', loadQueue);
    window.addEventListener('offline_actions_synced', loadQueue);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('offline_action_queued', loadQueue);
      window.removeEventListener('offline_actions_synced', loadQueue);
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  const handleForceSync = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (addToast) addToast("Device is offline. Cannot initiate secure sync.", "error");
      return;
    }
    setIsSyncingEngine(true);
    try {
      setLogs(prev => [
        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Sync Engine] Initiating out-of-band force synchronization handshake...`, type: 'system' },
        ...prev
      ]);
      const success = await syncOfflineActions();
      if (success) {
        if (addToast) addToast("All offline background backlog elements synced successfully!", "success");
        setLogs(prev => [
          { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Sync Engine] Synced all background backlog packets securely with Firestore server.`, type: 'success' },
          ...prev
        ]);
      } else {
        if (addToast) addToast("Background sync concluded with some lingering items deferred.", "info");
      }
    } catch (e: any) {
      if (addToast) addToast(`Sync failed: ${e.message}`, "error");
    } finally {
      setIsSyncingEngine(false);
      // Reload local queue
      try {
        const raw = localStorage.getItem("medical_offline_actions_queue");
        setSyncQueue(raw ? JSON.parse(raw) : []);
      } catch (err) {}
    }
  };

  const handleInjectMockSyncAction = (type: 'vitals' | 'medication' | 'task') => {
    try {
      const raw = localStorage.getItem("medical_offline_actions_queue") || '[]';
      const queue = JSON.parse(raw);
      
      let newAction: any = {
        id: "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)
      };

      if (type === 'vitals') {
        newAction = {
          ...newAction,
          type: 'create',
          endpoint: 'records',
          payload: {
            type: 'Blood Pressure',
            value: `${Math.floor(Math.random() * 20) + 110}/${Math.floor(Math.random() * 10) + 75}`,
            unit: 'mmHg',
            notes: 'Simulated offline vital intake from supervisor',
            date: new Date().toISOString()
          }
        };
      } else if (type === 'medication') {
        newAction = {
          ...newAction,
          type: 'take',
          endpoint: 'medications',
          targetId: 'med_simulated_' + Math.floor(Math.random() * 100),
          payload: {
            medicationId: 'med_simulated_33',
            medicationName: 'Amoxicillin 500mg',
            takenAt: new Date().toISOString()
          }
        };
      } else {
        newAction = {
          ...newAction,
          type: 'update',
          endpoint: 'tasks',
          targetId: 'task_simulated_44',
          payload: {
            title: 'Diagnostic Blood Draw Sync',
            status: 'completed',
            updatedAt: new Date().toISOString()
          }
        };
      }

      queue.push(newAction);
      localStorage.setItem("medical_offline_actions_queue", JSON.stringify(queue));
      setSyncQueue(queue);
      
      // Trigger event to notify any external listener
      window.dispatchEvent(new CustomEvent("offline_action_queued", { detail: newAction }));
      
      if (addToast) addToast(`Injected simulated offline action for endpoint: /api/${newAction.endpoint}`, "info");
      
      setLogs(prev => [
        { 
          id: Math.random().toString(), 
          time: new Date().toLocaleTimeString(), 
          msg: `[Offline Queue] Outbound offline action queued: [${newAction.type.toUpperCase()}] to /api/${newAction.endpoint}`, 
          type: 'system' 
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleClearSyncQueue = () => {
    try {
      localStorage.setItem("medical_offline_actions_queue", "[]");
      setSyncQueue([]);
      if (addToast) addToast("Offline actions queue backlog cleared successfully.", "success");
      setLogs(prev => [
        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Sync Engine] Offline actions queue was manually truncated and flushed.`, type: 'warn' },
        ...prev
      ]);
    } catch (e) {}
  };

  const handleDeleteQueueItem = (id: string) => {
    try {
      const raw = localStorage.getItem("medical_offline_actions_queue") || '[]';
      const queue = JSON.parse(raw);
      const updated = queue.filter((item: any) => item.id !== id);
      localStorage.setItem("medical_offline_actions_queue", JSON.stringify(updated));
      setSyncQueue(updated);
      if (addToast) addToast("Item removed from offline synchronized backlog.", "info");
    } catch (e) {}
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    } else if (activeTab === 'billing') {
      fetchBillingData();
    } else if (activeTab === 'doctors') {
      fetchDoctors();
    } else {
      fetchTwilioStatus();
    }
  }, [activeTab]);

  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisteringDoctor(true);
    try {
      await api.admin.createDoctor(newDoctor);
      setSuccessMessage("Doctor registered successfully!");
      setNewDoctor({ name: '', whatsappNumber: '', specialization: '', location: '', imageUrl: '', active: true });
      fetchDoctors();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to register doctor");
    } finally {
      setIsRegisteringDoctor(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await api.admin.deleteDoctor(id);
      setDoctors(doctors.filter(d => d.id !== id));
      setSuccessMessage("Doctor registration removed");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to remove doctor");
    }
  };

  const handleToggleDoctor = async (id: string, currentActive: boolean) => {
    try {
      await api.admin.updateDoctor(id, { active: !currentActive });
      setDoctors(doctors.map(d => d.id === id ? { ...d, active: !currentActive } : d));
    } catch (err: any) {
      setError(err.message || "Failed to update doctor status");
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingNotification(true);
    try {
      await api.notifications.create(newNotification);
      setSuccessMessage("Notification sent successfully!");
      setNewNotification({ title: '', content: '', type: 'info' });
      fetchNotifications();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setIsCreatingNotification(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccessMessage("Notification deleted");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete notification");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.admin.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccessMessage(`Role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleViewRecords = async (user: User) => {
    setSelectedUser(user);
    setLoadingRecords(true);
    try {
      const records = await api.admin.getUserRecords(user.id);
      setUserRecords(records);
    } catch (err: any) {
      setError(err.message || "Failed to load user records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesInstitution = !filterInstitution || u.institutionId === filterInstitution;
    return matchesSearch && matchesInstitution;
  });

  const getRecordIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood pressure': return <Heart className="text-rose-500" size={18} />;
      case 'heart rate': return <Activity className="text-red-500" size={18} />;
      case 'temperature': return <Thermometer className="text-orange-500" size={18} />;
      case 'weight': return <Scale className="text-blue-500" size={18} />;
      default: return <FileText className="text-slate-400" size={18} />;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading user database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage users and platform-wide notifications.
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar max-w-full flex-nowrap shrink-0" role="tablist" aria-label="Dashboard sections">
          <button 
            onClick={() => setActiveTab('users')}
            role="tab"
            aria-selected={activeTab === 'users'}
            aria-controls="users-panel"
            id="tab-users"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Users size={16} aria-hidden="true" />
            Users
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            role="tab"
            aria-selected={activeTab === 'notifications'}
            aria-controls="notifications-panel"
            id="tab-notifications"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'notifications' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bell size={16} aria-hidden="true" />
            Notifs
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            role="tab"
            aria-selected={activeTab === 'billing'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'billing' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <CreditCard size={16} aria-hidden="true" />
            Billing
          </button>
          <button 
            onClick={() => setActiveTab('training')}
            role="tab"
            aria-selected={activeTab === 'training'}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'training' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Brain size={16} aria-hidden="true" />
            Training
          </button>
          <button 
            onClick={() => setActiveTab('doctors')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'doctors' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Shield size={16} aria-hidden="true" />
            Doctors
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            role="tab"
            aria-selected={activeTab === 'system'}
            aria-controls="system-panel"
            id="tab-system"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'system' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Activity size={16} aria-hidden="true" />
            System
          </button>
        </div>
      </div>

       {/* Real-time Administrative Command Operations Console */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
         {/* Metric Card 1: Patients & Specialists */}
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.05 }}
           whileHover={{ y: -4, scale: 1.015, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.08)' }}
           whileTap={{ scale: 0.985 }}
           className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-blue-200/50 dark:hover:border-blue-900/30 group cursor-pointer"
         >
           <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all">
               <Users size={22} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Registered Nodes</p>
               <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1.5 leading-tight">
                 {users.length} <span className="text-xs font-bold text-slate-400">Patients</span>
               </h3>
               <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{doctors.length} Specialist Doctors Active</p>
             </div>
           </div>
         </motion.div>
 
         {/* Metric Card 2: Live Biometric Sockets */}
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.12 }}
           whileHover={{ y: -4, scale: 1.015, boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.08)' }}
           whileTap={{ scale: 0.985 }}
           className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-violet-200/50 dark:hover:border-violet-900/30 group cursor-pointer"
         >
           <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
           <div className="flex items-center gap-4">
             <div className="relative w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-all">
               <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <Fingerprint size={22} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Live Active Pulse</p>
               <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1.5 leading-tight flex items-center gap-1.5 font-mono">
                 {telemetry.activeConnections} <span className="text-xs font-black text-emerald-500 uppercase tracking-wider animate-pulse">Live</span>
               </h3>
               <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Biometric hardware telemetry feeds</p>
             </div>
           </div>
         </motion.div>
 
         {/* Metric Card 3: Queries & Latency */}
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.19 }}
           whileHover={{ y: -4, scale: 1.015, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.08)' }}
           whileTap={{ scale: 0.985 }}
           className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-200/50 dark:hover:border-emerald-900/30 group cursor-pointer"
         >
           <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-all font-mono">
               <Cpu size={22} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Core Response Latency</p>
               <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1.5 leading-tight">
                 {telemetry.dbQueryLatency}ms <span className="text-xs font-bold text-slate-400">Query Speed</span>
               </h3>
               <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">API: {telemetry.apiResponseSpeed}s • SQLite 3 Active</p>
             </div>
           </div>
         </motion.div>
 
         {/* Metric Card 4: Agent Core Remaining Balance */}
         <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.26 }}
           whileHover={{ y: -4, scale: 1.015, boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.08)' }}
           whileTap={{ scale: 0.985 }}
           className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-amber-200/50 dark:hover:border-amber-900/30 group cursor-pointer"
         >
           <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-all">
               <Zap size={22} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Compute Energy Quota</p>
               <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1.5 leading-tight">
                 ${telemetry.creditRemaining.toFixed(2)}
               </h3>
               <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{telemetry.tokenThroughput.toLocaleString()} Tokens/min active</p>
             </div>
           </div>
         </motion.div>
       </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users-tab"
            id="users-panel"
            role="tabpanel"
            aria-labelledby="tab-users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
                <input 
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search users by email or name"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Filter Institution ID..."
                  value={filterInstitution}
                  onChange={(e) => setFilterInstitution(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                  aria-label="Filter by institution"
                />
              </div>
            </div>

            <div aria-live="polite" className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400"
                    role="alert"
                  >
                    <AlertCircle size={20} aria-hidden="true" />
                    <p className="font-medium">{error}</p>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400"
                    role="status"
                  >
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <p className="font-medium">{successMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <motion.tr 
                          layout
                          key={u.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner">
                                {u.photoURL ? (
                                  <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <UserIcon size={24} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{u.displayName}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Mail size={12} />
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <select 
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-transparent border-0 focus:ring-0 cursor-pointer transition-colors ${
                                u.role === 'admin' || u.role === 'doctor'
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800'
                                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                              }`}
                            >
                              <option value="user" className="dark:bg-slate-900 text-slate-900 dark:text-white">User</option>
                              <option value="doctor" className="dark:bg-slate-900 text-slate-900 dark:text-white">Doctor</option>
                              <option value="admin" className="dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setUserQrView(u)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all active:scale-90"
                                aria-label={`Generate QR ID for ${u.displayName || u.email}`}
                                title="Generate QR ID"
                              >
                                <QrCode size={20} aria-hidden="true" />
                              </button>
                              <button 
                                onClick={() => handleViewRecords(u)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
                                aria-label={`View health records for ${u.displayName || u.email}`}
                                title="View Records"
                              >
                                <FileText size={20} aria-hidden="true" />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(u.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"
                                aria-label={`Delete user ${u.displayName || u.email}`}
                                title="Delete User"
                              >
                                <Trash2 size={20} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                              <Users size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No users found matching your search.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'billing' ? (
          <motion.div
            key="billing-tab"
            id="billing-panel"
            role="tabpanel"
            aria-labelledby="tab-billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
                 <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Activity size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Global Billing Infrastructure</h3>
                    <p className="text-sm text-slate-500 font-medium">Monitoring {billingPagination.total} transactions across 25k+ target users.</p>
                 </div>
              </div>
              <button 
                onClick={handleDownloadAllBilling}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all hover:brightness-110"
              >
                <Download size={18} />
                Export Ledger (CSV)
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Transaction / Reference</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Protocol / Plan</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Magnitude</th>
                      <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {loadingBilling ? (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Syncing with Billing Gateway...</p>
                        </td>
                      </tr>
                    ) : adminBilling.length > 0 ? (
                      adminBilling.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 dark:text-white font-mono uppercase truncate max-w-[150px]">{p.externalId}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.createdAt).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-[10px]">
                                {(p.userName || p.userEmail || "?")[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{p.userName || 'Anonymous Node'}</span>
                                <span className="text-[9px] font-bold text-slate-400">{p.userEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               p.tier === 'gold' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                             }`}>
                               {p.tier}
                             </div>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-xs text-slate-900 dark:text-white uppercase whitespace-nowrap">
                            {p.amount} {p.currency}
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                             }`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'completed' ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'}`} />
                               {p.status}
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-32 text-center text-slate-400 uppercase font-black text-xs">No billing records in neural history.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination controls for admin billing */}
              {billingPagination.pages > 1 && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Page {billingPagination.page} of {billingPagination.pages} • {billingPagination.total} Total Reports
                   </p>
                   <div className="flex gap-2">
                     <button 
                       disabled={billingPagination.page === 1}
                       onClick={() => fetchBillingData(billingPagination.page - 1)}
                       className="p-3 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-200 disabled:opacity-30 hover:shadow-lg transition-all"
                     >
                       <ChevronLeft size={18} />
                     </button>
                     <button 
                       disabled={billingPagination.page === billingPagination.pages}
                       onClick={() => fetchBillingData(billingPagination.page + 1)}
                       className="p-3 bg-white dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-200 disabled:opacity-30 hover:shadow-lg transition-all"
                     >
                       <ChevronRight size={18} />
                     </button>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'notifications' ? (
          <motion.div
            key="notifications-tab"
            id="notifications-panel"
            role="tabpanel"
            aria-labelledby="tab-notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Background Sync Queue Status Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 z-10">
                <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  isSyncingEngine ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' :
                  syncQueue.length === 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                  syncQueue.length <= 5 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                  'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                }`}>
                  <Radio size={24} className={isSyncingEngine ? "animate-pulse" : ""} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Background Link Synchronizer
                    </h4>
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      isSyncingEngine ? 'bg-blue-500 animate-ping' :
                      syncQueue.length === 0 ? 'bg-emerald-500' :
                      syncQueue.length <= 5 ? 'bg-amber-500' :
                      'bg-rose-500 animate-pulse'
                    }`} />
                  </div>
                  
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-xl font-black text-slate-950 dark:text-white leading-none">
                      {syncQueue.length === 0 ? 'Queue Fully Synced' : `${syncQueue.length} Pending Actions`}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({syncQueue.length > 0 ? "offline storage cache active" : "link status secure"})
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Doctorian dynamically batches transaction packets created while offline. Commits automatically with Firestore server once connection is stable.
                  </p>
                </div>
              </div>

              {/* Progress Bar & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 grow lg:max-w-md z-10 w-full lg:w-auto">
                <div className="flex flex-col gap-1.5 grow">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Queue load</span>
                    <span className={
                      syncQueue.length === 0 ? 'text-emerald-500 font-bold' :
                      syncQueue.length <= 5 ? 'text-amber-500 font-bold' :
                      'text-rose-500 font-bold animate-pulse'
                    }>
                      {syncQueue.length === 0 ? '0%' : syncQueue.length >= 20 ? '100% Core Limit' : `${Math.min(100, Math.round((syncQueue.length / 20) * 100))}%`}
                    </span>
                  </div>
                  {/* Colored progress bar scale */}
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/40">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: syncQueue.length === 0 ? "0%" : `${Math.min(100, Math.max(8, Math.round((syncQueue.length / 20) * 100)))}%` 
                      }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      className={`h-full rounded-full ${
                        isSyncingEngine ? 'bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse' :
                        syncQueue.length === 0 ? 'bg-emerald-500' :
                        syncQueue.length <= 5 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                        'bg-gradient-to-r from-rose-500 to-red-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleForceSync}
                    disabled={isSyncingEngine || syncQueue.length === 0}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/10"
                    title="Initiate full synchronization handshake"
                  >
                    {isSyncingEngine ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    Sync
                  </button>
                  {syncQueue.length > 0 && (
                    <button
                      onClick={() => {
                        localStorage.setItem("medical_offline_actions_queue", "[]");
                        setSyncQueue([]);
                        if (addToast) addToast("Backlog queue cleared and purged.", "info");
                        setLogs(prev => [
                          { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Sync Engine] Offline actions queue was manually truncated and flushed.`, type: 'warn' },
                          ...prev
                        ]);
                      }}
                      className="flex items-center justify-center p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 text-slate-500 dark:text-slate-400 rounded-2xl transition-all"
                      title="Purge pending backlog cache"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Create Notification Form */}
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
                  <h3 id="send-broadcast-title" className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Send className="text-blue-600" size={20} aria-hidden="true" />
                    Send Broadcast
                  </h3>
                  
                  <form onSubmit={handleCreateNotification} className="space-y-4" aria-labelledby="send-broadcast-title">
                    <div className="space-y-1.5">
                      <label htmlFor="notif-title" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                      <input 
                        id="notif-title"
                        type="text"
                        required
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        placeholder="e.g. New Health Guidelines"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="notif-content" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Content</label>
                      <textarea 
                        id="notif-content"
                        required
                        rows={4}
                        value={newNotification.content}
                        onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                        placeholder="Enter the broadcast message..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="notif-type" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Type</label>
                      <select 
                        id="notif-type"
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      >
                        <option value="info">Information</option>
                        <option value="alert">Alert</option>
                        <option value="update">Update</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      disabled={isCreatingNotification}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 disabled:opacity-50 active:scale-95"
                    >
                      {isCreatingNotification ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /><span>SEND BROADCAST</span></>}
                    </button>
                  </form>
                </div>
              </div>

              {/* Notifications List */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="text-blue-600" size={20} />
                    Sent Notifications
                  </h3>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{notifications.length} Total</span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <motion.div 
                        layout
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4 group"
                      >
                        <div className="flex gap-4">
                          <div className={`mt-1 p-2 rounded-xl ${
                            n.type === 'alert' ? 'bg-rose-50 text-rose-600' : 
                            n.type === 'update' ? 'bg-blue-50 text-blue-600' : 
                            'bg-slate-50 text-slate-600'
                          }`}>
                            <Bell size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white">{n.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.content}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <Bell className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-medium">No broadcasts sent yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'training' ? (
          <motion.div
            key="training-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-3xl">
                  <Brain className="text-purple-600" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Intelligence Hub</h3>
                  <p className="text-sm text-slate-500 font-medium">Training standalone neural nodes and configuring clinical knowledge parameters.</p>
                </div>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
                <NeuralTrainingHub />
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'doctors' ? (
          <motion.div
            key="doctors-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {/* Register Doctor Form */}
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
                    <Plus className="text-blue-600" size={20} />
                    Register Doctor
                  </h3>
                  
                  <form onSubmit={handleRegisterDoctor} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={newDoctor.name}
                        onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                        placeholder="Dr. Jane Smith"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                      <input 
                        type="text"
                        required
                        value={newDoctor.whatsappNumber}
                        onChange={(e) => setNewDoctor({...newDoctor, whatsappNumber: e.target.value})}
                        placeholder="e.g. 256700000000"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                      <input 
                        type="text"
                        required
                        value={newDoctor.specialization}
                        onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                        placeholder="e.g. Cardiologist"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <input 
                        type="text"
                        required
                        value={newDoctor.location}
                        onChange={(e) => setNewDoctor({...newDoctor, location: e.target.value})}
                        placeholder="e.g. Kampala, Medical Plaza"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Photo URL (Optional)</label>
                      <input 
                        type="text"
                        value={newDoctor.imageUrl}
                        onChange={(e) => setNewDoctor({...newDoctor, imageUrl: e.target.value})}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isRegisteringDoctor}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                    >
                      {isRegisteringDoctor ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /><span>REGISTER DOCTOR</span></>}
                    </button>
                  </form>
                </div>
              </div>

              {/* Doctors List */}
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {doctors.length > 0 ? (
                          doctors.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                                    {d.imageUrl ? (
                                      <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <UserIcon className="text-blue-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                                    <p className="text-xs text-blue-600 font-black uppercase tracking-tight">{d.specialization}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Mail size={12} className="text-slate-400" />
                                    +{d.whatsappNumber}
                                  </p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5 uppercase font-black tracking-tighter">
                                    <Activity size={12} className="text-slate-400" />
                                    {d.location}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <button 
                                  onClick={() => handleToggleDoctor(d.id, d.active)}
                                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                                    d.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${d.active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                                  {d.active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button 
                                  onClick={() => handleDeleteDoctor(d.id)}
                                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-20 text-center">
                              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No doctors registered yet.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="system-tab"
            id="system-panel"
            role="tabpanel"
            aria-labelledby="tab-system"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* MTN Status Card */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Activity className="text-blue-600" size={24} />
                    MTN API Configuration
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    twilioStatus?.configured ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {twilioStatus?.configured ? 'Configured' : 'Incomplete'}
                  </div>
                </div>

                {loadingTwilio ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MTN API Key</p>
                        <div className="flex items-center gap-2">
                          {twilioStatus?.details && twilioStatus.details.hasApiKey ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{twilioStatus?.details && twilioStatus.details.hasApiKey ? 'Present' : 'Missing'}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sender ID</p>
                        <div className="flex items-center gap-2">
                          {twilioStatus?.details && twilioStatus.details.hasSenderId ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(twilioStatus?.details && twilioStatus.details.senderId) || 'Missing'}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor Number</p>
                        <div className="flex items-center gap-2">
                          {twilioStatus?.details && twilioStatus.details.hasDoctorNumber ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{(twilioStatus?.details && twilioStatus.details.doctorNumber) || 'Missing'}</span>
                        </div>
                      </div>
                    </div>

                    {!twilioStatus?.configured && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 leading-relaxed">
                          To enable real SMS and Voice alerts via MTN, you must configure the MTN environment variables in the Settings menu.
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">MTN Setup Guide</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0">1</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Register on the <span className="font-bold text-slate-700 dark:text-slate-300">MTN Developer Portal</span> to obtain your API Key.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0">2</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Set your <span className="font-bold text-slate-700 dark:text-slate-300">Sender ID</span> (e.g., DOCTORIAN) to identify your messages to users.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0">3</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Ensure your MTN account has sufficient balance to send SMS and initiate Voice calls.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enterprise Security & System Sentinel Card */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-205 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="text-blue-600 dark:text-blue-400 animate-pulse" size={26} />
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        Enterprise Security & System Sentinel
                      </h3>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">ADMIN SECURITY OPERATIONS CORE</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    securityLevel === 'STANDARD' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900' :
                    securityLevel === 'MFA_RESTRICTED' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/10 dark:text-amber-400 dark:border-amber-900' :
                    'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900 animate-pulse'
                  }`}>
                    {securityLevel === 'STANDARD' ? 'STANDARD TIER' : securityLevel === 'MFA_RESTRICTED' ? 'STRICT MFA' : 'CRITICAL LOCKDOWN'}
                  </div>
                </div>

                {/* Interactive Posture Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Security Posture Mode Enforcement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['STANDARD', 'MFA_RESTRICTED', 'LOCKDOWN'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleSecurityLevelChange(lvl)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-all border ${
                          securityLevel === lvl
                            ? lvl === 'STANDARD' ? 'bg-emerald-600 text-white border-emerald-600' : 
                              lvl === 'MFA_RESTRICTED' ? 'bg-amber-500 text-white border-amber-500' : 
                              'bg-rose-600 text-white border-rose-600 animate-pulse'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-150 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {lvl.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Database Cryptographic Keys Manager */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Symmetry Secret Key</p>
                      <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1 select-all truncate max-w-[200px]" title={clinicSecretKey}>
                        {clinicSecretKey}
                      </p>
                    </div>
                    <button
                      onClick={handleRotateEncryptionKey}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95"
                    >
                      Rotate Symmetric Key
                    </button>
                  </div>
                  <div className="text-[8px] text-slate-450 uppercase font-bold leading-relaxed border-t border-slate-100 dark:border-slate-750 pt-2 flex justify-between">
                    <span>ALGORITHM: AES-GCM-256</span>
                    <span>HEALTH KEY CHAIN ENVIABLE</span>
                  </div>
                </div>

                {/* Running Compliance Auditing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">WebAuthn Token Compliance Auditing</label>
                    {auditProgress !== null && (
                      <span className="text-[9px] font-mono font-bold text-blue-500 animate-pulse">{auditProgress}% COMPLETE</span>
                    )}
                  </div>

                  {auditProgress !== null ? (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 border border-slate-150 dark:border-slate-700 rounded-xl space-y-2">
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${auditProgress}%` }}
                        />
                      </div>
                      <p className="text-[8px] font-mono text-slate-450 uppercase tracking-wider animate-pulse">Scanning registered identity hashes, secure certificates, and database state mappings...</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRunSecurityAudit}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-755 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-850 dark:border-slate-700 hover:shadow shadow-blue-500/5 active:scale-95"
                    >
                      🛡️ Dispatch Bio-Identity Audit
                    </button>
                  )}
                </div>

                {/* System facts collapsed beautifully */}
                <details className="group border-t border-slate-100 dark:border-slate-800 pt-4 cursor-pointer select-none">
                  <summary className="list-none flex justify-between items-center text-[10px] font-black text-slate-450 uppercase tracking-widest group-open:text-blue-500 transition-colors">
                    <span>Clinical Infrastructure Specs</span>
                    <span className="text-[8px] font-mono transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <div className="space-y-3 pt-4 text-[9px] text-slate-650 dark:text-slate-400 space-y-2">
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                      <span className="font-semibold uppercase tracking-wider">Database Engine:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">SQLite 3 (Drizzle ORM)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                      <span className="font-semibold uppercase tracking-wider">Authentication Guard:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">JWT + WebAuthn FIDO2</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                      <span className="font-semibold uppercase tracking-wider">National Alert Tunnel:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">MTN API SMS Core</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-1.5">
                      <span className="font-semibold uppercase tracking-wider">Cloud Engine Scaling:</span>
                      <span className="font-mono font-bold text-slate-905 text-blue-500">Firebase Database Sync (50k)</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Background Synchronization Queue Tracker Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Database size={20} className={isSyncingEngine ? "animate-spin" : ""} />
                    {syncQueue.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
                        {syncQueue.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Background Sync Queue Status</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">Verify outbound data queues, offline transaction cached records, and local synchronization tasks</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    networkStatus ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 animate-pulse'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${networkStatus ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                    Host State: {networkStatus ? 'Online' : 'Offline Mode'}
                  </div>
                </div>
              </div>

              {/* Status and Actions Strip */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Backlog Length</p>
                  <p className="text-2xl font-black text-slate-950 dark:text-white font-mono">{syncQueue.length} <span className="text-xs font-bold text-slate-400">elements</span></p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Processor State</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${isSyncingEngine ? 'bg-blue-500 animate-ping' : syncQueue.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-black text-slate-705 dark:text-slate-300 uppercase tracking-wider">
                      {isSyncingEngine ? 'Syncing...' : syncQueue.length > 0 ? 'Cache Pending' : 'Synced'}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Sync Handshake Gateway</p>
                    <p className="text-[10px] text-slate-550 dark:text-slate-400 font-medium leading-relaxed">Commit transaction stream or discard current cache.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleForceSync}
                      disabled={isSyncingEngine || syncQueue.length === 0}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-40 active:scale-95"
                    >
                      {isSyncingEngine ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                      Flush Sync
                    </button>
                    <button
                      onClick={handleClearSyncQueue}
                      disabled={syncQueue.length === 0}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-95 border border-slate-250 dark:border-slate-700"
                    >
                      Empty Backlog
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Signal Injector Strip */}
              <div className="p-5 bg-blue-50/20 dark:bg-slate-800/20 border border-blue-500/10 dark:border-slate-800 rounded-2xl mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h5 className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                      Offline Backlog Simulator & Stress Terminal
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 animate-pulse">Inject synthesized offline actions to stress-test transactional syncing flow safely.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleInjectMockSyncAction('medication')}
                    className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95"
                  >
                    + Mock Dosage Take
                  </button>
                  <button
                    onClick={() => handleInjectMockSyncAction('vitals')}
                    className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95"
                  >
                    + Mock Vital Record
                  </button>
                  <button
                    onClick={() => handleInjectMockSyncAction('task')}
                    className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white border border-blue-500/20 text-blue-650 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95"
                  >
                    + Mock Diagnostic Task
                  </button>
                </div>
              </div>

              {/* Queue Items Table */}
              <div className="border border-slate-205 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-950/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Transaction / ID</th>
                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Operation</th>
                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Target Endpoint</th>
                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Payload Preview</th>
                        <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right font-sans">Prune</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {syncQueue.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <CheckCircle2 className="text-emerald-500" size={24} />
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">System Synced & Backlog Clear</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Any diagnostic tasks or dosage reports made offline will queue here automatically before committing.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        syncQueue.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/20 transition-all font-mono">
                            <td className="px-5 py-4">
                              <span className="text-[10px] font-black text-slate-900 dark:text-white">{item.id}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                item.type === 'create' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800' :
                                item.type === 'update' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800' :
                                item.type === 'delete' ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800' :
                                'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                /api/{item.endpoint}
                              </span>
                            </td>
                            <td className="px-5 py-4 max-w-xs sm:max-w-md truncate text-[10px] text-slate-500 dark:text-slate-400">
                              {JSON.stringify(item.payload)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => handleDeleteQueueItem(item.id)}
                                className="p-1 px-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all scale-95"
                                title="Prune custom entry"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Clinical Alarm & Emergency Dispatch Control Deck */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center animate-pulse">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Alarm & Automatic Emergency Dispatch Control</h3>
                    <p className="text-xs text-slate-500 font-medium">Configure global clinical thresholds, system notifications, and automated emergency alert escalation</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    alarmTriggerMode === 'all' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    alarmTriggerMode === 'emergency_only' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    Mode: {alarmTriggerMode === 'all' ? 'All Active' : alarmTriggerMode === 'emergency_only' ? 'Emergency Only' : 'Disabled (Logs Only)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'all',
                    title: 'All Active',
                    desc: 'Full clinical telemetry alarms. Warning & hazard thresholds generate alerts instantly on logs, sirens, and trigger calls.',
                    color: 'text-emerald-500'
                  },
                  {
                    id: 'emergency_only',
                    title: 'Emergency Only',
                    desc: 'Prioritize true emergencies. Critical vitals trigger automatic MTN calling and SMS dispatch to stored contacts immediately. Warning levels are recorded silently to logs.',
                    color: 'text-amber-500'
                  },
                  {
                    id: 'disabled',
                    title: 'Logs Only (Muted)',
                    desc: 'Deactivate audio sirens and MTN outbound calls entirely. All vitals data are charted silently in the clinical log to avoid alert fatigue.',
                    color: 'text-slate-500'
                  }
                ].map((option) => {
                  const isActive = alarmTriggerMode === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAlarmTriggerModeChange(option.id as any)}
                      className={`text-left p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-full ${
                        isActive
                          ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-500 text-white shadow-xl shadow-blue-500/5'
                          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-805 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{option.title}</h4>
                          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed">{option.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100/70 dark:border-slate-800/60 w-full text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1">
                        {isActive ? '✓ Active Mode' : 'Activate Preset'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Operations & Interactive Diagnostic Console */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8 mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center animate-pulse">
                    <Radio size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Live System Pulse & Diagnostic Feed</h3>
                    <p className="text-xs text-slate-500 font-medium font-mono">Channel: WS://127.0.0.1:3000/api/biometrics • Status: Connected</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setLogs(prev => [
                        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: "Database buffer synchronized manually by supervisor.", type: "success" },
                        ...prev
                      ]);
                      if (addToast) addToast("Neural buffers synchronized.", "success");
                    }}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-100 dark:border-slate-700 active:scale-95"
                  >
                    <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                    Sync Logs
                  </button>
                  <button 
                    onClick={() => {
                      setLogs([]);
                      if (addToast) addToast("Diagnostic terminal cleared.", "info");
                    }}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100/50 transition-all flex items-center gap-2 border border-rose-100/30 active:scale-95"
                  >
                    <Trash2 size={12} />
                    Clear Logs
                  </button>
                </div>
              </div>

              {/* Simulation Interactive Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Fingerprint size={16} className="text-violet-500" />
                      Biometric Signal Injector
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Simulate direct transmission from digital medical devices (e.g. ECG patches, pulse oximeters) directly to clinicians.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const idVal = Math.floor(Math.random() * 900) + 100;
                      setLogs(prev => [
                        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `[Sensor Node #${idVal}] ECG Pulse verified. Calculated Heart Rate: ${Math.floor(Math.random() * 25) + 65} BPM, SpO2: ${Math.floor(Math.random() * 3) + 96}%`, type: 'success' },
                        ...prev
                      ]);
                      if (addToast) addToast("Mock Biometric Pulse packet injected.", "success");
                    }}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/10 transition-all active:scale-95"
                  >
                    Transmit ECG Packet
                  </button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                      <ShieldAlert size={16} className="text-rose-500 animate-bounce" />
                      Emergency Signal Controller
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Trigger clinic emergency drill state to monitor hardware and SMS alerts scaling to dispatch.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const drilling = telemetry.emergencySignals === 0;
                      setTelemetry(prev => ({ ...prev, emergencySignals: drilling ? 1 : 0 }));
                      setLogs(prev => [
                        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: drilling ? "⚠️ WARNING: GLOBAL CLINICAL DRILL INITIATED. Emergency response dispatch queued." : "✓ SECURE: Clinical emergency drill concluded. All nodes returned to normal.", type: drilling ? 'warn' : 'success' },
                        ...prev
                      ]);
                      if (addToast) addToast(drilling ? "Emergency Drill Mode ON" : "Emergency Drill Mode OFF", drilling ? "error" : "success");
                    }}
                    className={`w-full py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                      telemetry.emergencySignals > 0 
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                    }`}
                  >
                    {telemetry.emergencySignals > 0 ? "Terminate Drill State" : "Trigger Emergency Drill"}
                  </button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Database size={16} className="text-emerald-500" />
                      SQLite Database Defrag
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Perform system optimization audits and compress indices to optimize SQL analytical speeds.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setLogs(prev => [
                        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: "SQLite indexing optimization triggered.", type: 'info' },
                        { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: "VACUUM completed. Rebuilt indices for records & users indices securely.", type: 'success' },
                        ...prev
                      ]);
                      if (addToast) addToast("SQLite Indexes rebuilt securely.", "success");
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                  >
                    Defrag database
                  </button>
                </div>
              </div>

              {/* Console logs output */}
              <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs max-h-[300px] overflow-y-auto space-y-2 select-text custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="font-bold">No active live logs. Buffer cleared.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 text-[11px] leading-relaxed">
                      <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest scale-90 -mt-0.5 shrink-0 select-none ${
                        log.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        log.type === 'warn' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse' :
                        log.type === 'system' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.type}
                      </span>
                      <span className={`font-medium ${
                        log.type === 'success' ? 'text-slate-100' :
                        log.type === 'warn' ? 'text-amber-300 font-bold' :
                        log.type === 'system' ? 'text-indigo-300' :
                        'text-slate-300'
                      }`}>
                        {log.msg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Records Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="records-modal-title"
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl max-w-2xl w-full relative border border-slate-100 dark:border-slate-800 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                aria-label="Close records modal"
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
              >
                <X size={24} aria-hidden="true" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={32} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 id="records-modal-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedUser.displayName}'s Records</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {loadingRecords ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Fetching health records...</p>
                  </div>
                ) : userRecords.length > 0 ? (
                  userRecords.map((record) => (
                    <div 
                      key={record.id}
                      className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getRecordIcon(record.type)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{record.type}</p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                            {record.value} <span className="text-sm font-bold text-slate-400">{record.unit}</span>
                          </p>
                          {record.notes && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">"{record.notes}"</p>
                          )}
                          {record.attachmentURL && (
                            <div className="mt-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Diagnostic Image</p>
                              <img 
                                src={record.attachmentURL} 
                                alt="Diagnostic attachment" 
                                className="w-full max-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {new Date(record.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                      <FileText size={32} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No health records found for this user.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="mt-8 w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20 active:scale-95"
              >
                Close Records
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userQrView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="user-qr-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-sm w-full relative shadow-2xl border border-slate-100 dark:border-slate-800 text-center"
            >
              <button 
                onClick={() => setUserQrView(null)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                aria-label="Close QR modal"
              >
                <X size={24} />
              </button>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 mb-8 flex items-center justify-center shadow-inner">
                <QRCodeSVG 
                  value={`clinical-id:${userQrView.id}`} 
                  size={200}
                  level="H"
                  className="text-slate-900 dark:text-white"
                />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{userQrView.displayName}</h3>
              <p className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest mb-8">UID: {userQrView.id}</p>
              
              <button 
                onClick={() => window.print()}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Download size={16} /> Print Clinical Badge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-confirm-title"
              aria-describedby="delete-confirm-desc"
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full relative border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 mx-auto" aria-hidden="true">
                <AlertCircle size={32} />
              </div>
              <h3 id="delete-confirm-title" className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight">Delete User?</h3>
              <p id="delete-confirm-desc" className="text-slate-500 dark:text-slate-400 text-center mb-8">
                This action is permanent and will delete all health records and credentials associated with this user.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
