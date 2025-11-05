import React, { useState, useEffect } from 'react';
import { AlertCircle, Droplet, MapPin, Phone, Clock, UserPlus, LogIn, LogOut, User } from 'lucide-react';

const BloodBuddyApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('auth');
  
  // Auth form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [isSignup, setIsSignup] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  
  const compatibleBloodTypes = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  // Load data from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    if (currentUser && users.length > 0) {
      saveToStorage();
    }
  }, [users, requests]);

  const loadFromStorage = async () => {
    try {
      const storedUsers = await window.storage.get('bloodbuddy_users');
      const storedRequests = await window.storage.get('bloodbuddy_requests');
      const storedCurrentUser = await window.storage.get('bloodbuddy_current_user');
      
      if (storedUsers && storedUsers.value) {
        setUsers(JSON.parse(storedUsers.value));
      }
      if (storedRequests && storedRequests.value) {
        setRequests(JSON.parse(storedRequests.value));
      }
      if (storedCurrentUser && storedCurrentUser.value) {
        const user = JSON.parse(storedCurrentUser.value);
        setCurrentUser(user);
        setView('dashboard');
      }
    } catch (error) {
      console.log('No stored data found, starting fresh');
      // Initialize with empty arrays
      setUsers([]);
      setRequests([]);
    }
  };

  const saveToStorage = async () => {
    try {
      await window.storage.set('bloodbuddy_users', JSON.stringify(users));
      await window.storage.set('bloodbuddy_requests', JSON.stringify(requests));
      if (currentUser) {
        await window.storage.set('bloodbuddy_current_user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const saveUserData = async (usersData, requestsData, currentUserData) => {
    try {
      await window.storage.set('bloodbuddy_users', JSON.stringify(usersData));
      await window.storage.set('bloodbuddy_requests', JSON.stringify(requestsData));
      await window.storage.set('bloodbuddy_current_user', JSON.stringify(currentUserData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as Indian phone number
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  const validateLocation = (position) => {
    const { latitude, longitude } = position.coords;
    
    // Basic coordinate validation
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setLocationError('Invalid coordinates detected');
      return false;
    }

    // Check if coordinates are too precise (possible spoofing)
    const latPrecision = latitude.toString().split('.')[1]?.length || 0;
    const lngPrecision = longitude.toString().split('.')[1]?.length || 0;
    if (latPrecision > 8 || lngPrecision > 8) {
      setLocationError('Location coordinates are suspiciously precise');
      return false;
    }

    // Check if location is within India (rough boundaries)
    if (latitude < 6 || latitude > 37 || longitude < 68 || longitude > 97) {
      setLocationError('Location appears to be outside India');
      return false;
    }

    return true;
  };

  const getLocation = () => {
    setLocationError('');
    setShowCoordinates(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (validateLocation(position)) {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(newLocation);
            setShowCoordinates(true);
            alert('✓ Location captured successfully!');
          } else {
            // If validation fails, use approximate location (Bangalore)
            const approxLocation = {
              lat: 12.9716 + (Math.random() - 0.5) * 0.1,
              lng: 77.5946 + (Math.random() - 0.5) * 0.1
            };
            setUserLocation(approxLocation);
            alert('⚠️ Using approximate location for demo purposes');
          }
        },
        (error) => {
          let errorMessage = 'Location access denied. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Unknown error occurred.';
          }
          setLocationError(errorMessage);
          
          // Fallback to approximate location
          const approxLocation = {
            lat: 12.9716 + (Math.random() - 0.5) * 0.1,
            lng: 77.5946 + (Math.random() - 0.5) * 0.1
          };
          setUserLocation(approxLocation);
          alert('⚠️ Using approximate location for demo purposes');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      // Fallback to approximate location
      const approxLocation = {
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lng: 77.5946 + (Math.random() - 0.5) * 0.1
      };
      setUserLocation(approxLocation);
      alert('⚠️ Using approximate location for demo purposes');
    }
  };

  const validate = () => {
    const errors = {};
    const cleanedPhone = phone.replace(/\D/g, '');
    const cleanedPincode = pincode.replace(/\D/g, '');

    // Age validation
    if (isSignup) {
      if (!age) {
        errors.age = 'Age is required';
      } else {
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
          errors.age = 'Age must be between 18 and 65 years';
        }
      }

      // Address validation
      if (!address.trim()) {
        errors.address = 'Address is required';
      } else if (address.trim().length < 10) {
        errors.address = 'Please enter a complete address';
      }

      // City validation
      if (!city.trim()) {
        errors.city = 'City is required';
      } else if (city.trim().length < 3) {
        errors.city = 'Please enter a valid city name';
      }

      // State validation
      if (!state) {
        errors.state = 'Please select your state';
      }

      // Pincode validation
      if (!cleanedPincode) {
        errors.pincode = 'Pincode is required';
      } else if (cleanedPincode.length !== 6) {
        errors.pincode = 'Pincode must be 6 digits';
      }
    }

    // Name validation (for signup)
    if (isSignup && !name.trim()) {
      errors.name = 'Full name is required';
    } else if (isSignup && name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (isSignup && !/^[a-zA-Z\s]*$/.test(name.trim())) {
      errors.name = 'Name should only contain letters and spaces';
    }

    // Phone validation
    if (!cleanedPhone) {
      errors.phone = 'Phone number is required';
    } else if (cleanedPhone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      errors.phone = 'Please enter a valid Indian mobile number';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (password.length > 20) {
      errors.password = 'Password must not exceed 20 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Location validation
    if (isSignup && !userLocation) {
      errors.location = 'Location access is required for signup';
    }

    // Blood type validation (for signup)
    if (isSignup && !bloodTypes.includes(bloodType)) {
      errors.bloodType = 'Please select a valid blood type';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setFormErrors({});
    
    if (!validate()) {
      // Show first error in alert for accessibility
      const firstError = Object.values(formErrors)[0];
      alert(firstError);
      return;
    }
    
    const cleanedPhone = phone.replace(/\D/g, '');
    
    if (isSignup) {

      // Check if phone already exists
      if (users.find(u => u.phone === cleanedPhone)) {
        alert('This phone number is already registered. Please login.');
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        age: parseInt(age),
        phone: cleanedPhone,
        password,
        bloodType,
        location: userLocation,
        address: address.trim(),
        city: city.trim(),
        state,
        pincode: pincode.replace(/\D/g, ''),
        createdAt: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      
      // Save immediately after signup
      saveUserData(updatedUsers, requests, newUser);
      
      setView('dashboard');
      alert('Account created successfully!');
    } else {
      // Login
      const user = users.find(u => u.phone === cleanedPhone && u.password === password);
      if (user) {
        // Update user location if provided
        let updatedUser = user;
        if (userLocation) {
          updatedUser = { ...user, location: userLocation };
          const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
          setUsers(updatedUsers);
          saveUserData(updatedUsers, requests, updatedUser);
        } else {
          saveUserData(users, requests, user);
        }
        
        setCurrentUser(updatedUser);
        setView('dashboard');
        alert('Logged in successfully!');
      } else {
        alert('Invalid phone number or password. Try signing up first!');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('bloodbuddy_current_user');
    } catch (error) {
      console.log('Logout cleanup');
    }
    setCurrentUser(null);
    setView('auth');
    setName('');
    setPhone('');
    setPassword('');
    setUserLocation(null);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

    const createSOS = () => {
    if (!currentUser.location) {
      alert('Location not available. Please update your location from settings.');
      return;
    }
    
    const newRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      requesterName: currentUser.name,
      requesterPhone: currentUser.phone,
      bloodNeeded: currentUser.bloodType,
      location: currentUser.location,
      address: currentUser.address,
      city: currentUser.city,
      state: currentUser.state,
      pincode: currentUser.pincode,
      status: 'active',
      createdAt: new Date().toISOString(),
      acceptedBy: []
    };    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    saveToStorage();
    alert('🚨 SOS Alert Sent! Nearby compatible donors will be notified.');
  };

  const getNearbyRequests = () => {
    if (!currentUser) return [];
    
    return requests
      .filter(req => {
        if (req.userId === currentUser.id) return false;
        if (req.status !== 'active') return false;
        
        const distance = calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          req.location.lat,
          req.location.lng
        );
        
        const compatible = compatibleBloodTypes[req.bloodNeeded]?.includes(currentUser.bloodType);
        
        return distance < 10 && compatible;
      })
      .map(req => ({
        ...req,
        distance: calculateDistance(
          currentUser.location.lat,
          currentUser.location.lng,
          req.location.lat,
          req.location.lng
        ).toFixed(1)
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const getMyRequests = () => {
    return requests.filter(req => req.userId === currentUser.id);
  };

  const acceptRequest = (requestId) => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          acceptedBy: [...req.acceptedBy, {
            donorId: currentUser.id,
            donorName: currentUser.name,
            donorPhone: currentUser.phone,
            donorBloodType: currentUser.bloodType,
            acceptedAt: new Date().toISOString()
          }]
        };
      }
      return req;
    });
    
    setRequests(updatedRequests);
    
    const request = requests.find(r => r.id === requestId);
    alert(`✓ Request Accepted!\n\n📞 Call Now: ${formatPhoneNumber(request.requesterPhone)}\n👤 Name: ${request.requesterName}\n🩸 Blood Type: ${request.bloodNeeded}`);
  };

  const callDonor = (donorPhone) => {
    window.location.href = `tel:${donorPhone}`;
  };

  const declineRequest = (requestId) => {
    alert('Request declined. It will remain visible to other donors.');
  };

  // Auth Screen
  if (view === 'auth') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ maxWidth: '400px', margin: '50px auto', background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Droplet size={48} color="#e53e3e" style={{ margin: '0 auto 10px' }} />
            <h1 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '8px' }}>BloodBuddy</h1>
            <p style={{ color: '#718096', fontSize: '14px' }}>Connecting donors via phone in emergencies</p>
          </div>
          
          <div>
            {isSignup && (
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${formErrors.name ? '#fc8181' : '#e2e8f0'}`, 
                    borderRadius: '8px', 
                    fontSize: '16px' 
                  }}
                />
                {formErrors.name && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.name}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength="10"
                pattern="[0-9]{10}"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: `2px solid ${formErrors.phone ? '#fc8181' : '#e2e8f0'}`, 
                  borderRadius: '8px', 
                  fontSize: '16px' 
                }}
              />
              {formErrors.phone && (
                <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.phone}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: `2px solid ${formErrors.password ? '#fc8181' : '#e2e8f0'}`, 
                  borderRadius: '8px', 
                  fontSize: '16px' 
                }}
              />
              {formErrors.password && (
                <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.password}
                </div>
              )}
            </div>
            
            {isSignup && (
              <>
                {/* Age Input */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="number"
                    placeholder="Age (18-65 years)"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    max="65"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `2px solid ${formErrors.age ? '#fc8181' : '#e2e8f0'}`, 
                      borderRadius: '8px', 
                      fontSize: '16px' 
                    }}
                  />
                  {formErrors.age && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.age}
                    </div>
                  )}
                </div>

                {/* Address Input */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `2px solid ${formErrors.address ? '#fc8181' : '#e2e8f0'}`, 
                      borderRadius: '8px', 
                      fontSize: '16px' 
                    }}
                  />
                  {formErrors.address && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.address}
                    </div>
                  )}
                </div>

                {/* City Input */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `2px solid ${formErrors.city ? '#fc8181' : '#e2e8f0'}`, 
                      borderRadius: '8px', 
                      fontSize: '16px' 
                    }}
                  />
                  {formErrors.city && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.city}
                    </div>
                  )}
                </div>

                {/* State Selection */}
                <div style={{ marginBottom: '12px' }}>
                  <select 
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `2px solid ${formErrors.state ? '#fc8181' : '#e2e8f0'}`, 
                      borderRadius: '8px', 
                      fontSize: '16px' 
                    }}
                  >
                    <option value="">Select State</option>
                    {indianStates.map(stateName => (
                      <option key={stateName} value={stateName}>{stateName}</option>
                    ))}
                  </select>
                  {formErrors.state && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.state}
                    </div>
                  )}
                </div>

                {/* Pincode Input */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength="6"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `2px solid ${formErrors.pincode ? '#fc8181' : '#e2e8f0'}`, 
                      borderRadius: '8px', 
                      fontSize: '16px' 
                    }}
                  />
                  {formErrors.pincode && (
                    <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.pincode}
                    </div>
                  )}
                </div>

                {/* Blood Type Selection */}
                <select 
                  value={bloodType} 
                  onChange={(e) => setBloodType(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    margin: '8px 0', 
                    border: `2px solid ${formErrors.bloodType ? '#fc8181' : '#e2e8f0'}`, 
                    borderRadius: '8px', 
                    fontSize: '16px' 
                  }}
                >
                  {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </>
            )}
            
            {/* Location section */}
            <div style={{ marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={getLocation}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  margin: '8px 0', 
                  background: userLocation ? '#48bb78' : '#4299e1', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <MapPin size={20} />
                {userLocation ? '✓ Location Captured' : isSignup ? 'Enable Location (Required)' : 'Update Location (Optional)'}
              </button>
              
              {locationError && (
                <div style={{
                  margin: '8px 0',
                  padding: '8px 12px',
                  background: '#fff5f5',
                  border: '1px solid #fc8181',
                  borderRadius: '6px',
                  color: '#c53030',
                  fontSize: '14px'
                }}>
                  ⚠️ {locationError}
                </div>
              )}

              {showCoordinates && userLocation && (
                <div style={{
                  margin: '8px 0',
                  padding: '8px 12px',
                  background: '#f0fff4',
                  border: '1px solid #68d391',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#2f855a'
                }}>
                  📍 Your coordinates:
                  <br />
                  Latitude: {userLocation.lat.toFixed(6)}
                  <br />
                  Longitude: {userLocation.lng.toFixed(6)}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAuth}
              style={{ 
                width: '100%', 
                padding: '14px', 
                margin: '16px 0 8px', 
                background: '#e53e3e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isSignup ? <><UserPlus size={20} /> Sign Up</> : <><LogIn size={20} /> Login</>}
            </button>
          </div>
          
          <p 
            style={{ textAlign: 'center', marginTop: '16px', color: '#4299e1', cursor: 'pointer', fontSize: '14px' }} 
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </p>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  const nearbyRequests = getNearbyRequests();
  const myRequests = getMyRequests();

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Droplet size={32} />
            <h1 style={{ fontSize: '24px', margin: 0 }}>BloodBuddy</h1>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              border: '2px solid white',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* User Info Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> {currentUser.name} ({currentUser.age} years)
              </h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#718096' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Droplet size={16} color="#e53e3e" /> Blood Type: <strong>{currentUser.bloodType}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={16} /> {formatPhoneNumber(currentUser.phone)}
                </span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#718096' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} /> {currentUser.address}, {currentUser.city}, {currentUser.state} - {currentUser.pincode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOS Button */}
        <button 
          onClick={createSOS}
          style={{ 
            width: '100%', 
            padding: '24px', 
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(229, 62, 62, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <AlertCircle size={32} /> 🚨 NEED BLOOD - SEND SOS
        </button>

        {/* My Requests */}
        {myRequests.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={24} /> My Active Requests
            </h2>
            {myRequests.map(req => (
              <div key={req.id} style={{ 
                background: '#fff5f5',
                border: '2px solid #fc8181',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>
                      Blood Type Needed: {req.bloodNeeded}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#718096' }}>
                      Created: {new Date(req.createdAt).toLocaleTimeString()}
                    </p>
                    <div style={{ fontSize: '14px', color: '#4a5568', background: '#f7fafc', padding: '8px', borderRadius: '6px' }}>
                      <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} /> <strong>Your Location:</strong>
                      </p>
                      <div style={{ margin: '0 0 8px 22px', background: '#edf2f7', padding: '8px', borderRadius: '6px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#2d3748' }}>
                          <strong>GPS Coordinates:</strong><br />
                          Lat: {req.location.lat.toFixed(6)}<br />
                          Long: {req.location.lng.toFixed(6)}
                        </p>
                      </div>
                      <p style={{ margin: '0', paddingLeft: '22px' }}>
                        <strong>Address:</strong><br />
                        {req.address},<br />
                        {req.city}, {req.state}<br />
                        {req.pincode}
                      </p>
                    </div>
                  </div>
                  <span style={{ 
                    background: '#48bb78', 
                    color: 'white', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ACTIVE
                  </span>
                </div>
                
                {req.acceptedBy.length > 0 ? (
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#48bb78', fontSize: '16px' }}>
                      ✓ {req.acceptedBy.length} Donor(s) Accepted!
                    </p>
                    {req.acceptedBy.map((donor, idx) => (
                      <div key={idx} style={{ 
                        padding: '12px', 
                        borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none',
                        background: '#f7fafc',
                        borderRadius: '8px',
                        marginTop: idx > 0 ? '8px' : '0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                            {donor.donorName} ({donor.donorBloodType})
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Phone size={16} color="#e53e3e" />
                          <a 
                            href={`tel:${donor.donorPhone}`}
                            style={{ 
                              fontSize: '16px', 
                              color: '#e53e3e', 
                              textDecoration: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            {formatPhoneNumber(donor.donorPhone)}
                          </a>
                        </div>
                        <button
                          onClick={() => callDonor(donor.donorPhone)}
                          style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '10px',
                            background: '#48bb78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Phone size={16} /> Call Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#718096' }}>
                    Waiting for donors to respond...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Nearby Requests */}
        <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={24} /> Nearby Blood Requests ({nearbyRequests.length})
        </h2>
        
        {nearbyRequests.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '12px', 
            textAlign: 'center',
            color: '#718096'
          }}>
            <Droplet size={48} color="#cbd5e0" style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: '16px' }}>No active requests nearby at the moment.</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>You'll be notified when someone needs your blood type.</p>
          </div>
        ) : (
          nearbyRequests.map(request => (
            <div key={request.id} style={{ 
              background: 'white',
              border: '2px solid #e53e3e',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: '#e53e3e' }}>
                    🩸 {request.bloodNeeded} Blood Needed
                  </p>
                  <div style={{ fontSize: '14px', color: '#718096' }}>
                    <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} /> <strong>{request.distance}km</strong>
                    </p>
                    <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} /> {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={18} /> {request.requesterName}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Phone size={18} color="#e53e3e" />
                  <a 
                    href={`tel:${request.requesterPhone}`}
                    style={{ 
                      fontSize: '18px', 
                      color: '#e53e3e', 
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    {formatPhoneNumber(request.requesterPhone)}
                  </a>
                </div>
                {/* Location Details */}
                <div style={{ fontSize: '14px', color: '#4a5568', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> <strong>Location Details:</strong>
                  </p>
                  <div style={{ margin: '0 0 8px 22px', background: '#edf2f7', padding: '8px', borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#2d3748' }}>
                      <strong>GPS Coordinates:</strong><br />
                      Lat: {request.location.lat.toFixed(6)}<br />
                      Long: {request.location.lng.toFixed(6)}
                    </p>
                  </div>
                  <p style={{ margin: '0', paddingLeft: '22px' }}>
                    <strong>Address:</strong><br />
                    {request.address},<br />
                    {request.city}, {request.state}<br />
                    {request.pincode}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => acceptRequest(request.id)}
                  style={{ 
                    flex: 1,
                    padding: '14px', 
                    background: '#48bb78',
                    color: 'white', 
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Phone size={18} /> Accept & Call
                </button>
                <button 
                  onClick={() => declineRequest(request.id)}
                  style={{ 
                    flex: 1,
                    padding: '14px', 
                    background: '#e2e8f0',
                    color: '#4a5568', 
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BloodBuddyApp;
