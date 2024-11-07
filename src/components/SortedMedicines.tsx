import React, { useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { saveMedicines, getMedicines, Medicine } from '../utils/indexedDb'; // Adjust paths accordingly

const SortedMedicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const fetchedMedicines: Medicine[] = await invoke('get_sorted_medicines');
        
        // Log the fetched data to console to check if it's being received correctly
        console.log('Medicines from MySQL:', fetchedMedicines);

        setMedicines(fetchedMedicines);
        await saveMedicines(fetchedMedicines); // Store to IndexedDB for offline use
      } else {
        const localMedicines = await getMedicines(); // Fetch from IndexedDB if offline
        console.log('Medicines from IndexedDB:', localMedicines);
        setMedicines(localMedicines);
      }
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMedicines();
    window.addEventListener('online', fetchMedicines);
    window.addEventListener('offline', fetchMedicines);
    return () => {
      window.removeEventListener('online', fetchMedicines);
      window.removeEventListener('offline', fetchMedicines);
    };
  }, []);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>Medicines</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Batch Number</strong></TableCell>
              <TableCell><strong>Expiry Date</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Purchase Price</strong></TableCell>
              <TableCell><strong>Selling Price</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell>{medicine.name}</TableCell>
                <TableCell>{medicine.batchNumber}</TableCell>
                <TableCell>{medicine.expiryDate}</TableCell>
                <TableCell>{medicine.quantity}</TableCell>
                <TableCell>{medicine.purchasePrice}</TableCell>
                <TableCell>{medicine.sellingPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SortedMedicines;
