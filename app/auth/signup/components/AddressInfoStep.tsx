'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';

interface State {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  state_id: string;
}

interface AddressInfoStepProps {
  formData: {
    address: string;
    city: string;
    cityId?: string;
    state: string;
    stateId?: string;
    pincode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  isSubmitting: boolean;
  isPending: boolean;
}

export function AddressInfoStep({
  formData,
  handleChange,
  handleSelectChange,
  isSubmitting,
  isPending,
}: AddressInfoStepProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [openCityDialog, setOpenCityDialog] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { getStates } = await import('@/actions/auth');
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.stateId) {
        setCities([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const { getCitiesByState } = await import('@/actions/auth');
        const citiesData = await getCitiesByState(formData.stateId);
        setCities(citiesData);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [formData.stateId]);

  const handleStateChange = (value: string) => {
    const selectedState = states.find(state => state.id === value);
    if (selectedState) {
      handleSelectChange('state', selectedState.name);
      handleSelectChange('stateId', selectedState.id);
      // Reset city when state changes
      handleSelectChange('city', '');
      handleSelectChange('cityId', '');
    }
  };

  const handleCityChange = (value: string) => {
    const selectedCity = cities.find(city => city.id === value);
    if (selectedCity) {
      handleSelectChange('city', selectedCity.name);
      handleSelectChange('cityId', selectedCity.id);
    }
  };

  const handleAddNewCity = async () => {
    if (!newCity.trim() || !formData.stateId) return;
    
    setIsAddingCity(true);
    try {
      const { addNewCity } = await import('@/actions/auth');
      const addedCity = await addNewCity(newCity.trim(), formData.stateId);
      
      // Update cities list
      setCities(prev => [...prev, addedCity]);
      
      // Select the newly added city
      handleSelectChange('city', addedCity.name);
      handleSelectChange('cityId', addedCity.id);
      
      // Reset form and close dialog
      setNewCity('');
      setOpenCityDialog(false);
    } catch (error) {
      console.error('Error adding new city:', error);
    } finally {
      setIsAddingCity(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Business Address</h3>
      <p className="text-sm text-muted-foreground">
        Where is your business located?
      </p>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="123 Business St"
          value={formData.address}
          onChange={handleChange}
          disabled={isPending || isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={formData.stateId || ''}
            onValueChange={handleStateChange}
            disabled={isPending || isSubmitting || isLoadingStates}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingStates ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                states.map(state => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="city">City</Label>
            <Dialog open={openCityDialog} onOpenChange={setOpenCityDialog}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground"
                  disabled={!formData.stateId || isPending || isSubmitting}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add New City
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New City</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={formData.state}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newCity">City Name</Label>
                    <Input
                      id="newCity"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Enter city name"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenCityDialog(false)}
                      disabled={isAddingCity}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddNewCity}
                      disabled={!newCity.trim() || isAddingCity}
                    >
                      {isAddingCity && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add City
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Select
            value={formData.cityId || ''}
            onValueChange={handleCityChange}
            disabled={isPending || isSubmitting || isLoadingCities || !formData.stateId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCities ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : cities.length > 0 ? (
                cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No cities found. Add a new city.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">ZIP/Postal Code</Label>
        <Input
          id="pincode"
          name="pincode"
          placeholder="10001"
          value={formData.pincode}
          onChange={handleChange}
          disabled={isPending || isSubmitting}
          required
        />
      </div>
    </div>
  );
}
