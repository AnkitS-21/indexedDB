// // src/hooks/searchMedicines.ts
// import { invoke } from '@tauri-apps/api/core';
// import { MedicineInfo } from '../components/Billing';

// const limit = 5; // Example limit per search results

// // Function to handle search
// export const searchMedicines = async (query: string): Promise<MedicineInfo[]> => {
//   if (query.trim() === '') {
//     return [];
//   }
//   try {
//     const results: MedicineInfo[] = await invoke('search_medicines', {
//       query,
//       page: 1, // We can modify this for pagination later
//       limit,
//     });
//     return results;
//   } catch (error) {
//     console.error('Failed to fetch medicines:', error);
//     return [];
//   }
// };


// src/hooks/searchMedicines.ts

import { invoke } from '@tauri-apps/api/core';
import { MedicineInfo } from '../components/Billing';
import { getMedicinesFromIndexedDB } from '../utils/indexedDb'; // IndexedDB utility function

const limit = 5; // Example limit per search result

// Function to handle search
export const searchMedicines = async (query: string): Promise<MedicineInfo[]> => {
  if (query.trim() === '') {
    return [];
  }

  try {
    if (navigator.onLine) {
      // Online: Fetch from backend
      const results: MedicineInfo[] = await invoke('search_medicines', {
        query,
        page: 1, // Modify this for pagination if needed
        limit,
      });

      // Transform results to match MedicineInfo structure
      const formattedResults: MedicineInfo[] = results.map((medicine) => ({
        ...medicine,
        selling_price: medicine.selling_price,
      }));

      return formattedResults;
    } else {
      // Offline: Fetch from IndexedDB
      const allMedicines = await getMedicinesFromIndexedDB();
      // Filter local results based on the query
      const filteredResults = allMedicines
        .filter(medicine => medicine.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit); // Apply the same limit as online search

      return filteredResults;
    }
  } catch (error) {
    console.error('Failed to fetch medicines:', error);
    return [];
  }
};
