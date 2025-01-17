import { Campaign } from "@/types/campaign";

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://pledgewise-api.onrender.com';

interface ContributionData {
  amount: number;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
}

interface Contribution {
  // Assuming this interface is defined elsewhere, if not, you'll need to define it
}

interface ContributionWithCampaign extends Contribution {
  campaign: {
    title: string;
    code: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

export const api = {
  campaigns: {
    list: async (): Promise<Campaign[]> => {
      const response = await fetch(`${API_URL}/api/campaigns`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
    create: async (campaign: Omit<Campaign, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
      const response = await fetch(`${API_URL}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });
      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }
      return response.json();
    },
    get: async (id: string): Promise<Campaign> => {
      const response = await fetch(`${API_URL}/api/campaigns/${id}`);
      if (!response.ok) throw new Error('Failed to fetch campaign');
      return response.json();
    },
    contribute: async ({ campaignId, amount }: { campaignId: string; amount: number }): Promise<Campaign> => {
      const response = await fetch(`${API_URL}/api/campaigns/${campaignId}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount,
          name: "Anonymous",
          email: "anonymous@example.com",
          phoneNumber: "1234567890"
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to process contribution');
      }
      return response.json();
    },
    update: async (id: number, data: Partial<Campaign>) => {
      const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }

      return response.json();
    },
  },
  categories: {
    list: async (): Promise<Category[]> => {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    create: async (data: Omit<Category, 'id'>): Promise<Category> => {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
    },
  },
  locations: {
    list: async (): Promise<Location[]> => {
      const response = await fetch(`${API_URL}/api/locations`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return response.json();
    },
    create: async (data: Omit<Location, 'id'>): Promise<Location> => {
      const response = await fetch(`${API_URL}/api/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create location');
      }
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_URL}/api/locations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete location');
      }
    },
  },
  contributions: {
    list: async (): Promise<ContributionWithCampaign[]> => {
      const response = await fetch(`${API_URL}/api/contributions`);
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }
      return response.json();
    },
  },
  users: {
    signup: async (data: SignupData): Promise<User> => {
      const response = await fetch(`${API_URL}/api/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign up');
      }
      return response.json();
    },
    list: async (): Promise<User[]> => {
      const response = await fetch(`${API_URL}/api/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  },
};
