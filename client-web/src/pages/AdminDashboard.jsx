import React, { useState, useEffect } from 'react';
import { Users, Trash2, Search, Shield, AlertTriangle, CheckSquare, Calendar, Bell, Ban, CheckCircle, Activity, Clock, MoreVertical, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalTasks: 0, totalHabits: 0, newUsers: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'
    const { user: currentUser } = useAuthStore();

    // Settings State
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [globalKey, setGlobalKey] = useState('');

    // Broadcast State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

    // Ban Modal State
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [banDuration, setBanDuration] = useState(null); // null = permanent

    useEffect(() => {
        fetchData();
        fetchSettings(); // Initial fetch
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setIsMaintenanceMode(res.data.isMaintenanceMode);
            // Don't set globalKey to state for security
        } catch (error) {
            console.error(error);
        }
    };

    const toggleMaintenance = async () => {
        const action = isMaintenanceMode ? "DISABLE" : "ENABLE";
        if (window.confirm(`Are you sure you want to ${action} Maintenance Mode?`)) {
            try {
                const res = await api.put('/admin/maintenance');
                setIsMaintenanceMode(res.data.isMaintenanceMode);
                toast.success(res.data.message);
            } catch (error) {
                toast.error("Failed to toggle maintenance mode");
            }
        }
    };

    const saveGlobalKey = async () => {
        if (!globalKey) return;
        try {
            await api.put('/admin/ai-key', { key: globalKey });
            toast.success("Global AI Key updated successfully");
            setGlobalKey(''); // Clear input for security
        } catch (error) {
            toast.error("Failed to update Global Key");
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/stats')
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch admin data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(user => user._id !== id));
                toast.success('User deleted successfully');
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    // Open Ban Modal
    const openBanModal = (user) => {
        setSelectedUser(user);
        setBanDuration(null); // Default to Permanent
        setBanModalOpen(true);
    };

    const handleBanSubmit = async () => {
        if (!selectedUser) return;
        try {
            const response = await api.post(`/admin/users/${selectedUser._id}/ban`, { banDuration });
            setUsers(users.map(u => u._id === selectedUser._id ? {
                ...u,
                isBanned: response.data.isBanned,
                bannedExpiresAt: response.data.bannedExpiresAt
            } : u));
            toast.success(response.data.message);
            setBanModalOpen(false);
        } catch (error) {
            toast.error('Failed to update ban status');
        }
    };

    const handleUpdateRole = async (id, currentAdminStatus) => {
        const action = currentAdminStatus ? 'remove Admin rights from' : 'promote to Admin';
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                const response = await api.put(`/admin/users/${id}/role`);
                setUsers(users.map(u => u._id === id ? { ...u, isAdmin: response.data.isAdmin } : u));
                toast.success(response.data.message);
            } catch (error) {
                toast.error('Failed to update user role');
            }
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastTitle || !broadcastMessage) return;

        setIsSendingBroadcast(true);
        try {
            await api.post('/admin/broadcast', {
                title: broadcastTitle,
                message: broadcastMessage
            });
            toast.success('Broadcast sent successfully!');
            setBroadcastTitle('');
            setBroadcastMessage('');
        } catch (error) {
            toast.error('Failed to send broadcast');
        } finally {
            setIsSendingBroadcast(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!currentUser?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-blue-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">System Overview & Management</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Activity Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {activeTab === 'users' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatsCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30" />
                    <StatsCard icon={CheckSquare} label="Total Tasks" value={stats.totalTasks} color="text-green-600" bg="bg-green-100 dark:bg-green-900/30" />
                    <StatsCard icon={Calendar} label="Total Habits" value={stats.totalHabits} color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900/30" />
                    <StatsCard icon={CheckCircle} label="New Users (30d)" value={stats.newUsers} color="text-orange-600" bg="bg-orange-100 dark:bg-orange-900/30" />
                </div>
            )}

            {activeTab === 'users' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* User Management */}
                    <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
                                                            {user.profilePicture ? (
                                                                <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                                                                {user.isVerified && <CheckCircle size={14} className="text-blue-500" fill="currentColor" color="white" />}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.isAdmin ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                            User
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.isBanned ? (
                                                        <div className="flex flex-col">
                                                            <span className="px-2 py-1 inline-flex w-fit text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                                Banned
                                                            </span>
                                                            {user.bannedExpiresAt && (
                                                                <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                                    <Clock size={10} /> {new Date(user.bannedExpiresAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateRole(user._id, user.isAdmin)}
                                                            className={`p-1.5 rounded-lg transition-colors ${user.isAdmin ? 'text-purple-600 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                                                            title={user.isAdmin ? "Demote to User" : "Promote to Admin"}
                                                        >
                                                            <Shield size={18} />
                                                        </button>
                                                        {!user.isAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={() => user.isBanned ? handleBanSubmit(user) : openBanModal(user)} // Direct unban, Modal for ban
                                                                    className={`p-1.5 rounded-lg transition-colors ${user.isBanned ? 'text-green-600 bg-green-100 hover:bg-green-200' : 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'}`}
                                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                                >
                                                                    <Ban size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user._id)}
                                                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Broadcast Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Bell className="text-yellow-500" size={20} />
                                Broadcast Message
                            </h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSendBroadcast}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={broadcastTitle}
                                        onChange={(e) => setBroadcastTitle(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Announcement Title"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        rows="4"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Type your message to all users..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSendingBroadcast}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'logs' ? (
                // Logs Tab
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="text-blue-500" size={20} />
                            Activity Logs
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {logs.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No logs found</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {log.admin?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {log.target?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                {log.details ? JSON.stringify(log.details) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Settings Tab
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <MoreVertical className="text-gray-900 dark:text-white" size={24} />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Settings</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                            <div>
                                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={20} />
                                    Maintenance Mode
                                </h3>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    Immediately lock out all non-admin users. Use with caution.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {isMaintenanceMode ? 'ENABLED' : 'DISABLED'}
                                </span>
                                <button
                                    onClick={toggleMaintenance}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isMaintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Global AI Key */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <CheckSquare size={20} className="text-blue-500" />
                                Global Master AI Key
                            </h3>
                            <div className="flex gap-4">
                                <input
                                    type="password"
                                    value={globalKey}
                                    onChange={(e) => setGlobalKey(e.target.value)}
                                    placeholder="Enter Gemini API Key (Users will fallback to this)"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={saveGlobalKey}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                                >
                                    Save Key
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                This key will be used for any user who hasn't added their own API key.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Modal */}
            {banModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ban User</h3>
                            <button onClick={() => setBanModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Select ban duration for <strong>{selectedUser?.name}</strong>.
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { label: 'Permanent', value: null },
                                { label: '1 Hour', value: 1 },
                                { label: '24 Hours', value: 24 },
                                { label: '7 Days', value: 168 }
                            ].map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => setBanDuration(opt.value)}
                                    className={`py-3 px-4 rounded-lg border font-medium transition-all ${banDuration === opt.value
                                        ? 'bg-red-600 border-red-600 text-white'
                                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-red-500 hover:text-red-500'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setBanModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBanSubmit}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm"
                            >
                                Confirm Ban
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatsCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bg}`}>
                <Icon className={color} size={24} />
            </div>
        </div>
    </div>
);

export default AdminDashboard;
