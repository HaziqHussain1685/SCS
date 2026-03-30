import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Bell, TestTube, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { scannerAPI } from '../../services/api';

const AlertSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    email_enabled: false,
    sms_enabled: false,
    email_addresses: [],
    phone_numbers: [],
    critical_threshold: 30,
    high_threshold: 50,
    alert_on_new_device: true,
    alert_on_health_drop: true,
    alert_on_critical_vuln: true
  });

  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({ email: false, sms: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await scannerAPI.getAlertSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        showMessage('error', 'Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to load alert settings:', error);
      showMessage('error', 'Failed to load settings');
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await scannerAPI.saveAlertSettings(settings);
      
      if (response.success) {
        showMessage('success', 'Settings saved successfully!');
      } else {
        showMessage('error', response.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testAlert = async (type) => {
    setTesting({ ...testing, [type]: true });
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', `Test ${type} sent successfully!`);
      } else {
        showMessage('error', data.message || `Failed to send test ${type}`);
      }
    } catch (error) {
      showMessage('error', `Failed to send test ${type}`);
    } finally {
      setTesting({ ...testing, [type]: false });
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const addEmail = () => {
    if (newEmail && !settings.email_addresses.includes(newEmail)) {
      setSettings({
        ...settings,
        email_addresses: [...settings.email_addresses, newEmail]
      });
      setNewEmail('');
    }
  };

  const removeEmail = (email) => {
    setSettings({
      ...settings,
      email_addresses: settings.email_addresses.filter(e => e !== email)
    });
  };

  const addPhone = () => {
    if (newPhone && !settings.phone_numbers.includes(newPhone)) {
      setSettings({
        ...settings,
        phone_numbers: [...settings.phone_numbers, newPhone]
      });
      setNewPhone('');
    }
  };

  const removePhone = (phone) => {
    setSettings({
      ...settings,
      phone_numbers: settings.phone_numbers.filter(p => p !== phone)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-bg-secondary rounded-xl shadow-2xl border border-cyan-500/20 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Bell className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Alert Settings</h2>
              <p className="text-sm text-text-secondary">Configure email and SMS notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Message Banner */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-6 mt-4 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 space-y-6">
          {/* Email Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-text-primary">Email Alerts</h3>
                  <p className="text-sm text-text-secondary">Receive alerts via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_enabled}
                  onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {settings.email_enabled && (
              <div className="ml-8 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-2 bg-bg-tertiary border border-gray-700 rounded-lg text-text-primary focus:border-cyan-500 focus:outline-none"
                  />
                  <Button onClick={addEmail}>Add</Button>
                </div>

                <div className="space-y-2">
                  {settings.email_addresses.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-gray-700">
                      <span className="text-text-primary">{email}</span>
                      <button
                        onClick={() => removeEmail(email)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => testAlert('email')}
                  disabled={testing.email || settings.email_addresses.length === 0}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing.email ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            )}
          </div>

          {/* SMS Configuration */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-text-primary">SMS Alerts</h3>
                  <p className="text-sm text-text-secondary">Receive alerts via SMS (requires Twilio)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sms_enabled}
                  onChange={(e) => setSettings({ ...settings, sms_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {settings.sms_enabled && (
              <div className="ml-8 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPhone()}
                    placeholder="+1234567890"
                    className="flex-1 px-4 py-2 bg-bg-tertiary border border-gray-700 rounded-lg text-text-primary focus:border-cyan-500 focus:outline-none"
                  />
                  <Button onClick={addPhone}>Add</Button>
                </div>

                <div className="space-y-2">
                  {settings.phone_numbers.map((phone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg border border-gray-700">
                      <span className="text-text-primary">{phone}</span>
                      <button
                        onClick={() => removePhone(phone)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => testAlert('sms')}
                  disabled={testing.sms || settings.phone_numbers.length === 0}
                  className="w-full"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing.sms ? 'Sending...' : 'Send Test SMS'}
                </Button>
              </div>
            )}
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="font-semibold text-text-primary">Alert Thresholds</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Critical Threshold (Health Score ≤)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.critical_threshold}
                  onChange={(e) => setSettings({ ...settings, critical_threshold: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-red-400">{settings.critical_threshold}</span>
                  <span className="text-text-secondary">Alert when health score drops below this value</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  High Priority Threshold (Health Score ≤)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.high_threshold}
                  onChange={(e) => setSettings({ ...settings, high_threshold: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-orange-400">{settings.high_threshold}</span>
                  <span className="text-text-secondary">Alert for high priority issues</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Triggers */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h3 className="font-semibold text-text-primary mb-3">Alert Triggers</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alert_on_critical_vuln}
                onChange={(e) => setSettings({ ...settings, alert_on_critical_vuln: e.target.checked })}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-text-primary">Alert on critical vulnerabilities</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alert_on_health_drop}
                onChange={(e) => setSettings({ ...settings, alert_on_health_drop: e.target.checked })}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-text-primary">Alert on health score drops (≥20 points)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alert_on_new_device}
                onChange={(e) => setSettings({ ...settings, alert_on_new_device: e.target.checked })}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-text-primary">Alert on new device discovery</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AlertSettingsModal;
