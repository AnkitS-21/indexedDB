// // src/hooks/useMedicines.ts
// import { useState, useEffect } from "react";
// import { invoke } from "@tauri-apps/api/core";

// interface Medicine {
//   id: number;
//   name: string;
//   batchNumber: string;
//   expiryDate: string;
//   quantity: number;
//   purchasePrice: number;
//   sellingPrice: number;
// }

// export function useMedicines() {
//   const [medicines, setMedicines] = useState<Medicine[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [editedMedicines, setEditedMedicines] = useState<Map<number, Medicine>>(new Map());

//   useEffect(() => {
//     fetchMedicines();
//   }, []);

//   const fetchMedicines = async () => {
//     try {
//       setIsLoading(true);
//       const result: Medicine[] = await invoke("get_medicine");
//       console.log("Fetched Medicines:", result);
//       setMedicines(result);
//     } catch (error) {
//       console.error("Error fetching medicines:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addMedicine = async (
//     name: string,
//     batchNumber: string,
//     expiryDate: string,
//     quantity: number,
//     purchasePrice: number,
//     sellingPrice: number
//   ) => {
//     if (!name.trim() || quantity <= 0 || purchasePrice <= 0 || sellingPrice <= 0) {
//       alert("Please enter valid medicine details!");
//       return;
//     }
//     try {
//       await invoke("insert_medicine", {
//         name: name.trim(),
//         batchNumber,
//         expiryDate,
//         quantity,
//         purchasePrice,
//         sellingPrice,
//       });
//       fetchMedicines();
//     } catch (error) {
//       console.error("Error adding medicine:", error);
//     }
//   };

//   const updateMedicine = async (id: number) => {
//     try {
//       const medicine = medicines.find((med) => med.id === id);
//       if (!medicine) return;

//       const updatedMedicine = editedMedicines.get(id) ?? medicine;

//       await invoke("update_medicine", {
//         id,
//         name: updatedMedicine.name,
//         batchNumber: updatedMedicine.batchNumber,
//         expiryDate: updatedMedicine.expiryDate,
//         quantity: updatedMedicine.quantity,
//         purchasePrice: updatedMedicine.purchasePrice,
//         sellingPrice: updatedMedicine.sellingPrice,
//       });

//       alert("Medicine updated successfully!");
//       setEditedMedicines((prev) => {
//         const newMap = new Map(prev);
//         newMap.delete(id);
//         return newMap;
//       });
//     } catch (error) {
//       console.error("Error updating medicine:", error);
//       alert("Failed to update medicine.");
//     }
//   };

//   const deleteMedicine = async (id: number) => {
//     try {
//       await invoke("delete_medicine", { id });
//       fetchMedicines();
//     } catch (error) {
//       console.error("Error deleting medicine:", error);
//     }
//   };

//   const handleMedicineChange = (id: number, updatedFields: Partial<Medicine>) => {
//     setEditedMedicines((prev) => new Map(prev).set(id, { ...prev.get(id)!, ...updatedFields }));
//     setMedicines((prev) =>
//       prev.map((med) => (med.id === id ? { ...med, ...updatedFields } : med))
//     );
//   };

//   return {
//     medicines,
//     isLoading,
//     addMedicine,
//     updateMedicine,
//     deleteMedicine,
//     handleMedicineChange,
//   };
// }


// src/hooks/useMedicines.ts

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { saveMedicines, getMedicines, addMedicineToIndexedDB, updateMedicineInIndexedDB, deleteMedicineFromIndexedDB } from '../utils/indexedDb';

interface Medicine {
  id: number;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editedMedicines, setEditedMedicines] = useState<Map<number, Medicine>>(new Map());

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      if (navigator.onLine) {
        const result: Medicine[] = await invoke("get_medicine");
        setMedicines(result);
        await saveMedicines(result); // Save MySQL data to IndexedDB for offline use
      } else {
        const localMedicines = await getMedicines();
        setMedicines(localMedicines);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicine = async (
    name: string,
    batchNumber: string,
    expiryDate: string,
    quantity: number,
    purchasePrice: number,
    sellingPrice: number
  ) => {
    const newMedicine = {
      id: Date.now(),
      name,
      batchNumber,
      expiryDate,
      quantity,
      purchasePrice,
      sellingPrice,
    };

    try {
      if (navigator.onLine) {
        await invoke("insert_medicine", {
          name: newMedicine.name,
          batchNumber: newMedicine.batchNumber,
          expiryDate: newMedicine.expiryDate,
          quantity: newMedicine.quantity,
          purchasePrice: newMedicine.purchasePrice,
          sellingPrice: newMedicine.sellingPrice,
        } as Record<string, unknown>); // Cast to Record<string, unknown>
      } else {
        await addMedicineToIndexedDB(newMedicine);
      }
      fetchMedicines();
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  const updateMedicine = async (id: number) => {
    const medicine = editedMedicines.get(id);
    if (!medicine) return;

    try {
      if (navigator.onLine) {
        await invoke("update_medicine", {
          id,
          name: medicine.name,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate,
          quantity: medicine.quantity,
          purchasePrice: medicine.purchasePrice,
          sellingPrice: medicine.sellingPrice,
        } as Record<string, unknown>); // Cast to Record<string, unknown>
      } else {
        await updateMedicineInIndexedDB(medicine);
      }
      setEditedMedicines((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      fetchMedicines();
    } catch (error) {
      console.error("Error updating medicine:", error);
    }
  };

  const deleteMedicine = async (id: number) => {
    try {
      if (navigator.onLine) {
        await invoke("delete_medicine", { id } as Record<string, unknown>); // Cast to Record<string, unknown>
      } else {
        await deleteMedicineFromIndexedDB(id);
      }
      fetchMedicines();
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  const handleMedicineChange = (id: number, updatedFields: Partial<Medicine>) => {
    setEditedMedicines((prev) => new Map(prev).set(id, { ...prev.get(id)!, ...updatedFields }));
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedFields } : med))
    );
  };

  return {
    medicines,
    isLoading,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    handleMedicineChange,
  };
}
