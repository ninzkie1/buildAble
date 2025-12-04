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
      region: '',
      province: '',
      city: '',
      barangay: '',
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
  const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [regionHasProvinces, setRegionHasProvinces] = useState(true);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBarangayOpen, setIsBarangayOpen] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchProfile();
    }
  }, [user]);

  const fetchCollection = async (path, errorMessage) => {
    try {
      const response = await fetch(`${PSGC_BASE_URL}${path}`);
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return Array.isArray(data) ? data.sort((a, b) => (a.name || '').localeCompare(b.name || '')) : [];
    } catch (err) {
      console.error(err);
      toast.error(errorMessage);
      return [];
    }
  };

  useEffect(() => {
    const loadRegions = async () => {
      const regionData = await fetchCollection('/regions/', 'Failed to load regions');
      setRegions(regionData);
    };
    loadRegions();
  }, []);

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
          region: data.address?.region || '',
          province: data.address?.province || '',
          city: data.address?.city || '',
          barangay: data.address?.barangay || '',
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

  const handleRegionSelect = async (code) => {
    const region = regions.find(r => r.code === code) || null;
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setProvinces([]);
    setCities([]);
    setBarangays([]);

    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        region: region ? region.regionName || region.name : '',
        province: '',
        city: '',
        barangay: ''
      }
    }));

    if (!code) {
      setRegionHasProvinces(true);
      return;
    }

    const provinceList = await fetchCollection(`/regions/${code}/provinces/`, 'Failed to load provinces');
    setRegionHasProvinces(provinceList.length > 0);
    setProvinces(provinceList);

    if (provinceList.length === 0) {
      const regionCities = await fetchCollection(`/regions/${code}/cities-municipalities/`, 'Failed to load cities');
      setCities(regionCities);
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          state: region ? region.name : prev.address.state,
          province: region ? region.name : prev.address.province
        }
      }));
    }
  };

  const handleProvinceSelect = async (code) => {
    const province = provinces.find(p => p.code === code) || null;
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedBarangay(null);
    setCities([]);
    setBarangays([]);

    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        province: province ? province.name : '',
        city: '',
        barangay: ''
      }
    }));

    if (!code) return;

    const provinceCities = await fetchCollection(
      `/provinces/${code}/cities-municipalities/`,
      'Failed to load cities'
    );
    setCities(provinceCities);
  };

  const handleCitySelect = async (code) => {
    const city = cities.find(c => c.code === code) || null;
    setSelectedCity(city);
    setSelectedBarangay(null);
    setBarangays([]);

    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: city ? city.name : '',
        barangay: ''
      }
    }));

    if (!code) return;

    const cityBarangays = await fetchCollection(
      `/cities-municipalities/${code}/barangays/`,
      'Failed to load barangays'
    );
    setBarangays(cityBarangays);
  };

  const handleBarangaySelect = (code) => {
    const barangay = barangays.find(b => b.code === code) || null;
    setSelectedBarangay(barangay);

    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        barangay: barangay ? barangay.name : ''
      }
    }));
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
              {/* Region dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Region</label>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsRegionOpen(prev => !prev)}
                  className="w-full p-2 border rounded flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-60 bg-white"
                >
                  <span className="truncate">
                    {selectedRegion?.name || profile.address?.region || 'Select Region'}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">
                    {isRegionOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isRegionOpen && (
                  <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-red-50/90 text-sm shadow-lg">
                    {regions.map((region) => (
                      <button
                        key={region.code}
                        type="button"
                        onClick={() => {
                          handleRegionSelect(region.code);
                          setIsRegionOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-gray-900 hover:bg-red-100 ${
                          selectedRegion?.code === region.code ? 'bg-red-100 font-semibold' : ''
                        }`}
                      >
                        {region.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Province dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Province</label>
                <button
                  type="button"
                  disabled={loading || !regionHasProvinces || !selectedRegion}
                  onClick={() => {
                    if (loading || !regionHasProvinces || !selectedRegion) return;
                    setIsProvinceOpen(prev => !prev);
                  }}
                  className="w-full p-2 border rounded flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-60 bg-white"
                >
                  <span className="truncate">
                    {selectedProvince?.name ||
                      profile.address?.province ||
                      (regionHasProvinces ? 'Select Province' : 'No provinces required')}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">
                    {isProvinceOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isProvinceOpen && regionHasProvinces && selectedRegion && (
                  <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-red-50/90 text-sm shadow-lg">
                    {provinces.map((province) => (
                      <button
                        key={province.code}
                        type="button"
                        onClick={() => {
                          handleProvinceSelect(province.code);
                          setIsProvinceOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-gray-900 hover:bg-red-100 ${
                          selectedProvince?.code === province.code ? 'bg-red-100 font-semibold' : ''
                        }`}
                      >
                        {province.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* City dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">City / Municipality</label>
                <button
                  type="button"
                  disabled={
                    loading ||
                    !selectedRegion ||
                    (regionHasProvinces && !selectedProvince) ||
                    !cities.length
                  }
                  onClick={() => {
                    if (
                      loading ||
                      !selectedRegion ||
                      (regionHasProvinces && !selectedProvince) ||
                      !cities.length
                    ) {
                      return;
                    }
                    setIsCityOpen(prev => !prev);
                  }}
                  className="w-full p-2 border rounded flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-60 bg-white"
                >
                  <span className="truncate">
                    {selectedCity?.name || profile.address?.city || 'Select City / Municipality'}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">
                    {isCityOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isCityOpen && (
                  <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-red-50/90 text-sm shadow-lg">
                    {cities.map((city) => (
                      <button
                        key={city.code}
                        type="button"
                        onClick={() => {
                          handleCitySelect(city.code);
                          setIsCityOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-gray-900 hover:bg-red-100 ${
                          selectedCity?.code === city.code ? 'bg-red-100 font-semibold' : ''
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Barangay dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <button
                  type="button"
                  disabled={loading || !selectedCity || !barangays.length}
                  onClick={() => {
                    if (loading || !selectedCity || !barangays.length) return;
                    setIsBarangayOpen(prev => !prev);
                  }}
                  className="w-full p-2 border rounded flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-60 bg-white"
                >
                  <span className="truncate">
                    {selectedBarangay?.name || profile.address?.barangay || 'Select Barangay'}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">
                    {isBarangayOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isBarangayOpen && (
                  <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-red-50/90 text-sm shadow-lg">
                    {barangays.map((barangay) => (
                      <button
                        key={barangay.code}
                        type="button"
                        onClick={() => {
                          handleBarangaySelect(barangay.code);
                          setIsBarangayOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-2 text-left text-gray-900 hover:bg-red-100 ${
                          selectedBarangay?.code === barangay.code ? 'bg-red-100 font-semibold' : ''
                        }`}
                      >
                        {barangay.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">State / Province (Legacy)</label>
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