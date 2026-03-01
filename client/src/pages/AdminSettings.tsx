import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  Shield,
  Bell,
  Database,
  Lock,
  Mail,
  Server,
  Save
} from 'lucide-react';
import { settingsApi } from '../api/adminApi';
import { adminSystemSettings as mockSettings } from '../data/adminMockData';
import { toast } from 'sonner';

interface Settings {
  id: number;
  maintenance_mode: boolean;
  low_balance_threshold: number;
  bill_due_reminder_days: number;
  budget_warning_percentage: number;
  alert_frequency_hours: number;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  admin_digest: boolean;
  two_factor_auth: boolean;
  session_timeout: number;
  ip_whitelisting: boolean;
  max_login_attempts: number;
  data_retention_days: number;
  log_retention_days: number;
  auto_backup: boolean;
  debug_mode: boolean;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    maintenance_mode: false,
    low_balance_threshold: 1000,
    bill_due_reminder_days: 3,
    budget_warning_percentage: 90,
    alert_frequency_hours: 24,
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
    admin_digest: true,
    two_factor_auth: true,
    session_timeout: 30,
    ip_whitelisting: false,
    max_login_attempts: 3,
    data_retention_days: 2555,
    log_retention_days: 365,
    auto_backup: true,
    debug_mode: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const response = await settingsApi.getSettings();

    if (response.data) {
      setSettings(response.data);
    } else {
      // Fallback to mock settings
      toast.info('Using demo settings', { description: 'Database unavailable — showing default settings' });
      setSettings({ id: 1, ...mockSettings });
    }
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const response = await settingsApi.updateSettings(settings as unknown as Record<string, unknown>);

    if (response.data) {
      toast.success('Settings saved successfully', {
        description: 'Your changes have been applied to the system'
      });
    } else {
      toast.error('Failed to save settings', { description: response.error });
    }
    setIsSaving(false);
  };

  const updateSetting = (key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Admin Settings</h2>
            <p className="text-muted-foreground mt-1">Configure system-wide settings</p>
          </div>
        </div>
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Admin Settings</h2>
          <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/30">
          <Shield className="w-3 h-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      {/* Alert Configuration */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Alert Thresholds</h3>
            <p className="text-sm text-muted-foreground">Configure system alert trigger conditions</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lowBalance">Low Balance Alert Threshold</Label>
              <div className="flex gap-2">
                <span className="text-lg">₹</span>
                <Input
                  id="lowBalance"
                  type="number"
                  value={settings.low_balance_threshold}
                  onChange={(e) => updateSetting('low_balance_threshold', parseInt(e.target.value))}
                  className="bg-input-background border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">Alert users when balance falls below this amount</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billDueDays">Bill Due Reminder (Days)</Label>
              <Input
                id="billDueDays"
                type="number"
                value={settings.bill_due_reminder_days}
                onChange={(e) => updateSetting('bill_due_reminder_days', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Send reminder before bill due date</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetWarning">Budget Warning Threshold (%)</Label>
              <Input
                id="budgetWarning"
                type="number"
                value={settings.budget_warning_percentage}
                onChange={(e) => updateSetting('budget_warning_percentage', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Alert when budget usage exceeds this percentage</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertFrequency">Alert Frequency (Hours)</Label>
              <Input
                id="alertFrequency"
                type="number"
                value={settings.alert_frequency_hours}
                onChange={(e) => updateSetting('alert_frequency_hours', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Minimum time between duplicate alerts</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-info-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notification Channels</h3>
            <p className="text-sm text-muted-foreground">Manage system notification delivery methods</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Send alerts via email</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Send critical alerts via SMS</p>
            </div>
            <Switch
              checked={settings.sms_notifications}
              onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Mobile app push notifications</p>
            </div>
            <Switch
              checked={settings.push_notifications}
              onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Admin Alert Digest</p>
              <p className="text-sm text-muted-foreground">Daily summary of all system alerts</p>
            </div>
            <Switch
              checked={settings.admin_digest}
              onCheckedChange={(checked) => updateSetting('admin_digest', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-destructive-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Security Configuration</h3>
            <p className="text-sm text-muted-foreground">System security and access control</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
            </div>
            <Switch
              checked={settings.two_factor_auth}
              onCheckedChange={(checked) => updateSetting('two_factor_auth', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <Switch
              checked={settings.session_timeout > 0}
              onCheckedChange={(checked) => updateSetting('session_timeout', checked ? 30 : 0)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">IP Whitelisting</p>
              <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
            </div>
            <Switch
              checked={settings.ip_whitelisting}
              onCheckedChange={(checked) => updateSetting('ip_whitelisting', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.session_timeout}
                onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.max_login_attempts}
                onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* System Configuration */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">System Configuration</h3>
            <p className="text-sm text-muted-foreground">General system settings and preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Block user access for system maintenance</p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Auto-Backup</p>
              <p className="text-sm text-muted-foreground">Daily automated database backups</p>
            </div>
            <Switch
              checked={settings.auto_backup}
              onCheckedChange={(checked) => updateSetting('auto_backup', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Debug Mode</p>
              <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
            </div>
            <Switch
              checked={settings.debug_mode}
              onCheckedChange={(checked) => updateSetting('debug_mode', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-success-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Data Management</h3>
            <p className="text-sm text-muted-foreground">Database and data retention settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data Retention (Days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.data_retention_days}
                onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Legal requirement: 7 years (2555 days)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logRetention">Log Retention (Days)</Label>
              <Input
                id="logRetention"
                type="number"
                value={settings.log_retention_days}
                onChange={(e) => updateSetting('log_retention_days', parseInt(e.target.value))}
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">System logs retention period</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Database className="w-4 h-4 mr-2" />
              Backup Now
            </Button>
            <Button variant="outline" className="justify-start">
              <Database className="w-4 h-4 mr-2" />
              Restore Backup
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Cancel
        </Button>
        <Button
          onClick={handleSaveSettings}
          className="bg-primary hover:bg-primary/90"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

