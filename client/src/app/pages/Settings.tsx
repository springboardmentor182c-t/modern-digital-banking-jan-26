import { useState, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { Upload, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface SettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export function Settings({ userProfile, onUpdateProfile }: SettingsProps) {
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.avatar);
  const [isEditingKYC, setIsEditingKYC] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kycData, setKycData] = useState({
    idVerified: true,
    idType: 'Driver License',
    idNumber: '****5678',
    addressVerified: true,
    address: '123 Main Street, New York, NY 10001'
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setLocalProfile({ ...localProfile, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    onUpdateProfile(localProfile);
    toast.success('Profile updated successfully!', {
      description: 'Your changes have been saved.'
    });
  };

  const getInitials = () => {
    return `${localProfile.firstName.charAt(0)}${localProfile.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-border hover:bg-accent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Avatar
              </Button>
              <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={localProfile.firstName}
                onChange={(e) => setLocalProfile({ ...localProfile, firstName: e.target.value })}
                className="bg-input-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={localProfile.lastName}
                onChange={(e) => setLocalProfile({ ...localProfile, lastName: e.target.value })}
                className="bg-input-background border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={localProfile.email}
              onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
              className="bg-input-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={localProfile.phone}
              onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
              className="bg-input-background border-border"
            />
          </div>

          <Button 
            onClick={handleSaveChanges}
            className="bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </div>
      </Card>

      {/* KYC Information */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">KYC Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingKYC(!isEditingKYC)}
            className="border-border"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditingKYC ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Identity Verification Status */}
          <div className="bg-accent/30 border border-accent-foreground/20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Identity Verification</h4>
                  <Badge className="bg-success text-success-foreground border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                {isEditingKYC ? (
                  <div className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="idType" className="text-sm">ID Type</Label>
                      <Input
                        id="idType"
                        value={kycData.idType}
                        onChange={(e) => setKycData({ ...kycData, idType: e.target.value })}
                        className="bg-input-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber" className="text-sm">ID Number (Last 4 digits)</Label>
                      <Input
                        id="idNumber"
                        value={kycData.idNumber}
                        onChange={(e) => setKycData({ ...kycData, idNumber: e.target.value })}
                        className="bg-input-background border-border"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Type:</span> {kycData.idType}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">ID Number:</span> {kycData.idNumber}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Verified on:</span> January 15, 2026
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Verification Status */}
          <div className="bg-accent/30 border border-accent-foreground/20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Address Verification</h4>
                  <Badge className="bg-success text-success-foreground border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                {isEditingKYC ? (
                  <div className="space-y-3 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm">Residential Address</Label>
                      <Input
                        id="address"
                        value={kycData.address}
                        onChange={(e) => setKycData({ ...kycData, address: e.target.value })}
                        className="bg-input-background border-border"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Address:</span> {kycData.address}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Verified on:</span> January 15, 2026
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditingKYC && (
            <Button 
              onClick={() => {
                setIsEditingKYC(false);
                toast.success('KYC information updated');
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Save KYC Changes
            </Button>
          )}

          <div className="bg-info/20 border border-info rounded-lg p-4">
            <p className="text-sm text-info-foreground">
              <strong>Note:</strong> Your KYC documents are securely stored and encrypted. Contact support if you need to update your verification documents.
            </p>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-6">Security</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              type="password"
              className="bg-input-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password"
              className="bg-input-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              className="bg-input-background border-border"
            />
          </div>

          <Button className="bg-primary hover:bg-primary/90">Update Password</Button>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-6">Notifications</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified of all transactions</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">Alert when budget limit is reached</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bill Reminders</p>
              <p className="text-sm text-muted-foreground">Remind me before bills are due</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-2 border-destructive/50 shadow-md">
        <h3 className="text-lg font-semibold mb-6 text-destructive">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Close Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              Close Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
