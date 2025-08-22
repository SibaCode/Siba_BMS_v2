import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [hasLogo, setHasLogo] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkBusinessInfo = async () => {
      try {
        const docRef = doc(db, "businessInfo", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const logo = docSnap.data().logo;
          setHasLogo(typeof logo === "string" && logo.trim() !== "");
        } else {
          setHasLogo(false);
        }
      } catch (error) {
        console.error("Error checking business info:", error);
        setHasLogo(false);
      } finally {
        setChecking(false);
      }
    };

    checkBusinessInfo();
  }, [user]);

  if (loading || checking) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Redirect if logo is missing
  if (hasLogo === false && location.pathname !== "/admin/settings/business-info") {
    return <Navigate to="/admin/settings/business-info" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
