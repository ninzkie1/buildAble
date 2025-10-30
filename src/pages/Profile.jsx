import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import config from '../config/config';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      formattedAddress: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    }
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      // Set profile with default values for missing fields
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || '',
          formattedAddress: data.address?.formattedAddress || '',
          coordinates: {
            lat: data.address?.coordinates?.lat || 0,
            lng: data.address?.coordinates?.lng || 0
          }
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error(error.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false); // Disable editing mode after successful update
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGeocoding = async () => {
    try {
      const testAddress = "123 Test St, Manila, Philippines";
      const response = await fetch(`${config.apiUrl}/api/users/test-geocode`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: testAddress })
      });

      const data = await response.json();
      console.log('Geocoding test response:', data);
      
      if (data.status === 'OK') {
        toast.success('Geocoding API is working!');
      } else {
        toast.error(`API Error: ${data.status}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Failed to test geocoding');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold">Address Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                value={profile.address?.street || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  address: { ...profile.address, street: e.target.value }
                })}
                className="w-full p-2 border rounded"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={profile.address?.city || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, city: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State/Province</label>
                <input
                  type="text"
                  value={profile.address?.state || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, state: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  value={profile.address?.postalCode || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, postalCode: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={profile.address?.country || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, country: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Show verified address and coordinates if available */}
          {profile.address?.formattedAddress && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Verified Address</h3>
              <p className="text-gray-600">{profile.address.formattedAddress}</p>
              {profile.address?.coordinates && (
                <p className="text-gray-500 text-sm mt-1">
                  Coordinates: {profile.address.coordinates.lat.toFixed(6)}, {profile.address.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`mr-2 px-4 py-2 rounded font-semibold transition-all ${
              isEditing ? 'bg-gray-300 text-gray-700' : 'bg-[#B84937] text-white hover:bg-[#9E3C2D]'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          {isEditing && (
            <button
              type="submit"
              disabled={loading}
              className="bg-[#B84937] text-white px-4 py-2 rounded hover:bg-[#9E3C2D] disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}