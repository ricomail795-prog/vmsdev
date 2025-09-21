import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Heart, FileText, PenTool, Upload } from 'lucide-react';

interface ProfileData {
  first_name?: string;
  surname?: string;
  date_of_birth?: string;
  building_house?: string;
  street_address?: string;
  city_town?: string;
  county_state?: string;
  postal_zip?: string;
  country?: string;
  telephone?: string;
  nationality?: string;
}

interface NextOfKinData {
  full_name?: string;
  relationship?: string;
  building_house?: string;
  street_address?: string;
  city_town?: string;
  county_state?: string;
  postal_zip?: string;
  country?: string;
  telephone?: string;
}

interface MedicalData {
  doctor_name?: string;
  doctor_contact?: string;
  medical_certificate_expiry?: string;
  chronic_illness?: boolean;
  chronic_illness_details?: string;
  current_medications?: boolean;
  current_medications_details?: string;
  recent_surgery?: boolean;
  recent_surgery_details?: string;
  allergies?: boolean;
  allergies_details?: string;
  medical_fitness_declaration?: boolean;
}

interface CertificateData {
  certificate_type?: string;
  valid_from?: string;
  expiry_date?: string;
  issued_by?: string;
  file_upload?: File | null;
}

interface SignatureData {
  signature_data?: string;
  signature_type?: string;
  created_at?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({});
  const [nextOfKin, setNextOfKin] = useState<NextOfKinData>({});
  const [medical, setMedical] = useState<MedicalData>({});
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [signature, setSignature] = useState<SignatureData>({});
  const [newCertificate, setNewCertificate] = useState<CertificateData>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [messages, setMessages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileData, kinData, medicalData, certData, signatureData] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getNextOfKin(),
          apiClient.getMedicalInfo(),
          apiClient.getCertificates(),
          apiClient.getElectronicSignature()
        ]);
        
        setProfile(profileData);
        setNextOfKin(kinData);
        setMedical(medicalData);
        setCertificates(certData);
        setSignature(signatureData);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const setMessage = (section: string, message: string) => {
    setMessages(prev => ({ ...prev, [section]: message }));
    setTimeout(() => {
      setMessages(prev => ({ ...prev, [section]: '' }));
    }, 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('profile');
    try {
      await apiClient.updateProfile(profile);
      setMessage('profile', 'Personal information updated successfully!');
    } catch (error) {
      setMessage('profile', 'Failed to update personal information');
    } finally {
      setSaving('');
    }
  };

  const handleNextOfKinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('nextofkin');
    try {
      await apiClient.updateNextOfKin(nextOfKin);
      setMessage('nextofkin', 'Next of kin information updated successfully!');
    } catch (error) {
      setMessage('nextofkin', 'Failed to update next of kin information');
    } finally {
      setSaving('');
    }
  };

  const handleMedicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('medical');
    try {
      await apiClient.updateMedicalInfo(medical);
      setMessage('medical', 'Medical information updated successfully!');
    } catch (error) {
      setMessage('medical', 'Failed to update medical information');
    } finally {
      setSaving('');
    }
  };

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('certificates');
    try {
      await apiClient.createCertificate(newCertificate);
      setMessage('certificates', 'Certificate added successfully!');
      setNewCertificate({});
      const updatedCerts = await apiClient.getCertificates();
      setCertificates(updatedCerts);
    } catch (error) {
      setMessage('certificates', 'Failed to add certificate');
    } finally {
      setSaving('');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = async () => {
    setSaving('signature');
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      try {
        await apiClient.updateElectronicSignature({
          signature_data: signatureData,
          signature_type: 'drawn'
        });
        setSignature({ signature_data: signatureData, signature_type: 'drawn' });
        setMessage('signature', 'Electronic signature saved successfully!');
      } catch (error) {
        setMessage('signature', 'Failed to save electronic signature');
      } finally {
        setSaving('');
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal information and maritime compliance data</p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="personal" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold">Personal Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {messages.profile && (
                <Alert variant={messages.profile.includes('success') ? 'default' : 'destructive'}>
                  <AlertDescription>{messages.profile}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={profile.first_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Surname</label>
                  <Input
                    value={profile.surname || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, surname: e.target.value }))}
                    placeholder="Surname"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Building/House</label>
                    <Input
                      value={profile.building_house || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, building_house: e.target.value }))}
                      placeholder="Building/House number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                      value={profile.street_address || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, street_address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City/Town</label>
                    <Input
                      value={profile.city_town || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, city_town: e.target.value }))}
                      placeholder="City/Town"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">County/State</label>
                    <Input
                      value={profile.county_state || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, county_state: e.target.value }))}
                      placeholder="County/State"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Postal/ZIP Code</label>
                    <Input
                      value={profile.postal_zip || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, postal_zip: e.target.value }))}
                      placeholder="Postal/ZIP code"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={profile.country || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telephone</label>
                  <Input
                    value={profile.telephone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, telephone: e.target.value }))}
                    placeholder="Telephone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nationality</label>
                  <Input
                    value={profile.nationality || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="Nationality"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving === 'profile'}>
                {saving === 'profile' ? 'Saving...' : 'Update Personal Information'}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="nextofkin" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">Next of Kin</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <form onSubmit={handleNextOfKinSubmit} className="space-y-4">
              {messages.nextofkin && (
                <Alert variant={messages.nextofkin.includes('success') ? 'default' : 'destructive'}>
                  <AlertDescription>{messages.nextofkin}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={nextOfKin.full_name || ''}
                    onChange={(e) => setNextOfKin(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Full name of next of kin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relationship *</label>
                  <Select value={nextOfKin.relationship || ''} onValueChange={(value) => setNextOfKin(prev => ({ ...prev, relationship: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telephone *</label>
                <Input
                  value={nextOfKin.telephone || ''}
                  onChange={(e) => setNextOfKin(prev => ({ ...prev, telephone: e.target.value }))}
                  placeholder="Contact telephone number"
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Building/House</label>
                    <Input
                      value={nextOfKin.building_house || ''}
                      onChange={(e) => setNextOfKin(prev => ({ ...prev, building_house: e.target.value }))}
                      placeholder="Building/House number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                      value={nextOfKin.street_address || ''}
                      onChange={(e) => setNextOfKin(prev => ({ ...prev, street_address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City/Town</label>
                    <Input
                      value={nextOfKin.city_town || ''}
                      onChange={(e) => setNextOfKin(prev => ({ ...prev, city_town: e.target.value }))}
                      placeholder="City/Town"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">County/State</label>
                    <Input
                      value={nextOfKin.county_state || ''}
                      onChange={(e) => setNextOfKin(prev => ({ ...prev, county_state: e.target.value }))}
                      placeholder="County/State"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Postal/ZIP Code</label>
                    <Input
                      value={nextOfKin.postal_zip || ''}
                      onChange={(e) => setNextOfKin(prev => ({ ...prev, postal_zip: e.target.value }))}
                      placeholder="Postal/ZIP code"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={nextOfKin.country || ''}
                      onChange={(e) => setNextOfKin(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={saving === 'nextofkin'}>
                {saving === 'nextofkin' ? 'Saving...' : 'Update Next of Kin'}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="medical" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold">Medical Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <form onSubmit={handleMedicalSubmit} className="space-y-4">
              {messages.medical && (
                <Alert variant={messages.medical.includes('success') ? 'default' : 'destructive'}>
                  <AlertDescription>{messages.medical}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Doctor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Doctor Name</label>
                    <Input
                      value={medical.doctor_name || ''}
                      onChange={(e) => setMedical(prev => ({ ...prev, doctor_name: e.target.value }))}
                      placeholder="Primary doctor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Doctor Contact</label>
                    <Input
                      value={medical.doctor_contact || ''}
                      onChange={(e) => setMedical(prev => ({ ...prev, doctor_contact: e.target.value }))}
                      placeholder="Doctor contact information"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medical Certificate Expiry Date</label>
                  <Input
                    type="date"
                    value={medical.medical_certificate_expiry || ''}
                    onChange={(e) => setMedical(prev => ({ ...prev, medical_certificate_expiry: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Declaration (ISM/ISO Compliance)</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="chronic_illness"
                      checked={medical.chronic_illness || false}
                      onCheckedChange={(checked) => setMedical(prev => ({ ...prev, chronic_illness: checked as boolean }))}
                    />
                    <div className="space-y-2 flex-1">
                      <label htmlFor="chronic_illness" className="text-sm font-medium">
                        Do you have any chronic illnesses or ongoing medical conditions?
                      </label>
                      {medical.chronic_illness && (
                        <Textarea
                          value={medical.chronic_illness_details || ''}
                          onChange={(e) => setMedical(prev => ({ ...prev, chronic_illness_details: e.target.value }))}
                          placeholder="Please provide details of chronic illnesses or conditions"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="current_medications"
                      checked={medical.current_medications || false}
                      onCheckedChange={(checked) => setMedical(prev => ({ ...prev, current_medications: checked as boolean }))}
                    />
                    <div className="space-y-2 flex-1">
                      <label htmlFor="current_medications" className="text-sm font-medium">
                        Are you currently taking any medications?
                      </label>
                      {medical.current_medications && (
                        <Textarea
                          value={medical.current_medications_details || ''}
                          onChange={(e) => setMedical(prev => ({ ...prev, current_medications_details: e.target.value }))}
                          placeholder="Please list all current medications and dosages"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="recent_surgery"
                      checked={medical.recent_surgery || false}
                      onCheckedChange={(checked) => setMedical(prev => ({ ...prev, recent_surgery: checked as boolean }))}
                    />
                    <div className="space-y-2 flex-1">
                      <label htmlFor="recent_surgery" className="text-sm font-medium">
                        Have you had any surgery in the past 12 months?
                      </label>
                      {medical.recent_surgery && (
                        <Textarea
                          value={medical.recent_surgery_details || ''}
                          onChange={(e) => setMedical(prev => ({ ...prev, recent_surgery_details: e.target.value }))}
                          placeholder="Please provide details of recent surgery"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="allergies"
                      checked={medical.allergies || false}
                      onCheckedChange={(checked) => setMedical(prev => ({ ...prev, allergies: checked as boolean }))}
                    />
                    <div className="space-y-2 flex-1">
                      <label htmlFor="allergies" className="text-sm font-medium">
                        Do you have any known allergies?
                      </label>
                      {medical.allergies && (
                        <Textarea
                          value={medical.allergies_details || ''}
                          onChange={(e) => setMedical(prev => ({ ...prev, allergies_details: e.target.value }))}
                          placeholder="Please list all known allergies and reactions"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="medical_fitness"
                      checked={medical.medical_fitness_declaration || false}
                      onCheckedChange={(checked) => setMedical(prev => ({ ...prev, medical_fitness_declaration: checked as boolean }))}
                    />
                    <label htmlFor="medical_fitness" className="text-sm font-medium">
                      I declare that I am medically fit for sea service and have disclosed all relevant medical information above. *
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={saving === 'medical'}>
                {saving === 'medical' ? 'Saving...' : 'Update Medical Information'}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certificates" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-semibold">Certificates</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {messages.certificates && (
                <Alert variant={messages.certificates.includes('success') ? 'default' : 'destructive'}>
                  <AlertDescription>{messages.certificates}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Certificates</h3>
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span> {cert.certificate_type}
                          </div>
                          <div>
                            <span className="font-medium">Valid From:</span> {cert.valid_from}
                          </div>
                          <div>
                            <span className="font-medium">Expires:</span> {cert.expiry_date}
                          </div>
                          <div>
                            <span className="font-medium">Issued By:</span> {cert.issued_by}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No certificates uploaded yet.</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add New Certificate</h3>
                <form onSubmit={handleCertificateSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Certificate Type *</label>
                    <Select value={newCertificate.certificate_type || ''} onValueChange={(value) => setNewCertificate(prev => ({ ...prev, certificate_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Certificates of Competency (CoC)">Certificates of Competency (CoC)</SelectItem>
                        <SelectItem value="STCW Basic Training">STCW Basic Training</SelectItem>
                        <SelectItem value="GMDSS">GMDSS</SelectItem>
                        <SelectItem value="Seafarers Medical">Seafarers Medical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valid From *</label>
                      <Input
                        type="date"
                        value={newCertificate.valid_from || ''}
                        onChange={(e) => setNewCertificate(prev => ({ ...prev, valid_from: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date *</label>
                      <Input
                        type="date"
                        value={newCertificate.expiry_date || ''}
                        onChange={(e) => setNewCertificate(prev => ({ ...prev, expiry_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issued By *</label>
                    <Input
                      value={newCertificate.issued_by || ''}
                      onChange={(e) => setNewCertificate(prev => ({ ...prev, issued_by: e.target.value }))}
                      placeholder="Issuing authority"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Certificate File</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setNewCertificate(prev => ({ ...prev, file_upload: e.target.files?.[0] || null }))}
                      />
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                  </div>

                  <Button type="submit" disabled={saving === 'certificates'}>
                    {saving === 'certificates' ? 'Adding...' : 'Add Certificate'}
                  </Button>
                </form>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="signature" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <PenTool className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-semibold">Electronic Signature</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {messages.signature && (
                <Alert variant={messages.signature.includes('success') ? 'default' : 'destructive'}>
                  <AlertDescription>{messages.signature}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Signature</h3>
                {signature.signature_data ? (
                  <div className="space-y-2">
                    <img 
                      src={signature.signature_data} 
                      alt="Current signature" 
                      className="border rounded-lg max-w-md h-32 object-contain bg-white"
                    />
                    <p className="text-sm text-gray-600">Signature saved on: {signature.created_at}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No signature saved yet.</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Create New Signature</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="border rounded bg-white cursor-crosshair w-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <p className="text-sm text-gray-500 mt-2">Draw your signature above using your mouse or touch device</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={clearSignature}>
                      Clear
                    </Button>
                    <Button type="button" onClick={saveSignature} disabled={saving === 'signature'}>
                      {saving === 'signature' ? 'Saving...' : 'Save Signature'}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Electronic Signature Usage</h4>
                  <p className="text-sm text-blue-800">
                    Your electronic signature will be used throughout the system for signing:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 list-disc list-inside">
                    <li>Maintenance records and work orders</li>
                    <li>Safety inspection reports</li>
                    <li>Training completion certificates</li>
                    <li>Incident and accident reports</li>
                    <li>QHSE compliance documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Profile;
