import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/firebase";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Edit3,
  Calendar,
  Globe,
  Hash,
  CreditCard,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BusinessInfoPage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "businessInfo", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBusinessInfo({
              id: docSnap.id,
              ...docSnap.data(),
            });
          } else {
            setBusinessInfo({});
          }
        } catch (error) {
          console.error("Error fetching user business info:", error);
          toast({
            title: "Fetch error",
            description: "Could not load your business info.",
            variant: "destructive",
          });
        }
      } else {
        setUserId(null);
        setBusinessInfo({});
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setBusinessInfo((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const businessDocRef = doc(db, "businessInfo", userId);
      const { id, ...dataToUpdate } = businessInfo;
      await updateDoc(businessDocRef, dataToUpdate);
      toast({
        title: "Business information updated!",
        description: "Your changes have been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating business info:", error);
      toast({
        title: "Update failed",
        description: "There was an error saving the changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({
    icon: Icon,
    label,
    field,
    type = "text",
    placeholder,
    textarea = false,
  }: {
    icon: any;
    label: string;
    field: string;
    type?: string;
    placeholder?: string;
    textarea?: boolean;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </Label>
      {textarea ? (
        <Textarea
          value={businessInfo[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={!isEditing}
          rows={4}
          className={`transition-all duration-300 ${
            isEditing
              ? "border-primary/50 focus:border-primary shadow-sm"
              : "border-muted bg-muted/50"
          }`}
        />
      ) : (
        <Input
          type={type}
          value={businessInfo[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={!isEditing}
          className={`transition-all duration-300 ${
            isEditing
              ? "border-primary/50 focus:border-primary shadow-sm"
              : "border-muted bg-muted/50"
          }`}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <motion.div
        className="max-w-5xl mx-auto p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          variants={cardVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              Business Information
            </h1>
            <p className="text-muted-foreground">
              Manage your business details and contact information
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="gradient-primary shadow-elegant"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Info
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="card-hover"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gradient-primary shadow-elegant"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-4 w-4 mr-2"
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Logo */}
        {businessInfo.logo && (
          <motion.div
            className="flex justify-center"
            variants={cardVariants}
          >
            <img
              src={businessInfo.logo}
              alt="Business Logo"
              className="w-32 h-32 rounded-full object-cover border shadow"
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Details */}
          <motion.div variants={cardVariants} className="lg:col-span-1">
            <Card className="card-hover shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputField
                  icon={Building2}
                  label="Business Name"
                  field="businessName"
                  placeholder="Enter business name"
                />
                <InputField
                  icon={FileText}
                  label="Business Description"
                  field="description"
                  textarea
                  placeholder="Describe your business"
                />
                {businessInfo.createdAt && (
                  <p className="text-sm text-muted-foreground">
                    Created At:{" "}
                    {businessInfo.createdAt?.toDate
                      ? businessInfo.createdAt.toDate().toLocaleString()
                      : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank Details */}
          <motion.div variants={cardVariants} className="lg:col-span-1">
            <Card className="card-hover shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputField
                  icon={User}
                  label="Account Holder"
                  field="accountHolder"
                  placeholder="Enter account holder name"
                />
                <InputField
                  icon={Hash}
                  label="Account Number"
                  field="accountNumber"
                  placeholder="Enter account number"
                />
                <InputField
                  icon={Building2}
                  label="Bank Name"
                  field="bankName"
                  placeholder="Enter bank name"
                />
                <InputField
                  icon={Hash}
                  label="Branch Code"
                  field="branchCode"
                  placeholder="Enter branch code"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={cardVariants} className="lg:col-span-1">
            <Card className="card-hover shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-6 w-6 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputField
                  icon={Mail}
                  label="Email Address"
                  field="email"
                  type="email"
                  placeholder="Enter email"
                />
                <InputField
                  icon={Phone}
                  label="Phone Number"
                  field="phone"
                  type="tel"
                  placeholder="Enter phone"
                />
                <InputField
                  icon={Globe}
                  label="Website"
                  field="website"
                  placeholder="Enter website URL"
                />
                <InputField
                  icon={MapPin}
                  label="Business Address"
                  field="address"
                  placeholder="Enter address"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessInfoPage;
