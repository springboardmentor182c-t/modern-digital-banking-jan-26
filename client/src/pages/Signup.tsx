import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Landmark, CheckCircle, Circle, Upload, FileText } from 'lucide-react';

interface SignupProps {
  onNavigate: (page: string) => void;
}

export function Signup({ onNavigate }: SignupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] =useState(['' , '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    idDocument: null as File | null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    addressProof: null as File | null
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // STEP 1: Personal Info
      if (currentStep === 1) {
        // Validation
        if (!formData.firstName.trim()) {
          setErrorMessage('First name is required');
          setIsLoading(false);
          return;
        }
        if (!formData.lastName.trim()) {
          setErrorMessage('Last name is required');
          setIsLoading(false);
          return;
        }
        if (!formData.email.trim()) {
          setErrorMessage('Email is required');
          setIsLoading(false);
          return;
        }
        if (!formData.phone.trim()) {
          setErrorMessage('Phone number is required');
          setIsLoading(false);
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          setErrorMessage('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            terms_accepted: true
          })
        });

        if (!response.ok) {
          let errorMessage = 'Registration failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorData.error || 'Registration failed';
          } catch (e) {
            errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.user_id) {
          throw new Error('No user ID returned from server');
        }

        // save user id for next steps
        localStorage.setItem("user_id", data.user_id);

        // show OTP (for testing)
        alert("OTP: " + (data.otp || 'Check your email'));

        setCurrentStep(2);
        setIsLoading(false);
        return;
      }

      // STEP 2: OTP Verification
      if (currentStep === 2) {
        const otpValue = otp.join("");
        if (!otpValue || otpValue.length !== 6) {
          setErrorMessage('Please enter a valid 6-digit OTP');
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            otp: otpValue
          })
        });

        if (!response.ok) {
          let errorMessage = 'OTP verification failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorData.error || 'OTP verification failed';
          } catch (e) {
            errorMessage = `OTP verification failed: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        alert(data.message || 'OTP verified successfully');

        setCurrentStep(3);
        setIsLoading(false);
        return;
      }

      // STEP 3: Identity Upload
      if (currentStep === 3) {
        if (!formData.idDocument) {
          setErrorMessage('Please upload an identity document');
          setIsLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("user_id", localStorage.getItem("user_id") || '');
        fd.append("file", formData.idDocument);

        const response = await fetch("http://127.0.0.1:8000/kyc/identity", {
          method: "POST",
          body: fd
        });

        if (!response.ok) {
          let errorMessage = 'Identity upload failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorData.error || 'Identity upload failed';
          } catch (e) {
            errorMessage = `Identity upload failed: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        setCurrentStep(4);
        setIsLoading(false);
        return;
      }

      // STEP 4: Address Upload
      if (currentStep === 4) {
        console.log('Starting Step 4 - Address Upload');
        if (!formData.address.trim()) {
          setErrorMessage('Address is required');
          setIsLoading(false);
          return;
        }
        if (!formData.city.trim()) {
          setErrorMessage('City is required');
          setIsLoading(false);
          return;
        }
        if (!formData.state.trim()) {
          setErrorMessage('State is required');
          setIsLoading(false);
          return;
        }
        if (!formData.zipCode.trim()) {
          setErrorMessage('Zip code is required');
          setIsLoading(false);
          return;
        }
        if (!formData.addressProof) {
          setErrorMessage('Please upload an address proof document');
          setIsLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("user_id", localStorage.getItem("user_id") || '');
        fd.append("street", formData.address);
        fd.append("city", formData.city);
        fd.append("state", formData.state);
        fd.append("zip_code", formData.zipCode);
        fd.append("file", formData.addressProof);

        console.log('Sending address upload request to backend');
        const response = await fetch("http://127.0.0.1:8000/kyc/address", {
          method: "POST",
          body: fd
        });

        console.log('Address upload response status:', response.status);

        if (!response.ok) {
          let errorMessage = 'Address upload failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorData.error || `Address upload failed: ${response.status}`;
          } catch (e) {
            errorMessage = `Address upload failed: ${response.status} ${response.statusText}`;
          }
          console.error('Address upload error:', errorMessage);
          setIsLoading(false);
          throw new Error(errorMessage);
        }

        // Try to parse response, but don't require it
        try {
          const data = await response.json();
          console.log('Address upload response:', data);
        } catch (e) {
          console.log('Response is not JSON, but upload was successful');
        }

        // Clear localStorage and show success
        console.log('Registration complete, clearing storage and navigating to dashboard');
        localStorage.removeItem("user_id");
        setIsLoading(false);
        alert("Registration completed successfully! Redirecting to dashboard...");
        console.log('About to navigate to dashboard');
        onNavigate("dashboard");
        console.log('Navigation called');
        return;
      }
    } catch (error) {
      console.error('Signup error:', error);
      let message = 'Backend connection failed. Please check if the server is running.';
      
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        message = JSON.stringify(error);
      }
      
      setErrorMessage(message);
      setIsLoading(false);
    }
  };


  const steps = [
    { id: 1, label: 'Personal Info', completed: currentStep > 1 },
    { id: 2, label: 'Verification', completed: currentStep > 2 },
    { id: 3, label: 'Identity Verification', completed: currentStep > 3 },
    { id: 4, label: 'Address Verification', completed: currentStep > 4 },
  ];

  const progressValue = (currentStep / 4) * 100;

  const handleFileChange = (fieldName: 'idDocument' | 'addressProof', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFormData({ ...formData, [fieldName]: files[0] });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Landmark className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-foreground">SmartBank</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Join SmartBank and take control of your finances</p>
        </div>

        {/* KYC Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Account Setup Progress</span>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              Step {currentStep} of 3
            </Badge>
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : currentStep === step.id ? (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={`text-sm ${currentStep === step.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm">First Name</label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm">Last Name</label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm">Phone Number</label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  I agree to the Terms of Service and Privacy Policy. I understand that SmartBank is FDIC insured and my data is protected.
                </label>
              </div>
            </div>
          )}

           {/* Step 2: OTP Verification */}
{currentStep === 2 && (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-center">
      <h3 className="font-semibold text-info-foreground mb-1">Verify your Email</h3>
      <p className="text-sm text-muted-foreground">
        We've sent a 6-digit code to <span className="font-medium text-foreground">{formData.email}</span>
      </p>
    </div>

    <div className="flex justify-center gap-2 max-w-sm mx-auto">
      {otp.map((digit, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value.replace(/\D/g, '');
            const newOtp = [...otp];
            newOtp[index] = val;
            setOtp(newOtp);
            // Auto-focus next input field
            if (val && e.target.nextSibling) {
              (e.target.nextSibling as HTMLInputElement).focus();
            }
          }}
          className="w-12 h-14 text-center text-xl font-bold bg-input-background border-border focus:ring-primary shadow-sm"
        />
      ))}
    </div>

    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Didn't receive the code?{' '}
        <button type="button" className="text-primary hover:underline font-medium">
          Resend Code
        </button>
      </p>
    </div>
  </div>
)}

          {/* Step 3: Identity Verification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-accent/50 border border-accent-foreground/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2 text-accent-foreground">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Please upload a valid government-issued ID (Driver's License, Passport, or National ID Card)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="idDocument" className="text-sm">Upload ID Document</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 bg-input-background hover:bg-accent/30 transition-colors">
                  <input
                    type="file"
                    id="idDocument"
                    accept="image/*,.pdf"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('idDocument', e)}
                    className="hidden"
                  />
                  <label
                    htmlFor="idDocument"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {formData.idDocument ? (
                      <>
                        <FileText className="w-12 h-12 text-success mb-3" />
                        <span className="text-sm font-medium text-success">{formData.idDocument.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF (max. 5MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-info/20 border border-info rounded-lg p-4">
                <p className="text-sm text-info-foreground">
                  <strong>Note:</strong> Your document must be clear and readable with all four corners visible.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Address Verification */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-accent/50 border border-accent-foreground/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2 text-accent-foreground">Address Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Please provide your residential address and upload a proof of address
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm">Street Address</label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm">City</label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm">State</label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm">ZIP Code</label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <label htmlFor="addressProof" className="text-sm">Upload Proof of Address</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Utility bill, bank statement, or lease agreement (not older than 3 months)
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-6 bg-input-background hover:bg-accent/30 transition-colors">
                  <input
                    type="file"
                    id="addressProof"
                    accept="image/*,.pdf"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange('addressProof', e)}
                    className="hidden"
                  />
                  <label
                    htmlFor="addressProof"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {formData.addressProof ? (
                      <>
                        <FileText className="w-12 h-12 text-success mb-3" />
                        <span className="text-sm font-medium text-success">{formData.addressProof.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF (max. 5MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 border-border"
              >
                Previous
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="inline-block mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                currentStep === 4 ? 'Complete Registration' : 'Continue'
              )}
            </Button>
          </div>
        </form>

        {/* Social Signup - Only on Step 1 */}
        {currentStep === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full border-border hover:bg-accent">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </>
        )}

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary"
            onClick={() => onNavigate('login')}
          >
            Sign in
          </Button>
        </div>
      </Card>
    </div>
  );

  
}
