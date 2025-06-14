import { useState, useEffect } from 'react';
import { 
  FiUser, FiCreditCard, FiClipboard, FiSettings, 
  FiMapPin, FiEdit, FiCamera, FiCheckCircle, FiBarChart, FiSquare, FiLogOut,
  FiSave, FiX, FiPlus, FiTrash2, FiUpload
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SubscriptionQRCode from "../components/ui/SubscriptionQRCode.jsx";
import { auth, users, userSubscriptions } from '../lib/supabase';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const navigate = useNavigate();
  
  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current authenticated user
        const { user, error: authError } = await auth.getUser();
        
        if (authError || !user) {
          throw new Error(authError?.message || 'Not authenticated');
        }
        
        // Get user profile data
        let profileData;
        const { data: existingProfile, error: profileError } = await users.getById(user.id);
        
        if (profileError && profileError.message.includes('No rows returned')) {
          // Create profile if it doesn't exist
          const newProfile = {
            user_id: user.id,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            avatar_url: user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            phone: '',
            address: '',
            fitness_goals: ['Build Muscle', 'Improve Endurance']
          };
          
          const { data: createdProfile, error: createError } = await users.create(newProfile);
          if (createError) {
            throw new Error(createError.message || 'Failed to create profile');
          }
          profileData = createdProfile[0];
        } else if (profileError) {
          throw new Error(profileError.message || 'Failed to fetch profile data');
        } else {
          profileData = existingProfile;
        }
        
        // Get user subscriptions
        const { data: subscriptionsData, error: subscriptionError } = await userSubscriptions.getByUserId(user.id);
        
        if (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
        }
        
        // Combine auth user data with profile data
        const fullUserData = {
          ...user,
          ...profileData,
          name: `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || user.email,
          avatar: profileData?.avatar_url || 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          memberSince: new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          // Mock data for demo - would be replaced with real data
          recentWorkouts: [
            { date: '2024-01-20', name: 'Full Body Strength', duration: 65, gym: 'Gold\'s Gym New Cairo' },
            { date: '2024-01-18', name: 'Cardio Session', duration: 45, gym: 'Fitness First Maadi' },
            { date: '2024-01-16', name: 'Upper Body Focus', duration: 50, gym: 'California Gym Zamalek' },
            { date: '2024-01-14', name: 'Leg Day', duration: 60, gym: 'Gold\'s Gym New Cairo' },
          ],
          favoriteGyms: [
            {
              id: 1,
              name: 'Gold\'s Gym New Cairo',
              image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              location: 'New Cairo, Cairo',
            },
            {
              id: 2,
              name: 'California Gym Zamalek',
              image: 'https://images.pexels.com/photos/13106586/pexels-photo-13106586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              location: 'Zamalek, Cairo',
            }
          ]
        };
        
        setUserData(fullUserData);
        setEditForm({
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          phone: profileData?.phone || '',
          address: profileData?.address || '',
          fitness_goals: Array.isArray(profileData?.fitness_goals) ? 
            profileData.fitness_goals : 
            (profileData?.fitness_goals ? [profileData.fitness_goals] : ['Build Muscle', 'Improve Endurance'])
        });
        
        if (subscriptionsData && subscriptionsData.length > 0) {
          const formattedSubscriptions = subscriptionsData.map(sub => ({
            ...sub,
            plan_name: sub.subscription_plans?.name || 'Unknown Plan',
            nextBillingDate: new Date(sub.end_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            amount: sub.billing_type === 'monthly' ? 
              sub.subscription_plans?.price_monthly : 
              sub.subscription_plans?.price_yearly,
            paymentHistory: [
              {
                date: sub.start_date,
                amount: sub.billing_type === 'monthly' ? 
                  sub.subscription_plans?.price_monthly : 
                  sub.subscription_plans?.price_yearly,
                status: 'completed',
                method: 'Credit Card ending in 4242'
              }
            ]
          }));
          setSubscriptions(formattedSubscriptions);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load profile data');
        if (err.message === 'Not authenticated') {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMessage(null);
    
    if (isEditing) {
      // Reset form to original data
      setEditForm({
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        fitness_goals: Array.isArray(userData?.fitness_goals) ? 
          userData.fitness_goals : 
          (userData?.fitness_goals ? [userData.fitness_goals] : ['Build Muscle', 'Improve Endurance'])
      });
    }
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate required fields
      if (!editForm.first_name.trim()) {
        throw new Error('First name is required');
      }
      
      // Filter out empty fitness goals
      const cleanedGoals = editForm.fitness_goals.filter(goal => goal.trim() !== '');
      
      const updateData = {
        ...editForm,
        fitness_goals: cleanedGoals,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await users.update(userData.user_id, updateData);
      
      if (error) {
        throw new Error(error.message || 'Failed to update profile');
      }
      
      // Update local state
      setUserData({
        ...userData,
        ...updateData,
        name: `${editForm.first_name} ${editForm.last_name}`.trim()
      });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setIsUploadingAvatar(true);
    setError(null);
    
    try {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll simulate the upload and use a placeholder
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock URL (in real app, this would be the uploaded file URL)
      const mockAvatarUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2`;
      
      // Update profile with new avatar URL
      const { error } = await users.update(userData.user_id, {
        avatar_url: mockAvatarUrl,
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to update avatar');
      }
      
      // Update local state
      setUserData({
        ...userData,
        avatar: mockAvatarUrl,
        avatar_url: mockAvatarUrl
      });
      
      setSuccessMessage('Avatar updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
  const handleAddGoal = () => {
    setEditForm({
      ...editForm,
      fitness_goals: [...editForm.fitness_goals, '']
    });
  };
  
  const handleRemoveGoal = (index) => {
    setEditForm({
      ...editForm,
      fitness_goals: editForm.fitness_goals.filter((_, i) => i !== index)
    });
  };
  
  const handleGoalChange = (index, value) => {
    const newGoals = [...editForm.fitness_goals];
    newGoals[index] = value;
    setEditForm({
      ...editForm,
      fitness_goals: newGoals
    });
  };
  
  const tabs = [
    { id: 'account', label: 'Account', icon: <FiUser /> },
    { id: 'subscription', label: 'Subscription', icon: <FiCreditCard /> },
    { id: 'progress', label: 'Progress', icon: <FiBarChart /> },
    { id: 'workouts', label: 'Workouts', icon: <FiClipboard /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];
  
  // Get active subscription for QR code
  const activeSubscription = subscriptions.find(sub => sub.status === 'active') || subscriptions[0];
  
  // Generate subscription data for QR code
  const subscriptionData = activeSubscription ? {
    membershipId: activeSubscription.membership_id || "FM12345678",
    planName: activeSubscription.plan_name || "Standard",
    memberName: userData?.name || "",
    validUntil: activeSubscription.end_date || new Date().toISOString(),
    planType: activeSubscription.billing_type || "monthly",
    gymAccess: activeSubscription.subscription_plans?.gym_access_description || "500+ Gyms",
    price: activeSubscription.amount || 49,
    currency: "USD"
  } : null;
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-light-border dark:bg-dark-border rounded-full mb-4"></div>
          <div className="h-6 bg-light-border dark:bg-dark-border rounded w-48 mb-2"></div>
          <div className="h-4 bg-light-border dark:bg-dark-border rounded w-32"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error && !userData) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <div className="text-error-600 dark:text-error-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  // If no user data, don't render the profile
  if (!userData) return null;
  
  return (
    <div className="min-h-screen py-16">
      <div className="container-custom">
        {/* Success/Error Messages */}
        {(successMessage || error) && (
          <motion.div
            className={`mb-6 p-4 rounded-lg ${
              successMessage 
                ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 text-success-700 dark:text-success-400'
                : 'bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center">
              {successMessage ? (
                <FiCheckCircle className="mr-2" />
              ) : (
                <FiX className="mr-2" />
              )}
              <span>{successMessage || error}</span>
            </div>
          </motion.div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Header - Mobile Only */}
          <div className="lg:hidden card mb-6 p-6">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img 
                    src={userData.avatar} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload-mobile"
                />
                <label
                  htmlFor="avatar-upload-mobile"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                >
                  {isUploadingAvatar ? (
                    <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <FiCamera size={14} />
                  )}
                </label>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-light-textSecondary dark:text-dark-textSecondary">
                  {activeSubscription?.plan_name || 'No Active Plan'} Member
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="card sticky top-24">
              {/* Profile Info - Desktop Only */}
              <div className="hidden lg:block mb-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                      <img 
                        src={userData.avatar} 
                        alt={userData.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload-desktop"
                    />
                    <label
                      htmlFor="avatar-upload-desktop"
                      className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                    >
                      {isUploadingAvatar ? (
                        <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <FiCamera size={14} />
                      )}
                    </label>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h1 className="text-2xl font-bold">{userData.name}</h1>
                  <p className="text-light-textSecondary dark:text-dark-textSecondary">
                    {activeSubscription?.plan_name || 'No Active Plan'} Member
                  </p>
                  <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
                    Member since {userData.memberSince}
                  </p>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <nav>
                <ul className="space-y-1">
                  {tabs.map(tab => (
                    <li key={tab.id}>
                      <button
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                            : 'hover:bg-light-background dark:hover:bg-dark-background'
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <span className="mr-3">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              {activeTab === 'account' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Personal Information</h2>
                    <button 
                      className={`btn ${isEditing ? 'btn-outline' : 'btn-outline'} flex items-center`}
                      onClick={handleEditToggle}
                      disabled={isSaving}
                    >
                      {isEditing ? <FiX className="mr-2" size={16} /> : <FiEdit className="mr-2" size={16} />}
                      <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                    </button>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            className="input w-full"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name</label>
                          <input
                            type="text"
                            className="input w-full"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                            placeholder="Enter your last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Phone Number</label>
                          <input
                            type="tel"
                            className="input w-full"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email Address</label>
                          <input
                            type="email"
                            className="input w-full"
                            value={userData.email}
                            disabled
                          />
                          <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <textarea
                          className="input w-full h-20 resize-none"
                          value={editForm.address}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          placeholder="Enter your address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Fitness Goals</label>
                        <div className="space-y-2">
                          {editForm.fitness_goals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                className="input flex-1"
                                value={goal}
                                onChange={(e) => handleGoalChange(index, e.target.value)}
                                placeholder="Enter fitness goal"
                              />
                              <button
                                type="button"
                                className="btn btn-outline p-2 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                                onClick={() => handleRemoveGoal(index)}
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-outline flex items-center"
                            onClick={handleAddGoal}
                          >
                            <FiPlus className="mr-2" size={16} />
                            Add Goal
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          className="btn btn-primary flex items-center"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          <FiSave className="mr-2" size={16} />
                          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button 
                          className="btn btn-outline"
                          onClick={handleEditToggle}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Full Name</h3>
                          <p className="font-medium">{userData.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Email Address</h3>
                          <p className="font-medium">{userData.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Phone Number</h3>
                          <p className="font-medium">{userData.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">Address</h3>
                          <p className="font-medium">{userData.address || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <hr className="my-8 border-light-border dark:border-dark-border" />
                      
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">Fitness Goals</h2>
                        <div className="flex flex-wrap gap-2">
                          {userData.fitness_goals?.length > 0 ? (
                            userData.fitness_goals.map((goal, index) => (
                              <span 
                                key={index}
                                className="bg-light-background dark:bg-dark-background px-3 py-1 rounded-full text-sm"
                              >
                                {goal}
                              </span>
                            ))
                          ) : (
                            <p className="text-light-textSecondary dark:text-dark-textSecondary">
                              No fitness goals set yet
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <hr className="my-8 border-light-border dark:border-dark-border" />
                      
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Favorite Gyms</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userData.favoriteGyms.map(gym => (
                            <div key={gym.id} className="flex bg-light-background dark:bg-dark-background rounded-lg overflow-hidden">
                              <div className="w-20 h-20 flex-shrink-0">
                                <img 
                                  src={gym.image} 
                                  alt={gym.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium">{gym.name}</h3>
                                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center">
                                  <FiMapPin size={12} className="mr-1" />
                                  {gym.location}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'subscription' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Subscription Details</h2>
                  
                  {subscriptions.length > 0 ? (
                    <div className="space-y-6">
                      {subscriptions.map((subscription, index) => (
                        <div key={subscription.id} className="bg-light-background dark:bg-dark-background p-6 rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1 block">
                                {subscription.status === 'active' ? 'Current Plan' : 'Previous Plan'}
                              </span>
                              <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                                {subscription.plan_name}
                              </h3>
                              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                {subscription.billing_type} billing • ${subscription.amount}/{subscription.billing_type === 'monthly' ? 'month' : 'year'}
                              </p>
                            </div>
                            <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                subscription.status === 'active' 
                                  ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                              }`}>
                                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                              </span>
                              {subscription.status === 'active' && (
                                <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
                                  Next billing: {subscription.nextBillingDate}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {subscription.status === 'active' && (
                            <div className="flex flex-wrap gap-3 mb-4">
                              <button 
                                className="btn btn-primary flex items-center"
                                onClick={() => setShowQRCode(true)}
                              >
                                <FiSquare className="mr-2" size={16} />
                                Show QR Code
                              </button>
                              <button className="btn btn-outline">
                                Upgrade Plan
                              </button>
                              <button className="btn btn-outline text-error-600 dark:text-error-400">
                                Cancel Subscription
                              </button>
                            </div>
                          )}
                          
                          {/* Payment History */}
                          <div className="mt-6">
                            <h4 className="font-semibold mb-3">Payment History</h4>
                            <div className="space-y-2">
                              {subscription.paymentHistory?.map((payment, paymentIndex) => (
                                <div key={paymentIndex} className="flex items-center justify-between p-3 bg-white dark:bg-dark-card rounded-lg">
                                  <div>
                                    <p className="font-medium">
                                      ${payment.amount} - {subscription.plan_name}
                                    </p>
                                    <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                      {new Date(payment.date).toLocaleDateString()} • {payment.method}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    payment.status === 'completed'
                                      ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400'
                                      : 'bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Plan Benefits */}
                      {activeSubscription && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-4">Plan Benefits</h3>
                          
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <FiCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                              <span>Access to {activeSubscription.subscription_plans?.gym_access_description || '500+ gyms'} nationwide</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                              <span>24/7 gym access at all locations</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                              <span>Premium workout plans and tracking tools</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                              <span>Advanced health tracking and metrics</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                              <span>Digital membership with QR code access</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💳</div>
                      <h3 className="text-xl font-semibold mb-2">No Active Subscription</h3>
                      <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6">
                        You don't have any active subscriptions. Choose a plan to get started!
                      </p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/plans')}
                      >
                        View Plans
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'workouts' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Workout History</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="text-left bg-light-background dark:bg-dark-background">
                        <tr>
                          <th className="p-3 rounded-tl-lg">Date</th>
                          <th className="p-3">Workout</th>
                          <th className="p-3">Gym</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3 rounded-tr-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-light-border dark:divide-dark-border">
                        {userData.recentWorkouts.map((workout, index) => (
                          <tr key={index} className="hover:bg-light-background dark:hover:bg-dark-background">
                            <td className="p-3">
                              {new Date(workout.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="p-3 font-medium">{workout.name}</td>
                            <td className="p-3 text-sm text-light-textSecondary dark:text-dark-textSecondary">
                              {workout.gym}
                            </td>
                            <td className="p-3">{workout.duration} min</td>
                            <td className="p-3">
                              <button className="text-primary-600 dark:text-primary-500 font-medium">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
                    
                    <div className="bg-light-background dark:bg-dark-background p-6 rounded-lg text-center">
                      <p className="text-light-textSecondary dark:text-dark-textSecondary mb-4">
                        You don't have any upcoming workout sessions scheduled.
                      </p>
                      <button className="btn btn-primary">
                        Schedule a Workout
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'progress' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card bg-primary-50 dark:bg-primary-900/20 p-6">
                      <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Workouts This Month</p>
                      <h3 className="text-3xl font-bold text-primary-700 dark:text-primary-500">12</h3>
                      <p className="text-sm text-primary-600/70 dark:text-primary-400/70 mt-1">+3 from last month</p>
                    </div>
                    
                    <div className="card bg-secondary-50 dark:bg-secondary-900/20 p-6">
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Total Hours</p>
                      <h3 className="text-3xl font-bold text-secondary-700 dark:text-secondary-500">24.5</h3>
                      <p className="text-sm text-secondary-600/70 dark:text-secondary-400/70 mt-1">+5.5 from last month</p>
                    </div>
                    
                    <div className="card bg-accent-50 dark:bg-accent-900/20 p-6">
                      <p className="text-sm text-accent-600 dark:text-accent-400 mb-1">Gym Visits</p>
                      <h3 className="text-3xl font-bold text-accent-700 dark:text-accent-500">8</h3>
                      <p className="text-sm text-accent-600/70 dark:text-accent-400/70 mt-1">+2 from last month</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
                    
                    <div className="space-y-6">
                      {userData.fitness_goals?.map((goal, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{goal}</span>
                            <span>{60 + index * 15}%</span>
                          </div>
                          <div className="w-full bg-light-background dark:bg-dark-background rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${60 + index * 15}%` }} 
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex bg-light-background dark:bg-dark-background p-4 rounded-lg">
                        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-3 rounded-full mr-4">
                          <FiCheckCircle size={24} />
                        </div>
                        <div>
                          <h4 className="font-medium">10 Workouts Completed</h4>
                          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                            January 18, 2024
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex bg-light-background dark:bg-dark-background p-4 rounded-lg">
                        <div className="bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 p-3 rounded-full mr-4">
                          <FiCheckCircle size={24} />
                        </div>
                        <div>
                          <h4 className="font-medium">First Personal Training Session</h4>
                          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                            January 12, 2024
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'workout-reminders', label: 'Workout reminders' },
                          { id: 'subscription-updates', label: 'Subscription updates' },
                          { id: 'new-features', label: 'New features and improvements' },
                          { id: 'gym-updates', label: 'Updates from your favorite gyms' },
                          { id: 'promotional', label: 'Promotional emails and special offers' }
                        ].map(option => (
                          <div key={option.id} className="flex items-center justify-between p-3 bg-light-background dark:bg-dark-background rounded-lg">
                            <label htmlFor={option.id} className="cursor-pointer">{option.label}</label>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                              <input
                                type="checkbox"
                                id={option.id}
                                className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border-2 rounded-full appearance-none cursor-pointer peer border-light-border dark:border-dark-border checked:translate-x-6 checked:border-primary-600 dark:checked:border-primary-500"
                                defaultChecked={['workout-reminders', 'subscription-updates', 'new-features'].includes(option.id)}
                              />
                              <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-light-border dark:bg-dark-border peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'show-profile', label: 'Show my profile to other members' },
                          { id: 'share-workouts', label: 'Share my workouts with friends' },
                          { id: 'location-tracking', label: 'Enable location tracking for gym suggestions' }
                        ].map(option => (
                          <div key={option.id} className="flex items-center justify-between p-3 bg-light-background dark:bg-dark-background rounded-lg">
                            <label htmlFor={option.id} className="cursor-pointer">{option.label}</label>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                              <input
                                type="checkbox"
                                id={option.id}
                                className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border-2 rounded-full appearance-none cursor-pointer peer border-light-border dark:border-dark-border checked:translate-x-6 checked:border-primary-600 dark:checked:border-primary-500"
                                defaultChecked={['location-tracking'].includes(option.id)}
                              />
                              <span className="absolute inset-0 transition duration-200 ease-in-out rounded-full bg-light-border dark:bg-dark-border peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full btn btn-outline justify-start">
                          Change Password
                        </button>
                        <button 
                          onClick={handleSignOut}
                          className="w-full btn btn-outline justify-start"
                        >
                          <FiLogOut className="mr-2" /> Sign Out
                        </button>
                        <button className="w-full btn btn-outline justify-start text-error-600 dark:text-error-400 border-error-200 dark:border-error-800 hover:bg-error-50 dark:hover:bg-error-900/20">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && subscriptionData && (
        <SubscriptionQRCode
          subscriptionData={subscriptionData}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};

export default Profile;