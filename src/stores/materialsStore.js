import { defineStore } from 'pinia'
import  db  from '../firebase/init'
import {  collection, getDocs , doc, setDoc , updateDoc , deleteDoc, addDoc} from 'firebase/firestore'

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    materialsInventory: [
      // {  name: 'Steel Sheets', stock: 10, stockUsed: 0 },
      // {  name: 'Welding Rods', stock: 3, stockUsed: 0 },
      // {  name: 'Paint', stock: 8, stockUsed: 0 },
      // {  name: 'Engine', stock: 2, stockUsed: 0 },
      // {  name: 'Tires', stock: 4, stockUsed: 0 },
      // {  name: 'Brake Pads', stock: 5, stockUsed: 0 },
      // {  name: 'Batteries', stock: 3, stockUsed: 0 },
      // {  name: 'Seats', stock: 6, stockUsed: 0 },
      // {  name: 'Doors', stock: 2, stockUsed: 0 },
      // {  name: 'Windshield', stock: 1, stockUsed: 0 },
      // {  name: 'Suspension System', stock: 2, stockUsed: 0 },
      // {  name: 'Chassis', stock: 1, stockUsed: 0 },
      // {  name: 'Transmission System', stock: 1, stockUsed: 0 },
      // {  name: 'Dashboard', stock: 2, stockUsed: 0 },
      // {  name: 'Air Conditioning Unit', stock: 1, stockUsed: 0 },
      // {  name: 'Lighting System', stock: 5, stockUsed: 0 },
      // {  name: 'Mirrors', stock: 4, stockUsed: 0 },
      // {  name: 'Fuel Tank', stock: 2, stockUsed: 0 },
      // {  name: 'Radiator', stock: 2, stockUsed: 0 },
      // {  name: 'Exhaust System', stock: 1, stockUsed: 0 },
    ],
    isDataFetched: false,
    totalStock: 0,
    totalStockUsed: 0,
  }),
  getters: {
    filteredMaterials: (state) => (searchQuery) => {
      return state.materialsInventory.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    },
    getTotalStock: async () => {
      let totalStock = 0;

      const querySnapshot = await getDocs(collection(db, "materials"));
      querySnapshot.forEach((doc) => {
        totalStock += doc.data().stock;
      });

      return totalStock;
    },
    getTotalStockUsed: async () => {
      let totalStockUsed = 0;

      const querySnapshot = await getDocs(collection(db, "materialUsed"));
      querySnapshot.forEach((doc) => {
        totalStockUsed += doc.data().quantityUsed;
      });
      console.log('totalStockUsed:', totalStockUsed)
      return totalStockUsed;
    }
  },
  actions: {
    async getMaterials() {
      if (this.isDataFetched) return;

      const querySnapshot = await getDocs(collection(db, "materials"));
      querySnapshot.forEach((doc) => {
        this.materialsInventory.push(doc.data());
      });
      this.calculateTotalStockUsed();
      this.calculateTotalStock();
      this.isDataFetched = true;
    },
    calculateTotalStock() {
      this.totalStock = this.materialsInventory.reduce(
        (total, item) => total + item.stock,
        0
      )
    },
    calculateTotalStockUsed() {
      this.totalStockUsed = this.materialsInventory.reduce(
        (total, item) => total + item.stockUsed,
        0
      )
      console.log('Total Stock Used:', this.totalStockUsed)
    },
    async addMaterial(material) {
      const newId =
        this.materialsInventory.length > 0
          ? Math.max(...this.materialsInventory.map((m) => m.id)) + 1
          : 1;

      this.materialsInventory.push({ ...material, id: newId, stockUsed: 0 });
      this.calculateTotalStock();
      this.calculateTotalStockUsed();

      const docRef = doc(db, "materials", newId.toString());
      await setDoc(docRef, {
        ...material,
        id: newId,
        stockUsed: 0,
      });
    },


    editMaterial(updatedMaterial) {
      const index = this.materialsInventory.findIndex(
        (material) => material.id === updatedMaterial.id
      );
      if (index !== -1) {
        this.materialsInventory.splice(index, 1, {
          ...this.materialsInventory[index],
          ...updatedMaterial,
        });

        const docRef = doc(db, "materials", updatedMaterial.id.toString());
        updateDoc(docRef, updatedMaterial).then(() => {
          this.calculateTotalStock();
          this.calculateTotalStockUsed();
        })
      }
    },
    async deleteMaterial(materialId) {
      // Delete from the state
      this.materialsInventory = this.materialsInventory.filter(
        (material) => material.id !== materialId
      );
      this.calculateTotalStock();
      this.calculateTotalStockUsed();

      // Delete from Firestore
      const docRef = doc(db, "materials", materialId.toString());
      await deleteDoc(docRef);
    },
    async useMaterial(materialId, quantity) {
      const material = this.materialsInventory.find((m) => m.id === materialId);
      if (material && material.stock >= quantity) {
        // Update material's stock and stockUsed
        material.stock -= quantity;
        material.stockUsed += quantity;

        // Update the total stock and stock used in the state
        this.calculateTotalStock();
        this.calculateTotalStockUsed();

        // Update the material in Firestore
        const materialRef = doc(db, "materials", materialId.toString());
        await updateDoc(materialRef, {
          stock: material.stock,
          stockUsed: material.stockUsed,
        });

        // Add a record to the "materialUsed" collection
        const materialUsedRef = collection(db, "materialUsed");
        await addDoc(materialUsedRef, {
          quantityUsed: quantity,
        });
      }
    },
  },
})
