import { Card } from '../app/components/ui/card';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Switch } from '../app/components/ui/switch';
import { Badge } from '../app/components/ui/badge';
import { 
  Shield,
  Bell,
  Database,
  Lock,
  Mail,
  Server,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminSettings() {
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully', {
      description: 'Your changes have been applied to the system'
    });
  };

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
                  defaultValue="1000"
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
                defaultValue="3"
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Send reminder before bill due date</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetWarning">Budget Warning Threshold (%)</Label>
              <Input
                id="budgetWarning"
                type="number"
                defaultValue="90"
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Alert when budget usage exceeds this percentage</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertFrequency">Alert Frequency (Hours)</Label>
              <Input
                id="alertFrequency"
                type="number"
                defaultValue="24"
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
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Send critical alerts via SMS</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Mobile app push notifications</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Admin Alert Digest</p>
              <p className="text-sm text-muted-foreground">Daily summary of all system alerts</p>
            </div>
            <Switch defaultChecked />
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
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">IP Whitelisting</p>
              <p className="text-sm text-muted-foreground">Restrict admin access to specific IPs</p>
            </div>
            <Switch />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                defaultValue="30"
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                defaultValue="3"
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
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Auto-Backup</p>
              <p className="text-sm text-muted-foreground">Daily automated database backups</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Debug Mode</p>
              <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
            </div>
            <Switch />
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
                defaultValue="2555"
                className="bg-input-background border-border"
              />
              <p className="text-xs text-muted-foreground">Legal requirement: 7 years (2555 days)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logRetention">Log Retention (Days)</Label>
              <Input
                id="logRetention"
                type="number"
                defaultValue="365"
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
        <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
