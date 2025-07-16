'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { PageLoading } from '@/components/ui';
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Heart,
  Bell,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  Plus,
  BookOpen,
  Menu
} from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [recentBookings] = useState([
    {
      id: '1',
      tripName: 'Banff National Park Bus Tour',
      date: '2024-01-20',
      status: 'confirmed',
      amount: 89,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
    },
    {
      id: '2',
      tripName: 'Lake Louise Day Trip',
      date: '2024-01-15',
      status: 'completed',
      amount: 125,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop'
    }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        // No auth configured - redirect to login
        router.push('/login?redirect=/account');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/login?redirect=/account');
          return;
        }

        // Fetch user data from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .eq('tenant_id', tenant?.id)
          .single();

        if (error || !userData) {
          console.error('User data error:', error);
          router.push('/login?redirect=/account');
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login?redirect=/account');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, tenant?.id]);

  const handleSignOut = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading your account..." />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
    >
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        {/* Mobile-First Welcome Section with Stats */}
         <div 
           className="rounded-2xl shadow-xl mb-6 sm:mb-8 overflow-hidden border-2"
           style={{ 
             backgroundColor: branding.foreground_color || '#FFFFFF',
             borderColor: branding.accent_color || '#059669'
           }}
         >
           <div className="p-4 sm:p-8">
             {/* Mobile: Stacked Layout */}
             <div className="block sm:hidden">
               <h1 
                 className="text-2xl font-bold mb-3 leading-tight"
                 style={{ color: branding.textOnForeground || '#111827' }}
               >
                 Welcome back, {user.first_name}! 👋
               </h1>
               <p 
                 className="text-base mb-6 opacity-90 leading-relaxed"
                 style={{ color: branding.textOnForeground || '#6B7280' }}
               >
                 Ready for your next adventure?
               </p>
               
               {/* Mobile Stats - 2x1 Grid */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="text-center p-4 rounded-lg" style={{ backgroundColor: branding.background_color || '#F8FAFC' }}>
                   <div 
                     className="text-3xl font-bold mb-1"
                     style={{ color: branding.primary_color || '#10B981' }} 
                   >
                     {recentBookings.length}
                   </div>
                   <div 
                     className="text-sm font-medium opacity-80"
                     style={{ color: branding.textOnForeground || '#6B7280' }}
                   >
                     Total Bookings
                   </div>
                 </div>
                 <div className="text-center p-4 rounded-lg" style={{ backgroundColor: branding.background_color || '#F8FAFC' }}>
                   <div 
                     className="text-3xl font-bold mb-1"
                     style={{ color: branding.accent_color || '#059669' }}
                   >
                     {recentBookings.filter(b => b.status === 'completed').length}
                   </div>
                   <div 
                     className="text-sm font-medium opacity-80"
                     style={{ color: branding.textOnForeground || '#6B7280' }}
                   >
                     Completed
                   </div>
                 </div>
               </div>
             </div>
 
             {/* Desktop: Original Layout */}
             <div className="hidden sm:flex sm:items-center sm:justify-between">
               <div className="mb-6 md:mb-0">
                 <h1 
                   className="text-3xl font-bold mb-2"
                   style={{ color: branding.textOnForeground || '#111827' }}
                 >
                   Welcome back, {user.first_name}! 👋
                 </h1>
                 <p 
                   className="text-lg opacity-80"
                   style={{ color: branding.textOnForeground || '#6B7280' }}
                 >
                   Ready for your next adventure? Explore our latest offerings below.
                 </p>
               </div>
               <div className="flex space-x-6">
                 <div className="text-center">
                   <div 
                     className="text-2xl font-bold"
                     style={{ color: branding.primary_color || '#10B981' }}
                   >
                     {recentBookings.length}
                   </div>
                   <div 
                     className="text-sm opacity-70"
                     style={{ color: branding.textOnForeground || '#6B7280' }}
                   >
                     Total Bookings
                   </div>
                 </div>
                 <div className="text-center">
                   <div 
                     className="text-2xl font-bold"
                     style={{ color: branding.accent_color || '#059669' }}
                   >
                     {recentBookings.filter(b => b.status === 'completed').length}
                   </div>
                   <div 
                     className="text-sm opacity-70"
                     style={{ color: branding.textOnForeground || '#6B7280' }}
                   >
                     Completed
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
 
         {/* Mobile-First Layout */}
         <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
           {/* Main Content */}
           <div className="lg:col-span-2 space-y-6 sm:space-y-8">
             {/* Mobile-Optimized Quick Actions */}
             <div 
               className="rounded-2xl shadow-xl p-4 sm:p-8 border-2"
               style={{ 
                 backgroundColor: branding.foreground_color || '#FFFFFF',
                 borderColor: branding.accent_color || '#059669'
               }}
             >
               <h3 
                 className="text-xl sm:text-xl font-bold mb-5 sm:mb-6"
                 style={{ color: branding.textOnForeground || '#111827' }}
               >
                 Quick Actions
               </h3>
               
               {/* Mobile: Single Column, Desktop: 2 Columns */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <Link
                   href="/"
                   className="group relative p-5 sm:p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg min-h-[90px] sm:min-h-auto"
                   style={{ 
                     backgroundColor: branding.primary_color || '#10B981',
                     color: branding.textOnPrimary || '#FFFFFF'
                   }}
                 >
                   <div className="flex items-center justify-between">
                     <div>
                       <MapPin className="h-7 w-7 sm:h-8 sm:w-8 mb-3 sm:mb-3" />
                       <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2 leading-tight">Discover Trips</h4>
                       <p className="text-sm sm:text-sm opacity-90 leading-relaxed">
                         Explore amazing destinations
                       </p>
                     </div>
                     <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                   </div>
                 </Link>
 
                 <div 
                   className="group relative p-5 sm:p-6 rounded-xl transition-all duration-300 cursor-not-allowed opacity-60 min-h-[90px] sm:min-h-auto"
                   style={{ 
                     backgroundColor: branding.accent_color || '#059669',
                     color: branding.textOnAccent || '#FFFFFF'
                   }}
                 >
                   <div className="flex items-center justify-.between">
                     <div>
                       <Heart className="h-7 w-7 sm:h-8 sm:w-8 mb-3 sm:mb-3" />
                       <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2 leading-tight">My Wishlist</h4>
                       <p className="text-sm sm:text-sm opacity-90 leading-relaxed">
                         Save favorite trips
                       </p>
                     </div>
                     <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                       Soon
                     </div>
                   </div>
                 </div>
               </div>
             </div>
 
             {/* Mobile-Optimized Recent Bookings */}
             <div 
               className="rounded-2xl shadow-xl p-4 sm:p-8 border-2"
               style={{ 
                 backgroundColor: branding.foreground_color || '#FFFFFF',
                 borderColor: branding.accent_color || '#059669'
               }}
             >
               <div className="flex items-center justify-between mb-5 sm:mb-6">
                 <h3 
                   className="text-xl sm:text-xl font-bold"
                   style={{ color: branding.textOnForeground || '#111827' }}
                 >
                   Recent Bookings
                 </h3>
                 <Link
                   href="/account/bookings"
                   className="text-sm font-semibold hover:underline"
                   style={{ color: branding.primary_color || '#10B981' }}
                 >
                   View All
                 </Link>
               </div>
               
               {recentBookings.length > 0 ? (
                 <div className="space-y-4 sm:space-y-4">
                   {recentBookings.map((booking) => (
                     <div 
                       key={booking.id} 
                       className="p-4 sm:p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                       style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
                     >
                       {/* Mobile: Stacked Layout */}
                       <div className="block sm:hidden">
                         <div className="flex items-start space-x-4 mb-4">
                           <img
                             src={booking.image}
                             alt={booking.tripName}
                             className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                           />
                           <div className="flex-1 min-w-0">
                             <h4 
                               className="font-semibold text-base leading-tight mb-2"
                               style={{ color: branding.textOnBackground || '#111827' }}
                             >
                               {booking.tripName}
                             </h4>
                             <div className="flex items-center space-x-2">
                               <Clock className="h-4 w-4 opacity-70" style={{ color: branding.textOnBackground || '#6B7280' }} />
                               <span 
                                 className="text-sm opacity-80 font-medium"
                                 style={{ color: branding.textOnBackground || '#6B7280' }}
                               >
                                 {new Date(booking.date).toLocaleDateString()}
                               </span>
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center justify-between">
                           <p 
                             className="font-bold text-xl"
                             style={{ color: branding.textOnBackground || '#111827' }}
                           >
                             ${booking.amount}
                           </p>
                           <span 
                             className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${
                               booking.status === 'confirmed' 
                                 ? 'text-green-800' 
                                 : 'text-gray-800'
                             }`}
                             style={{ 
                               backgroundColor: booking.status === 'confirmed' 
                                 ? `${branding.accent_color || '#059669'}20` 
                                 : `${branding.textOnBackground || '#6B7280'}20`
                             }}
                           >
                             {booking.status === 'confirmed' && <CheckCircle className="h-4 w-4 mr-1" />}
                             {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                           </span>
                         </div>
                       </div>
 
                       {/* Desktop: Horizontal Layout */}
                       <div className="hidden sm:flex sm:items-center sm:space-x-4">
                         <img
                           src={booking.image}
                           alt={booking.tripName}
                           className="w-16 h-16 rounded-lg object-cover"
                         />
                         <div className="flex-1">
                           <h4 
                             className="font-semibold"
                             style={{ color: branding.textOnBackground || '#111827' }}
                           >
                             {booking.tripName}
                           </h4>
                           <div className="flex items-center space-x-2 mt-1">
                             <Clock className="h-4 w-4 opacity-70" style={{ color: branding.textOnBackground || '#6B7280' }} />
                             <span 
                               className="text-sm opacity-70"
                               style={{ color: branding.textOnBackground || '#6B7280' }}
                             >
                               {new Date(booking.date).toLocaleDateString()}
                             </span>
                           </div>
                         </div>
                         <div className="text-right">
                           <p 
                             className="font-bold text-lg"
                             style={{ color: branding.textOnBackground || '#111827' }}
                           >
                             ${booking.amount}
                           </p>
                           <span 
                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                               booking.status === 'confirmed' 
                                 ? 'text-green-800' 
                                 : 'text-gray-800'
                             }`}
                             style={{ 
                               backgroundColor: booking.status === 'confirmed' 
                                 ? `${branding.accent_color || '#059669'}20` 
                                 : `${branding.textOnBackground || '#6B7280'}20`
                             }}
                           >
                             {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                             {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                           </span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-10 sm:py-12">
                   <BookOpen className="mx-auto h-14 w-14 sm:h-16 sm:w-16 opacity-40" style={{ color: branding.textOnForeground || '#9CA3AF' }} />
                   <h3 className="mt-5 text-lg sm:text-lg font-bold" style={{ color: branding.textOnForeground || '#111827' }}>
                     No bookings yet
                   </h3>
                   <p className="mt-3 text-base opacity-80 leading-relaxed" style={{ color: branding.textOnForeground || '#6B7280' }}>
                     Start exploring and book your first adventure!
                   </p>
                   <div className="mt-7">
                     <Link
                       href="/"
                       className="inline-flex items-center px-5 sm:px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 min-h-[48px]"
                       style={{ backgroundColor: branding.primary_color || '#10B981' }}
                     >
                       <Plus className="h-5 w-5 mr-2" />
                       Browse Offerings
                     </Link>
                   </div>
                 </div>
               )}
             </div>
           </div>
 
           {/* Mobile-Optimized Sidebar */}
           <div className="space-y-6 sm:space-y-8">
             {/* Account Menu */}
             <div 
               className="rounded-2xl shadow-xl p-4 sm:p-6 border-2"
               style={{ 
                 backgroundColor: branding.foreground_color || '#FFFFFF',
                 borderColor: branding.accent_color || '#059669'
               }}
             >
               <h3 
                 className="text-lg sm:text-lg font-bold mb-5 sm:mb-6"
                 style={{ color: branding.textOnForeground || '#111827' }}
               >
                 Account Menu
               </h3>
               <nav className="space-y-3">
                 <Link
                   href="/account/bookings"
                   className="group flex items-center p-4 sm:p-4 rounded-xl transition-all duration-200 hover:shadow-md min-h-[64px]"
                   style={{ 
                     backgroundColor: branding.background_color || '#F8FAFC',
                     color: branding.textOnBackground || '#111827'
                   }}
                 >
                   <Calendar 
                     className="h-6 w-6 sm:h-6 sm:w-6 mr-4 sm:mr-4 group-hover:scale-110 transition-transform" 
                     style={{ color: branding.primary_color || '#10B981' }} 
                   />
                   <div className="flex-1">
                     <div className="font-semibold text-base sm:text-base">Booking History</div>
                     <div className="text-sm sm:text-sm opacity-70 leading-relaxed">Manage your bookings</div>
                   </div>
                   <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                 </Link>
 
                 <Link
                   href="/account/profile"
                   className="group flex items-center p-4 sm:p-4 rounded-xl transition-all duration-200 hover:shadow-md min-h-[64px]"
                   style={{ 
                     backgroundColor: branding.background_color || '#F8FAFC',
                     color: branding.textOnBackground || '#111827'
                   }}
                 >
                   <User 
                     className="h-6 w-6 sm:h-6 sm:w-6 mr-4 sm:mr-4 group-hover:scale-110 transition-transform" 
                     style={{ color: branding.accent_color || '#059669' }} 
                   />
                   <div className="flex-1">
                     <div className="font-semibold text-base sm:text-base">Profile Settings</div>
                     <div className="text-sm sm:text-sm opacity-70 leading-relaxed">Update your information</div>
                   </div>
                   <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                 </Link>
 
                 <Link
                   href="/account/security"
                   className="group flex items-center p-4 sm:p-4 rounded-xl transition-all duration-200 hover:shadow-md min-h-[64px]"
                   style={{ 
                     backgroundColor: branding.background_color || '#F8FAFC',
                     color: branding.textOnBackground || '#111827'
                   }}
                 >
                   <Settings 
                     className="h-6 w-6 sm:h-6 sm:w-6 mr-4 sm:mr-4 group-hover:scale-110 transition-transform" 
                     style={{ color: branding.primary_color || '#10B981' }} 
                   />
                   <div className="flex-1">
                     <div className="font-semibold text-base sm:text-base">Security & Privacy</div>
                     <div className="text-sm sm:text-sm opacity-70 leading-relaxed">Password, privacy & security settings</div>
                   </div>
                   <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                 </Link>
 
                 {/* Coming Soon Items */}
                 <div className="space-y-3 pt-3">
                   {[
                     { icon: CreditCard, label: 'Payment Methods', desc: 'Manage cards & billing' },
                     { icon: Bell, label: 'Notifications', desc: 'Email & SMS preferences' }
                   ].map((item, index) => (
                     <div 
                       key={index}
                       className="flex items-center p-4 sm:p-4 rounded-xl opacity-50 cursor-not-allowed min-h-[64px]"
                       style={{ backgroundColor: branding.background_color || '#F8FAFC' }}
                     >
                       <item.icon className="h-6 w-6 sm:h-6 sm:w-6 mr-4 sm:mr-4" style={{ color: branding.textOnBackground || '#9CA3AF' }} />
                       <div className="flex-1">
                         <div className="font-semibold text-base sm:text-base" style={{ color: branding.textOnBackground || '#9CA3AF' }}>
                           {item.label}
                         </div>
                         <div className="text-sm sm:text-sm opacity-70 leading-relaxed" style={{ color: branding.textOnBackground || '#9CA3AF' }}>
                           {item.desc}
                         </div>
                       </div>
                       <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600 font-medium">
                         Soon
                       </span>
                     </div>
                   ))}
                 </div>
               </nav>
             </div>
 
             {/* Account Summary Card */}
             <div 
               className="rounded-2xl shadow-xl p-4 sm:p-6 border-2"
               style={{ 
                 backgroundColor: branding.foreground_color || '#FFFFFF',
                 borderColor: branding.accent_color || '#059669'
               }}
             >
               <h3 
                 className="text-lg sm:text-lg font-bold mb-5 sm:mb-6"
                 style={{ color: branding.textOnForeground || '#111827' }}
               >
                 Account Summary
               </h3>
               <div className="space-y-4 sm:space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="font-semibold text-base sm:text-base" style={{ color: branding.textOnForeground || '#111827' }}>
                     Total Spent
                   </span>
                   <span 
                     className="text-xl sm:text-xl font-bold"
                     style={{ color: branding.primary_color || '#10B981' }}
                   >
                     ${recentBookings.reduce((sum, booking) => sum + booking.amount, 0)}
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="font-semibold text-base sm:text-base" style={{ color: branding.textOnForeground || '#111827' }}>
                     Member Since
                   </span>
                   <span className="text-base sm:text-base font-medium" style={{ color: branding.textOnForeground || '#6B7280' }}>
                     {new Date(user.created_at).toLocaleDateString()}
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="font-semibold text-base sm:text-base" style={{ color: branding.textOnForeground || '#111827' }}>
                     Status
                   </span>
                   <div className="flex items-center">
                     <Star className="h-4 w-4 mr-1" style={{ color: branding.accent_color || '#059669' }} />
                     <span className="text-base sm:text-base font-medium" style={{ color: branding.accent_color || '#059669' }}>
                       Valued Customer
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 } 