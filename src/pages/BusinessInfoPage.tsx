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
import ImageUpload from "@/pages/components/ImageUpload";
                 import { Package } from "lucide-react"; // add this at the top with other icons

import {
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  Save,
  Edit3,
  Globe,
  Hash,
  CreditCard,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
            setBusinessInfo({ id: docSnap.id, ...docSnap.data() });
          } else {
            setBusinessInfo({});
          }
        } catch (error) {
          console.error("Error fetching business info:", error);
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
    setBusinessInfo((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;

    // Validation: all fields are required
    const requiredFields = [
      "name",
      "description",
      "accountName",
      "accountNumber",
      "bankName",
      "phone",
      "address",
      "logo",
      "lowStockThreshold",
    ];
    for (let field of requiredFields) {
      if (!businessInfo[field] || businessInfo[field].toString().trim() === "") {
        toast({
          title: "Missing information",
          description: `Please fill out the ${field} field.`,
          variant: "destructive",
        });
        return;
      }
    }

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
        {label} <span className="text-red-500">*</span>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
      <motion.div
        className="max-w-5xl mx-auto space-y-6 sm:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Info Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-800">
            Please complete all your business information including logo, contact, and bank
            details. This ensures your business is fully set up and visible to clients. Missing
            information may prevent access to certain admin features.
          </p>
        </div>

        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          variants={cardVariants}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Business Information</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your business details and contact information
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gradient-primary shadow-elegant w-full sm:w-auto">
                <Edit3 className="h-4 w-4 mr-2" /> Edit Info
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gradient-primary shadow-elegant w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div className="flex justify-center" variants={cardVariants}>
          <ImageUpload
            imageUrl={businessInfo.logo || ""}
            onImageChange={(url) => setBusinessInfo((prev) => ({ ...prev, logo: url }))}
            isEditing={isEditing}
          />
        </motion.div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Business Details */}
          <motion.div variants={cardVariants}>
            <Card className="card-hover shadow-elegant w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" /> Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-gray-700">Business Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={businessInfo.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="transition-all duration-300 border-primary/50 focus:border-primary shadow-sm"
                  />
                </div>
                <InputField
                  icon={FileText}
                  label="Business Description"
                  field="description"
                  textarea
                  placeholder="Describe your business"
                />

                  <InputField
                    icon={Package} // relevant icon for inventory/stock
                    label="Low Stock Threshold"
                    field="lowStockThreshold"
                    placeholder="Enter the minimum stock quantity before alert"
                    textarea={false}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    The minimum number of items before you receive a low stock alert. Example: 5
                  </p>


              </CardContent>
            </Card>
          </motion.div>

          {/* Bank Details */}
          <motion.div variants={cardVariants}>
            <Card className="card-hover shadow-elegant w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" /> Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <InputField icon={User} label="Account Name" field="accountName" placeholder="Enter account name"
                />
                <InputField icon={Hash} label="Account Number" field="accountNumber" placeholder="Enter account number" />
                <InputField icon={Globe} label="Bank Name" field="bankName" placeholder="Enter bank name" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Details */}
          <motion.div variants={cardVariants}>
            <Card className="card-hover shadow-elegant w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-primary" /> Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <InputField icon={Phone} label="Phone" field="phone" placeholder="Enter phone number" />
                <InputField icon={MapPin} label="Address" field="address" placeholder="Enter address" />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessInfoPage;
