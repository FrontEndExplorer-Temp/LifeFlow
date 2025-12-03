import React from 'react';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Settings = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" defaultValue={user?.name} readOnly />
                    <Input label="Email" defaultValue={user?.email} readOnly />
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage email and push notifications</p>
                        </div>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Security</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Change password and security settings</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                </div>
            </div>

            {/* Logout */}
            <div className="flex justify-end">
                <Button variant="danger" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default Settings;
