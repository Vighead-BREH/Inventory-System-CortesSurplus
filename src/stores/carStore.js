import { defineStore } from 'pinia';
import  db  from '../firebase/init'
import { doc, addDoc, updateDoc, collection, deleteDoc, onSnapshot, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'


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
    totalSales: 0,
    totalSoldCount: 0,
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
  },

  actions: {
    async getCars() {
      if (this.isDataFetched) return;

      onSnapshot(collection(db, "cars"), (querySnapshot) => {
        this.cars = [];
        querySnapshot.forEach((doc) => {
          this.cars.push(doc.data());
        });

        this.isDataFetched = true;
      });
    },

    async getSoldCars() {
      onSnapshot(collection(db, "carSold"), (querySnapshot) => {
        this.soldCars = [];
        querySnapshot.forEach((doc) => {
          this.soldCars.push(doc.data());
        });

        this.calculateTotalSales();
        this.calculateTotalSalesCount();
        console.log('Sold Cars:', this.soldCars);
      });
    },

    calculateTotalSalesCount() {
      this.totalSoldCount = this.soldCars.reduce(
        (total, soldCar) => total + soldCar.soldQuantity,
        0
      );
      console.log('Total Sold Count:', this.totalSoldCount);
    },

    calculateTotalSales() {
      this.totalSales = this.soldCars.reduce(
        (total, soldCar) => total + soldCar.price,
        0
      );
      console.log('Total Sales:', this.totalSales);
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
      if (typeof value !== 'number' || isNaN(value)) return '₱0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value).replace('PHP', '₱').trim();
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

    deleteCar(id) {
      const carToDelete = this.cars.find(car => car.id === id);
      if (carToDelete) {
        // Add the car information to the carDeleted collection
        const carDeletedRef = collection(db, "carDeleted");
        addDoc(carDeletedRef, {
          id: carToDelete.id,
          unitName: carToDelete.unitName,
          quantity: carToDelete.quantity,
          price: carToDelete.price,
          dateDeleted: new Date(),
        });

        // Remove the car from the current inventory
        this.cars = this.cars.filter((car) => car.id !== id);

        const docRef = doc(db, "cars", id.toString());
        deleteDoc(docRef);

        this.closeDeleteModal();
      }
    },

    async markAsSold() {
      this.validateField('soldQuantity');

      if (this.validationErrors.soldQuantity) {
        console.error('Validation error:', this.validationErrors.soldQuantity);
        return;
      }

      const cars = this.cars.find((car) => car.id === this.soldCar.id);
      if (cars && cars.quantity > 0 && cars.quantity >= this.soldCar.soldQuantity) {
        cars.quantity -= this.soldCar.soldQuantity;

        this.calculateTotalSalesCount();
        this.calculateTotalSales();

        const carRef = doc(db, "cars", this.soldCar.id.toString());
        await updateDoc(carRef, {
          quantity: cars.quantity,
        });

        const totalSoldPrice = this.soldCar.soldQuantity * this.soldCar.price;

        const soldCarRef = collection(db, "carSold");
        await addDoc(soldCarRef, {
          unitName: this.soldCar.unitName,
          customer: this.soldCar.customer,
          soldQuantity: this.soldCar.soldQuantity,
          price: totalSoldPrice,
          dateSold: new Date(),
        });
      }
      this.closeSoldModal();
    },

    async saveCar() {
      this.validateField('unitName');
      this.validateField('quantity');
      this.validateField('price');

      if (Object.values(this.validationErrors).some((error) => error !== '')) {
        return;
      }

      try {
        if (this.modalCar.id) {
          const carRef = doc(db, "cars", this.modalCar.id.toString());
          await updateDoc(carRef, {
            unitName: this.modalCar.unitName,
            quantity: this.modalCar.quantity,
            price: this.modalCar.price,
          });
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
        }

        this.closeModal();
      } catch (error) {
        console.error('Error saving car:', error);
      }
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
          this.validationErrors.unitName = this.modalCar.unitName.trim()
            ? ''
            : 'Unit name is required.';
          break;
        case 'quantity':
          if (this.modalCar.quantity <= 0) {
            this.validationErrors.quantity = 'Quantity must be greater than 0.';
          } else if (!Number.isInteger(this.modalCar.quantity)) {
            this.validationErrors.quantity = 'Quantity must be a whole number.';
          } else {
            this.validationErrors.quantity = '';
          }
          break;
        case 'price':
          if (isNaN(this.modalCar.price) || this.modalCar.price <= 0) {
            this.validationErrors.price = 'Price must be a positive number.';
          } else {
            this.validationErrors.price = '';
          }
          break;
        case 'customer':
          this.validationErrors.customer = this.soldCar.customer.trim()
            ? ''
            : 'Customer name is required.';
          break;
        case 'soldQuantity':
          if (!Number.isInteger(this.soldCar.soldQuantity)) {
            this.validationErrors.soldQuantity = 'Quantity sold must be a whole number.';
          } else if (this.soldCar.soldQuantity <= 0) {
            this.validationErrors.soldQuantity = 'Quantity sold must be greater than 0.';
          } else if (this.soldCar.soldQuantity > this.soldCar.quantity) {
            this.validationErrors.soldQuantity = 'Not enough stock available.';
          } else {
            this.validationErrors.soldQuantity = '';
          }
          break;
        default:
          break;
      }
    },
  },
  persist: true,
});
