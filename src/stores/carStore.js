import { defineStore } from 'pinia';
import  db  from '../firebase/init'
import { doc, setDoc, updateDoc, getDocs, collection, query, orderBy, limit, deleteDoc, addDoc, getDoc } from 'firebase/firestore'


export const useCarStore = defineStore('carStore', {
  state: () => ({
    cars: [
      // {  unitName: 'Toyota Corolla', quantity: 5, price: 1500000 },
      // {  unitName: 'Honda Accord', quantity: 3, price: 1800000 },
      // {  unitName: 'Ford Ranger', quantity: 7, price: 2500000 },
      // {  unitName: 'Chevrolet Spark', quantity: 2, price: 900000 },
      // {  unitName: 'Tesla Model S', quantity: 1, price: 7500000 },
      // {  unitName: 'Nissan Altima', quantity: 4, price: 2000000 },
      // {  unitName: 'BMW 3 Series', quantity: 6, price: 3200000 },
      // {  unitName: 'Audi Q5', quantity: 8, price: 4000000 },
      // {  unitName: 'Mercedes-Benz C-Class', quantity: 3, price: 3800000 },
      // {  unitName: 'Kia Sportage', quantity: 5, price: 1800000 },
    ],
    isDataFetched: false,
    soldCars: [],
    currentPage: 1,
    itemsPerPage: 5,
    searchQuery: "",
    sortBy: '',
    sortOrder: 'asc',
    isModalVisible: false,
    isSoldModalVisible: false,
    isDeleteModalVisible: false,
    carToDelete: null,
    modalCar: {
      id: null,
      unitName: '',
      quantity: 0,
      price: 0,
    },
    soldCar: {
      id: null,
      unitName: '',
      customer: '',
      quantity: 0,
      soldQuantity: 0,
      price: 0,
    },
    validationErrors: {
      unitName: '',
      customer: '',
      quantity: '',
      price: '',
    },
  }),

  getters: {
    filteredCars(state) {
      return state.cars.filter((car) =>
        car.unitName.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    },
    totalPages(state) {
      return Math.ceil(state.filteredCars.length / state.itemsPerPage);
    },
    sortedCars(state) {
      return [...state.filteredCars].sort((a, b) => {
        const factor = state.sortOrder === 'asc' ? 1 : -1;
        if (typeof a[state.sortBy] === 'string') {
          return factor * a[state.sortBy].localeCompare(b[state.sortBy]);
        } else {
          return factor * (a[state.sortBy] - b[state.sortBy]);
        }
      });
    },
    paginatedSortedCars(state) {
      const startIndex = (state.currentPage - 1) * state.itemsPerPage;
      return state.sortedCars.slice(startIndex, startIndex + state.itemsPerPage);
    },
    getTotalCarSold: async () => {
      let totalSoldCount = 0;
      const querySnapshot = await getDocs(collection(db, "carSold"));

      querySnapshot.forEach((doc) => {
        const soldCarData = doc.data();
        totalSoldCount += soldCarData.quantity;  // Adding the quantity field
      });

      return totalSoldCount;
    },
    getTotalCarSoldCount: async () => {
      let totalSold = 0;
      const querySnapshot = await getDocs(collection(db, "carSold"));

      querySnapshot.forEach((doc) => {
        const soldCarData = doc.data();
        totalSold += soldCarData.soldQuantity;
      });

      return totalSold;
    },
  },

  actions: {
    async getCars() {
      if (this.isDataFetched) return;

      const querySnapshot = await getDocs(collection(db, "cars"));
      querySnapshot.forEach((doc) => {
        this.cars.push(doc.data());
      });

      this.calculateTotalSalesCount();
      this.calculateTotalSales();
      this.isDataFetched = true;
    },
    changeSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = column;
        this.sortOrder = 'asc';
      }
    },

    formatPrice(value) {
      if (typeof value !== 'number') return '₱0';
      return `₱${value.toLocaleString('en-US')}`;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    openAddCarModal() {
      this.isModalVisible = true;
      this.modalCar = { id: null, unitName: '', quantity: 0, price: 0 };
    },

    editCar(car) {
      this.isModalVisible = true;
      this.modalCar = { ...car };
    },

    closeModal() {
      this.isModalVisible = false;
      this.modalCar = { id: null, unitName: '', quantity: 0, price: 0 };
      this.resetValidationErrors();
    },

    deleteCar(id) {
      const carRef = doc(db, "cars", id.toString());
      deleteDoc(carRef)
        .then(() => {
          this.cars = this.cars.filter((car) => car.id !== id);
          this.closeDeleteModal();
        })
    },

    openDeleteCarModal(car) {
      this.carToDelete = { ...car };
      this.isDeleteModalVisible = true;
    },

    closeDeleteModal() {
      this.isDeleteModalVisible = false;
    },

    openSoldCarModal(car) {
      this.soldCar = { ...car, soldQuantity: 0 };
      this.isSoldModalVisible = true;
    },

    closeSoldModal() {
      this.isSoldModalVisible = false;
    },

    async markAsSold() {
      // Ensure that there are cars to sell
      if (this.soldCar.soldQuantity > 0 && this.soldCar.soldQuantity <= this.soldCar.quantity) {
        // Reduce the quantity of the car in the cars collection
        const carRef = doc(db, "cars", this.soldCar.id.toString());
        const carSnapshot = await getDoc(carRef);
        const carData = carSnapshot.data();

        // Update the quantity in the cars collection
        const newQuantity = carData.quantity - this.soldCar.soldQuantity;
        await updateDoc(carRef, { quantity: newQuantity });

        // Add the sold car to the carSold collection with Firestore-generated ID
        const soldCarData = {
          unitName: this.soldCar.unitName,
          customer: this.soldCar.customer,
          soldQuantity: this.soldCar.soldQuantity,
          price: this.soldCar.price,
          dateSold: new Date(),
        };

        // Firestore will generate a unique ID for the new document
        await addDoc(collection(db, "carSold"), soldCarData);

        // Optionally, you can also add the sold car to the `soldCars` state for UI tracking
        this.soldCars.push(soldCarData);

        // Close the modal and reset the sold car data
        this.closeSoldModal();
      } else {
        console.error("Sold quantity exceeds available quantity.");
      }
    },
    async saveCar() {
      if (Object.values(this.validationErrors).some((error) => error !== '')) {
        return;
      }

      if (this.modalCar.id) {
        const carRef = doc(db, "cars", this.modalCar.id.toString());
        await updateDoc(carRef, {
          unitName: this.modalCar.unitName,
          quantity: this.modalCar.quantity,
          price: this.modalCar.price,
        });

        const index = this.cars.findIndex((car) => car.id === this.modalCar.id);
        if (index !== -1) {
          this.cars[index] = { ...this.modalCar };
        }
      } else {
        const carsRef = collection(db, "cars");
        const q = query(carsRef, orderBy("id", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        let newId = 1;
        if (!querySnapshot.empty) {
          const lastCar = querySnapshot.docs[0].data();
          newId = lastCar.id + 1;
        }

        const carData = {
          id: newId,
          unitName: this.modalCar.unitName,
          quantity: this.modalCar.quantity,
          price: this.modalCar.price,
        };

        await setDoc(doc(db, "cars", newId.toString()), carData);

        this.cars.push(carData);
      }

      this.closeModal();
    },

    resetValidationErrors() {
      this.validationErrors = {
        unitName: '',
        customer: '',
        quantity: '',
        price: '',
      };
    },

    validateField(field) {
      switch (field) {
        case 'unitName':
          this.validationErrors.unitName = this.modalCar.unitName ? '' : 'Unit name is required.';
          this.showUnitNameError = !!this.validationErrors.unitName;
          break;
        case 'quantity':
          this.validationErrors.quantity = this.modalCar.quantity > 0 ? '' : 'Quantity must be greater than 0.';
          this.showQuantityError = !!this.validationErrors.quantity;
          break;
        case 'price':
          this.validationErrors.price = this.modalCar.price > 0 ? '' : 'Price must be greater than 0.';
          this.showPriceError = !!this.validationErrors.price;
          break;
        case 'customer':
          this.validationErrors.customer = this.soldCar.customer ? '' : 'Customer name is required.';
          this.showCustomerError = !!this.validationErrors.customer;
          break;
        default:
          break;
      }
    },

    async calculateTotalSalesCount() {
      const querySnapshot = await getDocs(collection(db, "carSold"));
      let totalSalesCount = 0;

      querySnapshot.forEach((doc) => {
        const soldCarData = doc.data();
        totalSalesCount += soldCarData.soldQuantity;
      });

      console.log('Total number of sales:', totalSalesCount);
      return totalSalesCount;
    },

    async calculateTotalSales() {
      const querySnapshot = await getDocs(collection(db, "carSold"));
      let totalSales = 0;

      querySnapshot.forEach((doc) => {
        const soldCarData = doc.data();
        totalSales += soldCarData.soldQuantity * soldCarData.price; // Multiply sold quantity by price
      });

      console.log('Total sales amount:', totalSales);
      return totalSales;
    }
  },
  persist: true,
});
