import React, { useEffect, useState } from 'react';

export default function AddressModal({ isOpen, onClose, onSave, loading }) {
  const [address, setAddress] = useState({
    street: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [error, setError] = useState('');

  const fetchCollection = async (path, errorMessage) => {
    try {
      const response = await fetch(`${PSGC_BASE_URL}${path}`);
      if (!response.ok) throw new Error(errorMessage);
      const data = await response.json();
      return Array.isArray(data)
        ? data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        : [];
    } catch (err) {
      console.error(err);
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

  const handleRegionChange = async (code) => {
    setSelectedRegionCode(code);
    setSelectedProvinceCode('');
    setSelectedCityCode('');
    setProvinces([]);
    setCities([]);
    setBarangays([]);

    const region = regions.find(r => r.code === code) || null;
    setAddress(prev => ({
      ...prev,
      region: region ? region.regionName || region.name : '',
      province: '',
      city: '',
      barangay: ''
    }));

    if (!code) return;
    const provinceList = await fetchCollection(`/regions/${code}/provinces/`, 'Failed to load provinces');
    setProvinces(provinceList);

    if (provinceList.length === 0) {
      const regionCities = await fetchCollection(
        `/regions/${code}/cities-municipalities/`,
        'Failed to load cities'
      );
      setCities(regionCities);
    }
  };

  const handleProvinceChange = async (code) => {
    setSelectedProvinceCode(code);
    setSelectedCityCode('');
    setCities([]);
    setBarangays([]);

    const province = provinces.find(p => p.code === code) || null;
    setAddress(prev => ({
      ...prev,
      province: province ? province.name : '',
      city: '',
      barangay: ''
    }));

    if (!code) return;
    const provinceCities = await fetchCollection(
      `/provinces/${code}/cities-municipalities/`,
      'Failed to load cities'
    );
    setCities(provinceCities);
  };

  const handleCityChange = async (code) => {
    setSelectedCityCode(code);
    setBarangays([]);

    const city = cities.find(c => c.code === code) || null;
    setAddress(prev => ({
      ...prev,
      city: city ? city.name : '',
      barangay: ''
    }));

    if (!code) return;
    const cityBarangays = await fetchCollection(
      `/cities-municipalities/${code}/barangays/`,
      'Failed to load barangays'
    );
    setBarangays(cityBarangays);
  };

  const handleBarangayChange = (code) => {
    const barangay = barangays.find(b => b.code === code) || null;
    setAddress(prev => ({
      ...prev,
      barangay: barangay ? barangay.name : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address.street) {
      setError('Street address is required.');
      return;
    }
    if (!address.region || !selectedRegionCode) {
      setError('Please select a region.');
      return;
    }
    if (!address.city) {
      setError('Please select a city / municipality.');
      return;
    }
    if (!address.barangay) {
      setError('Please select a barangay.');
      return;
    }
    if (!address.state) {
      setError('State / province is required.');
      return;
    }
    if (!address.postalCode) {
      setError('Postal code is required.');
      return;
    }
    if (!address.country) {
      setError('Country is required.');
      return;
    }

    setError('');
    onSave(address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Delivery Address</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  value={selectedRegionCode}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="">{address.region || 'Select Region'}</option>
                  {regions.map(region => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <select
                  value={selectedProvinceCode}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={!provinces.length}
                  className="w-full p-2 border rounded bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">{address.province || 'Select Province'}</option>
                  {provinces.map(province => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City / Municipality</label>
                <select
                  value={selectedCityCode}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!cities.length}
                  className="w-full p-2 border rounded bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">{address.city || 'Select City / Municipality'}</option>
                  {cities.map(city => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Barangay</label>
                <select
                  value={address.barangay}
                  onChange={(e) => handleBarangayChange(e.target.value)}
                  disabled={!barangays.length}
                  className="w-full p-2 border rounded bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">{address.barangay || 'Select Barangay'}</option>
                  {barangays.map(barangay => (
                    <option key={barangay.code} value={barangay.code}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">State / Province (Legacy)</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                required
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#B84937] text-white rounded hover:bg-[#9E3C2D] disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}