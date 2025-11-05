// Simple localStorage wrapper for storing app data
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return { value };
    } catch (error) {
      console.error('Failed to get from storage:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to delete from storage:', error);
      return false;
    }
  }
};

// Expose storage to window for easy access
window.storage = storage;

export default storage;