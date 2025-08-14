
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  Folder,
  Receipt,
  TrendingUp,
  Store,
  ChevronDown,Calendar
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      { title: "Manage Inventory", url: "/admin/inventory" },
      { title: "Categories", url: "/admin/settings/categories" },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    items: [
      { title: "Orders", url: "/admin/orders" },
      { title: "Customers", url: "/admin/customers" },
      // { title: "Invoices", url: "/admin/invoice" },
    ],
  },
  {
    title: "Services",
    icon: Calendar,
    items: [
      { title: "Manage Services", url: "/admin/services" },
      // { title: "Customers", url: "/admin/customers" },
      // { title: "Invoices", url: "/admin/invoice" },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    items: [
      { title: "Expenses", url: "/admin/finance/expenses" },
      { title: "Bookings", url: "/admin/bookings" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Business Info", url: "/admin/settings/business-info" },
      // { title: "General", url: "#" },
    ],
  },
];

function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>(["Inventory", "Sales", "Finance","Services", "Settings"]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(item => item !== groupTitle)
        : [...prev, groupTitle]
    );
  };
  const { user, bizName, logout } = useAuth();

  const isActive = (url: string) => currentPath === url;
  const isGroupActive = (items: { url: string }[]) => 
    items.some(item => currentPath === item.url);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-primary" />
          <div className="text-xl font-bold">
          {user && (
        <div>
        <strong>{bizName}</strong>
           {user && (
    <Button size="sm" variant="ghost" onClick={logout} className="self-start">
     {user.uid}
    </Button>
  )}
        </div>
      )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <Collapsible 
                    open={openGroups.includes(item.title)}
                    onOpenChange={() => toggleGroup(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        className={`w-full justify-between ${
                          isGroupActive(item.items) ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          openGroups.includes(item.title) ? 'rotate-180' : ''
                        }`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <Link to={subItem.url}>
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AdminHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="border-b bg-background px-3 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-lg sm:text-2xl font-semibold truncate">{title}</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative flex-1 sm:flex-none">
            <Input 
              placeholder="Search..." 
              className="w-full sm:w-64 pr-10"
            />
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  headerActions?: React.ReactNode;
}

export function AdminLayout({ children, title, headerActions }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <AdminHeader title={title}>
            {headerActions}
          </AdminHeader>
          <main className="flex-1 p-3 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
