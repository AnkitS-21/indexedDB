// // src/hooks/useInitializeDatabase.ts
// import { invoke } from "@tauri-apps/api/core";

// export function useInitializeDatabase() {
//   const initializeDatabase = async () => {
//     try {
//       const result = await invoke("initialize_db");
//       console.log(result);
//     } catch (error) {
//       console.error("Error initializing the database:", error);
//     }
//   };

//   return { initializeDatabase };
// }

// src/hooks/useInitializeDatabase.ts

import { invoke } from "@tauri-apps/api/core";
import { initDB } from "../utils/indexedDb"; // Initialize IndexedDB

export function useInitializeDatabase() {
  const initializeDatabase = async () => {
    try {
      await invoke("initialize_db");  // Initialize MySQL
      await initDB();                 // Initialize IndexedDB
      console.log("Databases initialized");
    } catch (error) {
      console.error("Error initializing the database:", error);
    }
  };

  return { initializeDatabase };
}
