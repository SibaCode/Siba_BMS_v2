import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "@/firebase";

const checkBusinessInfo = async (userId: string) => {
  const docRef = doc(db, "businessInfo", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // List of fields that must exist for full registration
    const requiredFields = [
      "accountHolder",
      "accountNumber",
      "address",
      "bankName",
      "branchCode",
      "businessName",
      "description",
      "logo",
      "phone"
    ];

    // Check if any required field is missing or empty
    const isIncomplete = requiredFields.some(field => !data[field]);

    return isIncomplete; // true = registration not finished
  }

  return true; // if document doesn't exist, treat as incomplete
};
