import React, { useState ,useEffect} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '@/firebase'; // Adjust path

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

const Services: React.FC = () => {
    const [packages, setPackages] = useState<ServicePackage[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 0,
    price: 0
  });
  useEffect(() => {
    const fetchPackages = async () => {
      const querySnapshot = await getDocs(collection(db, "servicePackages"));
      const fetchedPackages: ServicePackage[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPackages.push({ id: doc.id, ...doc.data() } as ServicePackage);
      });
      setPackages(fetchedPackages);
    };

    fetchPackages();
  }, []);
  const resetForm = () => {
    setFormData({ name: '', description: '', duration: 0, price: 0 });
  };

  const handleCreate = async () => {
    try {
      const docRef = await addDoc(collection(db, "servicePackages"), formData);
      const newPackage: ServicePackage = { id: docRef.id, ...formData };
      setPackages([...packages, newPackage]);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  
  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);  // Store the package you're about to edit in state
    setFormData({
      name: pkg.name,           // Populate form fields with the current package's data
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
    });
    setIsEditOpen(true);       // Open the edit modal/dialog
  };
  

  const handleUpdate = async () => {
    if (!editingPackage) return;
    try {
      const docRef = doc(db, "servicePackages", editingPackage.id);
      await updateDoc(docRef, formData);
      setPackages(packages.map(pkg => 
        pkg.id === editingPackage.id ? { ...pkg, ...formData } : pkg
      ));
      setIsEditOpen(false);
      setEditingPackage(null);
      resetForm();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "servicePackages", id));
      setPackages(packages.filter(pkg => pkg.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 // Filter packages based on search query


 return (
  <div className="p-6 space-y-6">
  {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Package Management</h1>
        <p className="text-gray-600">Create and manage your service offerings</p>
      </div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </DialogTrigger>
        <DialogContent>
          {/* Create Modal Content */}
        </DialogContent>
      </Dialog>
    </div>

    {/* Search Bar above the grid */}
    <div className="mb-4">
      <Input
        placeholder="Search service packages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Service Packages Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPackages.length === 0 ? (
        <p className="text-gray-500 col-span-full">No packages found.</p>
      ) : (
        filteredPackages.map(pkg => (
          <Card key={pkg.id} className="relative">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{pkg.name}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      {/* Delete Confirmation */}
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-lg font-semibold text-green-600">
                  R{pkg.price.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>

    {/* Edit Package Modal */}
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent>
        {/* Edit Modal Content */}
      </DialogContent>
    </Dialog>
  </div>
);


};

export default Services;
