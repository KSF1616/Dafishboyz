
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Address } from '@/types/checkout';

interface AddressFormProps {
  address: Address;
  onChange: (address: Address) => void;
  title: string;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
];

export const AddressForm: React.FC<AddressFormProps> = ({ address, onChange, title }) => {
  const update = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={address.firstName} onChange={(e) => update('firstName', e.target.value)} className="bg-gray-800 border-gray-700" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={address.lastName} onChange={(e) => update('lastName', e.target.value)} className="bg-gray-800 border-gray-700" />
        </div>
      </div>
      <div>
        <Label htmlFor="line1">Address Line 1</Label>
        <Input id="line1" value={address.line1} onChange={(e) => update('line1', e.target.value)} className="bg-gray-800 border-gray-700" />
      </div>
      <div>
        <Label htmlFor="line2">Address Line 2 (Optional)</Label>
        <Input id="line2" value={address.line2 || ''} onChange={(e) => update('line2', e.target.value)} className="bg-gray-800 border-gray-700" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={address.city} onChange={(e) => update('city', e.target.value)} className="bg-gray-800 border-gray-700" />
        </div>
        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input id="state" value={address.state} onChange={(e) => update('state', e.target.value)} className="bg-gray-800 border-gray-700" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" value={address.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="bg-gray-800 border-gray-700" />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={address.country} onValueChange={(v) => update('country', v)}>
            <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
            <SelectContent>
              {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
