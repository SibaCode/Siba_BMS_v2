
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, Plus, Edit, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getAuth } from "firebase/auth";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  date: z.date({
    required_error: "Date is required"
  }),
  notes: z.string().optional()
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Expense extends Omit<ExpenseFormData, 'date'> {
  id: string;
  date: Date;
}

const expenseCategories = [
  "Inventory",
  "Marketing",
  "Rent",
  "Utilities",
  "Equipment",
  "Office Supplies",
  "Transportation",
  "Professional Services",
  "Insurance",
  "Other"
];

const AdminExpenseManager = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const auth = getAuth();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "",
      date: new Date(),
      notes: ""
    }
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
  
      const q = query(
        collection(db, "expenses"),
        orderBy("date", "desc")
      );
  
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate()
          };
        })
        .filter(exp => exp.userId === userId); // <-- filter by current user
  
      setExpenses(expensesData as Expense[]);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({ title: "Error", description: "Failed to load expenses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    form.reset({
      title: "",
      amount: 0,
      category: "",
      date: new Date(),
      notes: ""
    });
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    form.reset(expense);
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

 
  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return toast({ title: "Error", description: "User not logged in", variant: "destructive" });
  
      if (editingExpense) {
        const docRef = doc(db, "expenses", editingExpense.id);
        await updateDoc(docRef, { ...data, userId });
        toast({ title: "Success", description: "Expense updated successfully" });
      } else {
        await addDoc(collection(db, "expenses"), { ...data, userId });
        toast({ title: "Success", description: "Expense created successfully" });
      }
  
      await fetchExpenses();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({ title: "Error", description: "Failed to save expense", variant: "destructive" });
    }
  };
  

  const deleteExpense = async (expenseId: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await deleteDoc(doc(db, "expenses", expenseId));
      toast({
        title: "Success",
        description: "Expense deleted successfully"
      });
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const categoryMatch = categoryFilter === "all" || expense.category === categoryFilter;
  
    const dateMatch =
      (!startDate || expense.date >= startDate) &&
      (!endDate || expense.date <= endDate);
  
    return categoryMatch && dateMatch;
  });
  
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return <div className="p-6">Loading expenses...</div>;
  }
  return (
    <Card className="p-2 sm:p-4">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <DollarSign className="h-4 w-4" />
            <span>Expense Manager</span>
          </CardTitle>
  
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto text-sm" onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm p-4">
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </DialogTitle>
              </DialogHeader>
  
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Expense title" {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Amount (R) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseCategories.map((category) => (
                              <SelectItem key={category} value={category} className="text-sm">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm">Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full text-left text-sm pl-2"
                              >
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto text-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto text-sm">
                      {editingExpense ? "Update" : "Create"} Expense
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
  
      <CardContent className="p-2 sm:p-4">
        {/* Filters and Total */}
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-36 text-sm">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 justify-start text-left text-sm">
                  {startDate ? format(startDate, "PPP") : "Start date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
  
            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 justify-start text-left text-sm">
                  {endDate ? format(endDate, "PPP") : "End date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
  
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => {
                setCategoryFilter("all");
                setStartDate(null);
                setEndDate(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
  
          <div className="mt-2 sm:mt-0 text-center sm:text-right">
        <span className="inline-block px-4 py-2 bg-orange-500 text-white text-lg sm:text-xl font-bold rounded-lg shadow-md">
          Total: R{totalExpenses.toFixed(2)}
        </span>
      </div>        
      </div>
      
        {/* Expense Cards */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No expenses found. Add your first expense!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="border rounded-lg p-2 shadow-sm bg-white flex flex-col justify-between text-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold">{expense.title}</h3>
                    <p className="text-gray-500">{format(expense.date, "MMM dd, yyyy")}</p>
                    <p className="text-gray-500">{expense.category}</p>
                  </div>
                  <div className="font-semibold">R{expense.amount.toFixed(2)}</div>
                </div>
                {expense.notes && <p className="text-gray-600 mb-1">{expense.notes}</p>}
                <div className="flex justify-end space-x-1 mt-auto">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(expense)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteExpense(expense.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  
};

export default AdminExpenseManager;
