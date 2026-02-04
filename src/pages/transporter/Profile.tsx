import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building2,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  AlertCircle,
  Save,
  Edit,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock transporter data - replace with API call
const mockTransporter = {
  email: "transporter@example.com",
  phone_number: 1234567890,
  role: "transporter" as "user" | "transporter" | "admin" | "super_admin",
  status: "approved" as "approved" | "rejected" | "pending" | "banned" | null,
  is_email_verified: true,
  is_phone_verified: false,
  company_name: "Acme Logistics",
  business_address: "123 Main St, Springfield",
  tax_number: "TX-123456",
  region: "north",
};

const TransporterProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: mockTransporter.email,
    phone_number: mockTransporter.phone_number?.toString() || "",
    company_name: mockTransporter.company_name || "",
    business_address: mockTransporter.business_address || "",
    tax_number: mockTransporter.tax_number || "",
    region: mockTransporter.region || "",
  });

  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: any;
    }
  > = {
    approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
    pending: { label: "Pending", variant: "secondary", icon: Clock },
    banned: { label: "Banned", variant: "destructive", icon: AlertCircle },
  };

  const roleConfig: Record<string, { label: string; icon: any }> = {
    user: { label: "User", icon: User },
    transporter: { label: "Transporter", icon: Truck },
    admin: { label: "Admin", icon: Shield },
    super_admin: { label: "Super Admin", icon: Shield },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Make API call to update transporter profile
    console.log("Updating transporter profile:", formData);
    setIsEditing(false);
    // Show success toast
  };

  const handleCancel = () => {
    setFormData({
      email: mockTransporter.email,
      phone_number: mockTransporter.phone_number?.toString() || "",
      company_name: mockTransporter.company_name || "",
      business_address: mockTransporter.business_address || "",
      tax_number: mockTransporter.tax_number || "",
      region: mockTransporter.region || "",
    });
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    if (!mockTransporter.status) return null;
    const config = statusConfig[mockTransporter.status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const RoleIcon = roleConfig[mockTransporter.role]?.icon || User;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your transporter account information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
            <CardDescription>Your account verification and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Role:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {roleConfig[mockTransporter.role]?.label || "Transporter"}
                </Badge>
              </div>
              {mockTransporter.status && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge()}
                </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email Verification</span>
                </div>
                {mockTransporter.is_email_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone Verification</span>
                </div>
                {mockTransporter.is_phone_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm">
              Your basic transporter account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                required
              />
              {!mockTransporter.is_email_verified && (
                <p className="text-xs text-muted-foreground">
                  Your email is not verified. Please verify it to access all features.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
              {!mockTransporter.is_phone_verified && (
                <p className="text-xs text-muted-foreground">
                  Your phone number is not verified.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>Your company and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Input
                id="business_address"
                value={formData.business_address}
                onChange={(e) =>
                  setFormData({ ...formData, business_address: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter your business address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Enter your tax number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) =>
                    setFormData({ ...formData, region: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">North</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                    <SelectItem value="central">Central</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Security
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/user/change-password")}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default TransporterProfile;
