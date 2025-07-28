
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  price: number;
}

const Booking: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock data - in real app this would come from API
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      service: 'Hair Styling',
      date: '2024-01-15',
      time: '10:00',
      duration: 90,
      status: 'confirmed',
      price: 85
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      service: 'Beard Trim',
      date: '2024-01-15',
      time: '14:30',
      duration: 45,
      status: 'pending',
      price: 35
    },
    {
      id: '3',
      customerName: 'Emma Davis',
      service: 'Facial Treatment',
      date: '2024-01-16',
      time: '11:00',
      duration: 60,
      status: 'confirmed',
      price: 120
    },
    {
      id: '4',
      customerName: 'Alex Rodriguez',
      service: 'Massage Therapy',
      date: '2024-01-16',
      time: '15:00',
      duration: 90,
      status: 'completed',
      price: 150
    }
  ]);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const todayBookings = bookings.filter(booking => {
    const today = new Date().toISOString().split('T')[0];
    return booking.date === today;
  });

  const upcomingBookings = bookings.filter(booking => {
    const today = new Date().toISOString().split('T')[0];
    return booking.date > today;
  });

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const todayRevenue = todayBookings.reduce((sum, booking) => sum + booking.price, 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking & Scheduling</h1>
          <p className="text-gray-600">Manage appointments and your calendar</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Ready to serve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue}</div>
            <p className="text-xs text-muted-foreground">From {todayBookings.length} bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Daily Schedule
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">{formatDate(currentDate)}</span>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Time slots */}
            <div className="grid gap-4">
              {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => {
                const booking = bookings.find(b => 
                  b.date === currentDate.toISOString().split('T')[0] && 
                  b.time === time
                );
                
                return (
                  <div key={time} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-16 text-sm font-medium text-gray-600">{time}</div>
                    {booking ? (
                      <div className="flex-1 flex items-center justify-between bg-blue-50 p-3 rounded">
                        <div>
                          <div className="font-medium">{booking.service}</div>
                          <div className="text-sm text-gray-600">{booking.customerName}</div>
                          <div className="text-xs text-gray-500">{booking.duration} minutes • ${booking.price}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(booking.status)}
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-3 border-dashed border-2 border-gray-200 rounded text-gray-400">
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Plus className="mr-1 h-3 w-3" />
                          Available
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-gray-600">{booking.service}</div>
                      <div className="text-xs text-gray-500">
                        {booking.date} at {booking.time} • {booking.duration} minutes
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">${booking.price}</div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your calendar is clear for the coming days.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Booking;