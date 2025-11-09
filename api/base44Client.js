// Mock base44 client for now
export const base44 = {
  get: async (endpoint) => {
    console.log(`Fetching ${endpoint} from Base44 API...`);
    return { data: [] };
  },
  post: async (endpoint, payload) => {
    console.log(`Posting to ${endpoint} with payload:`, payload);
    return { data: payload };
  }
};
