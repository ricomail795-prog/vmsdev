const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  surname?: string;
  role?: string;
}

interface User {
  id: number;
  email: string;
  first_name?: string;
  surname?: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.access_token;
    localStorage.setItem('access_token', this.token!);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: RegisterData): Promise<{ message: string; user_id: number }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  async getDashboardData() {
    return this.request('/dashboard');
  }

  async getVessels() {
    return this.request('/vessels');
  }

  async getMaintenanceRecords(vesselId?: number) {
    const query = vesselId ? `?vessel_id=${vesselId}` : '';
    return this.request(`/maintenance${query}`);
  }

  async getSafetyRecords(vesselId?: number) {
    const query = vesselId ? `?vessel_id=${vesselId}` : '';
    return this.request(`/safety${query}`);
  }

  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getCertificates() {
    return this.request('/certificates');
  }

  async createVessel(vesselData: any) {
    return this.request('/vessels', {
      method: 'POST',
      body: JSON.stringify(vesselData),
    });
  }

  async getCrewAssignments(userId?: number, vesselId?: number) {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());
    if (vesselId) params.append('vessel_id', vesselId.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/crew-assignments${query}`);
  }

  async createCrewAssignment(assignmentData: any) {
    return this.request('/crew-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async getMyAssignment() {
    return this.request('/my-assignment');
  }

  async getNextOfKin() {
    return this.request('/next-of-kin');
  }

  async updateNextOfKin(kinData: any) {
    return this.request('/next-of-kin', {
      method: 'PUT',
      body: JSON.stringify(kinData),
    });
  }

  async getMedicalInfo() {
    return this.request('/medical-info');
  }

  async updateMedicalInfo(medicalData: any) {
    return this.request('/medical-info', {
      method: 'PUT',
      body: JSON.stringify(medicalData),
    });
  }

  async getElectronicSignature() {
    return this.request('/electronic-signature');
  }

  async updateElectronicSignature(signatureData: any) {
    return this.request('/electronic-signature', {
      method: 'PUT',
      body: JSON.stringify(signatureData),
    });
  }

  async createCertificate(certData: any) {
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(certData),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiClient = new ApiClient();
export type { User, LoginCredentials, RegisterData, AuthResponse };
