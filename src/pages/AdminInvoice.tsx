import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download, FileText } from "lucide-react";
import { doc, getDoc , collection , getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Variant {
  images: string[];
  type: string;
  sellingPrice: number;
  color: string;
  description: string;
  stockPrice: number;
  size: string;
  stockQuantity: number;
}

interface InvoiceItem {
  quantity: number;
  price: number;
  total: number;
  productName: string;
  serviceName: string;
  description: string;
  productId?: string;
  variantIndex?: number;
  variant?: Variant; // ✅ Add this to match actual data
}

interface CustomerInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  firstName: string;
  createdAt: string;
}

interface InvoiceData {
  orderId: string;
  invoiceNumber: string;
  orderDate: string;
  dueDate: string;
  customerInfo: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveryStatus: string;
}

interface BusinessInfo {
  name: string;
  logo?: string;
  createdAt: { seconds: number; nanoseconds: number };
  email: string;
  accountHolder:string;
  accountNumber:string;
  address:string;
  bankName:string;
  branchCode:string;
  description:string;
  phone:string;
}
const AdminInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
console.log(invoice)

const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
const [loadingBusinessInfo, setLoadingBusinessInfo] = useState(true);
  // Helper to safely format currency numbers
  const formatCurrency = (num?: number) =>
    typeof num === "number" ? num.toFixed(2) : "0.00";
console.log(businessInfo)
  // Ref for the invoice DOM element we want to export
  const invoiceRef = document.getElementById("invoice-content");


  const handleDownload = () => {
    const input = document.getElementById("invoice-content");
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      // A4 size in mm: 210 x 297
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice?.orderId || "unknown"}.pdf`);
    });
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as InvoiceData;
          setInvoice(data);
          console.log(data)
        } else {
          console.error("Invoice not found for orderId:", id);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);
  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "businessInfo", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as BusinessInfo;
            setBusinessInfo(data);
          } else {
            console.error("No businessInfo found with that ID");
            setBusinessInfo(null);
          }
        } catch (error) {
          console.error("Error fetching businessInfo:", error);
          setBusinessInfo(null);
        } finally {
          setLoadingBusinessInfo(false);
        }
      } else {
        setBusinessInfo(null);
        setLoadingBusinessInfo(false);
      }
    });
  
    return () => unsubscribe();
  }, []);
  if (loading) return <div className="text-center mt-20">Loading invoice...</div>;
  if (!invoice) return <div className="text-center mt-20 text-red-500">Invoice not found.</div>;
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">
              Invoice #{invoice.orderId}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      
      <div
        id="invoice-content"
        className="max-w-4xl mx-auto px-4 py-8 bg-white"
        style={{ color: "#000" }} >
          <div className="flex justify-center mb-6">
            
        {businessInfo?.logo ? (
         
          <img
              src={businessInfo.logo}
              alt={`${businessInfo.name} Logo`}
              className="h-20 object-contain"
            />
        ) : (
          <div className="h-20 w-40 flex items-center justify-center bg-gray-200 text-gray-500 uppercase tracking-widest font-bold">
            LOGO
          </div>
        )}
      </div>

        <Card>
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-primary">{businessInfo?.name}</h2>
                <div className="text-sm text-muted-foreground">
                  {/* <p>{businessInfo?.[0]?.address}</p>
                  <p>{businessInfo?.[0]?.phone}</p> */}
                  <p>{businessInfo?.email}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p><strong>Invoice #:</strong> {invoice.orderId}</p>
                <p><strong>Order Date:</strong> {formatDate(invoice.createdAt)}</p>

                {/* <p><strong>Due Date:</strong> {invoice.createdAt || "N/A"}</p> */}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Customer */}
            <div className="mb-8">
                <h3 className="font-semibold mb-2">Billed To:</h3>
                <div className="bg-muted p-4 rounded">
                  <p className="font-medium">{invoice.customerInfo?.name || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                    {/* {invoice.customerInfo?.address || "N/A"} */}
                  </p>
                  <p className="text-sm">{invoice.customerInfo?.phone || "N/A"}</p>
                  {/* <p className="text-sm">{invoice.customerInfo?.email || "N/A"}</p> */}
                </div>
              </div>


            {/* Items Table */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Items</h3>
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 border">Item</th>
                    <th className="text-center p-2 border">Qty</th>
                    <th className="text-right p-2 border">Price</th>
                    <th className="text-right p-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2 border">
                      <div className="font-medium">{item.productName || item.serviceName}</div>
                      <div className="text-sm text-muted-foreground">
                     <p>  {item.variant?.type} -  {item.variant?.color}</p>
                     <p> {item.variant?.size || item.description}</p>
                      </div>
                    </td>
                    <td className="text-center p-2 border">{item.quantity}</td>
                    <td className="text-right p-2 border">R{formatCurrency(item.price)}</td>
                    <td className="text-right p-2 border">R{formatCurrency(item.total)}</td>
                  </tr>
                ))}

                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
            <div className="mb-6">
            <h3 className="font-semibold mb-2">Order status</h3>
            <div className="bg-muted p-4 rounded text-sm space-y-1">
              <p><strong>Payment Method:</strong> {invoice.paymentMethod || "N/A"}</p>
              <p><strong>Delivery Status:</strong> {invoice.deliveryStatus || "N/A"}</p>
            </div>
          </div>
            <div className="mb-6">
            <h3 className="font-semibold mb-2">Bank Account Details</h3>
            <div className="bg-muted p-4 rounded text-sm space-y-1">
              <p><strong>Account Holder:</strong> {businessInfo?.accountHolder || "N/A"}</p>
              <p><strong>Bank:</strong> {businessInfo?.bankName || "N/A"}</p>
              <p><strong>Account Number:</strong> {businessInfo?.accountNumber || "N/A"}</p>
              <p><strong>Branch Code:</strong> {businessInfo?.branchCode || "N/A"}</p>
            </div>
          </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>Thanks for shopping with us!</p>
              <p>Need help? Contact {businessInfo?.[0]?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminInvoice;
