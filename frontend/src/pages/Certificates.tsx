import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Calendar } from 'lucide-react';

interface Certificate {
  id: number;
  certificate_type: string;
  valid_from: string;
  expiry_date: string;
  issued_by: string;
}

const Certificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const certData = await apiClient.getCertificates();
        setCertificates(certData);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return <div className="text-center">Loading certificates...</div>;
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600">Manage your professional certificates and qualifications</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-500 text-center">
              Add your professional certificates and qualifications to track their validity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cert.certificate_type}</CardTitle>
                  <Badge 
                    variant={
                      isExpired(cert.expiry_date) ? 'destructive' :
                      isExpiringSoon(cert.expiry_date) ? 'secondary' : 'default'
                    }
                  >
                    {isExpired(cert.expiry_date) ? 'Expired' :
                     isExpiringSoon(cert.expiry_date) ? 'Expiring Soon' : 'Valid'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Issued by:</span>
                  <p className="text-gray-600">{cert.issued_by}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Valid from:</span>
                    <span className="text-gray-600">
                      {new Date(cert.valid_from).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Expires:</span>
                    <span className={`${
                      isExpired(cert.expiry_date) ? 'text-red-600' :
                      isExpiringSoon(cert.expiry_date) ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {new Date(cert.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
