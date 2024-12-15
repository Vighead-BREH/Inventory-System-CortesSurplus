import { defineStore } from 'pinia'
import  db  from '../firebase/init'
import {  collection, doc, setDoc , updateDoc , deleteDoc, addDoc, onSnapshot } from 'firebase/firestore'

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
    materialsUsed: [],
    isDataFetched: false,
    totalStock: 0,
    totalStockUsed: 0,
    sortBy: '',
    sortOrder: 'asc',
  }),
  getters: {
    filteredMaterials: (state) => (searchQuery) => {
      return state.materialsInventory.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    },
    sortedMaterials: (state) => {
      return [...state.materialsInventory].sort((a, b) => {
        if (a[state.sortBy] < b[state.sortBy]) {
          return state.sortOrder === 'asc' ? -1 : 1;
        }
        if (a[state.sortBy] > b[state.sortBy]) {
          return state.sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  },
  actions: {
    changeSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = column;
        this.sortOrder = 'asc';
      }
    },
    async getMaterials() {
      if (this.isDataFetched) return;

      onSnapshot(collection(db, "materials"), (querySnapshot) => {
        this.materialsInventory = [];
        querySnapshot.forEach((doc) => {
          this.materialsInventory.push(doc.data());
        });

        this.calculateTotalStock();
        this.isDataFetched = true;
      });
    },

    async getMaterialsUsed() {
      onSnapshot(collection(db, "materialUsed"), (querySnapshot) => {
        this.materialsUsed = [];
        querySnapshot.forEach((doc) => {
          this.materialsUsed.push(doc.data());
        });
        this.calculateTotalStockUsed();
      });
    },

    calculateTotalStock() {
      this.totalStock = this.materialsInventory.reduce(
        (total, item) => total + item.stock,
        0
      )
    },

    calculateTotalStockUsed() {
      this.totalStockUsed = this.materialsUsed.reduce(
        (total, item) => total + item.quantityUsed,
        0
      );
    },

    async addMaterial(material) {
      const newId =
        this.materialsInventory.length > 0
          ? Math.max(...this.materialsInventory.map((m) => m.id)) + 1
          : 1;

      this.materialsInventory.push({ ...material, id: newId, stockUsed: 0 });
      this.calculateTotalStock();


      const docRef = doc(db, "materials", newId.toString());
      await setDoc(docRef, {
        ...material,
        id: newId,
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
        })
      }
    },

    async deleteMaterial(materialId) {
      const materialToDelete = this.materialsInventory.find(
        (material) => material.id === materialId
      );

      if (materialToDelete) {
        const materialDeletedRef = collection(db, "materialDeleted");
        await addDoc(materialDeletedRef, {
          id: materialToDelete.id,
          name: materialToDelete.name,
          stock: materialToDelete.stock,
          dateDeleted: new Date(),
        });

        this.materialsInventory = this.materialsInventory.filter(
          (material) => material.id !== materialId
        );

        this.calculateTotalStock();

        const docRef = doc(db, "materials", materialId.toString());
        await deleteDoc(docRef);
      }
    },

    async useMaterial(materialId, quantity) {
      const material = this.materialsInventory.find((m) => m.id === materialId);
      if (material && material.stock >= quantity) {
        material.stock -= quantity;

        this.calculateTotalStock();
        this.calculateTotalStockUsed();

        const materialRef = doc(db, "materials", materialId.toString());
        await updateDoc(materialRef, {
          stock: material.stock,
        });

        const materialUsedRef = collection(db, "materialUsed");
        await addDoc(materialUsedRef, {
          id: materialId,
          name: material.name,
          quantityUsed: quantity,
          dateUsed: new Date(),
        });
      }
    },
  },
})
