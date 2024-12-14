import { defineStore } from 'pinia'

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [
      {
        id: 1,
        customer: "John Doe",
        date: "2024-11-01",
        status: "Pending",
        total: 150000,
        paymentMethod: "Down Payment",
        unitName: "Toyota Camry",
        quantity: 1,
        selectedAccessories: [],
        unitPrice: 150000,
        unitPriceAddOns: 0,
        totalPrice: 150000
      }
    ],
    accessories: [
      { value: 'sporty-bumper', text: 'Sporty bumper (P7,000)' },
      { value: 'hood-chrome', text: 'Hood with chrome (P1,500)' },
      { value: 'door-trim-pillar', text: 'Door trim and pillar (P3,000)' },
      { value: 'chrome-side-mirror', text: 'Chrome side mirror with light (P1,400)' },
      { value: 'fender-flare', text: 'Fender flare (P4,500)' },
      { value: 'upgrade-15-inch-mags', text: 'Upgrade to 15 inches mags (P8,000)' },
      { value: 'steel-bumper', text: 'Steel bumper (P4,000)' },
      { value: 'back-step-board', text: 'Back step board (P3,500)' },
      { value: 'headlight-garnish', text: 'Headlight garnish (P1,400)' },
      { value: 'tail-light-garnish', text: 'Tail light garnish (P1,300)' },
      { value: 'wiper-stainless', text: 'Wiper stainless (P600)' },
      { value: 'gastank', text: 'Gastank (P450)' },
      { value: 'back-wiper-cover', text: 'Back wiper cover (P750)' },
      { value: 'side-body-trim', text: 'Side body trim (P1,300)' },
      { value: 'third-brake-light', text: 'Third brake light (P650)' },
      { value: 'ceiling', text: 'Ceiling (P1,500)' },
      { value: 'checkered-stepboard', text: 'Checkered stepboard (P1,600)' },
      { value: 'door-handle', text: 'Door handle (P1,300)' },
      { value: 'led-headlight', text: 'LED headlight (P1,300)' }
    ],
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 5,
    sortBy: "",
    sortOrder: "asc",
    viewModalVisible: false,
    additionalAccessoriesModalVisible: false,
    isModalVisible: false,
    deleteModalVisible: false,
    checkModalVisible: false,
    checkedOrder: null,
    selectedOrder: null,
    modalTitle: "",
    accessoriesNone: "",
    modalOrder: {
      id: null,
      customer: "",
      date: "",
      status: "",
      total: 0,
      paymentMethod: "",
    },
    validationErrors: {
      showCustomerError: false,
      showDateError: false,
      showStatusError: false,
      showTotalError: false,
      showPaymentError: false,
      showUnitNameError: false,
      showUnitPriceError: false,
      showQuantityError: false,
      unitNameError: '',
      customerError: '',
      unitPriceError: '',
      quantityError: '',
      dateError: '',
      statusError: '',
      totalError: '',
      paymentError: '',
    }
  }),

  getters: {
    hasValidationErrors() {
      return (
        !this.modalOrder.customer ||
        !this.modalOrder.unitName ||
        this.modalOrder.unitPrice <= 0 ||
        this.modalOrder.quantity <= 0 ||
        this.modalOrder.customer.length === 0 ||
        this.modalOrder.date.length === 0 ||
        this.modalOrder.status.length === 0 ||
        this.modalOrder.total <= 0 ||
        isNaN(this.modalOrder.total) ||
        this.modalOrder.paymentMethod.length === 0
      );
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    filteredOrders() {
      const updatedOrders = this.orders.map(order => {
        order.totalPrice = (order.unitPrice * order.quantity) + order.unitPriceAddOns;

        if (order.total === order.totalPrice) {
          order.status = "Completed";
        }
        return order;
      });

      let filtered = updatedOrders.filter(order => {
        return (
          order.customer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.date.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.status.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          order.paymentMethod.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });

      if (this.sortBy) {
        filtered.sort((a, b) => {
          const factor = this.sortOrder === "asc" ? 1 : -1;
          if (typeof a[this.sortBy] === "string") {
            return factor * a[this.sortBy].localeCompare(b[this.sortBy]);
          } else {
            return factor * (a[this.sortBy] - b[this.sortBy]);
          }
        });
      }

      return filtered;
    },
    filteredPaginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    },
    totalAddOns() {
      return this.modalOrder.selectedAccessories.reduce((sum, accessoryValue) => {
        return sum + this.getAccessoryPrice(accessoryValue);
      }, 0);
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
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    formatPrice(value) {
      if (typeof value !== 'number') return '₱0';
      return `₱${value.toLocaleString('en-US')}`;
    },
    closeModal() {
      this.isModalVisible = false;
      this.modalOrder = {
        id: null,
        customer: "",
        date: "",
        status: "",
        total: 0,
        paymentMethod: "",
      };
      this.resetErrorFlags();
    },
    viewOrder(order) {
      this.selectedOrder = order;
      this.viewModalVisible = true;
      this.accessoriesNone = this.selectedOrder.selectedAccessories.length === 0 ? 'None' : '';
    },
    closeViewModal() {
      this.viewModalVisible = false;
    },
    closeDeleteModal() {
      this.deleteModalVisible = false;
    },
    deleteOrder(order) {
      this.selectedOrder = order;
      this.deleteModalVisible = true;
    },
    confirmDelete() {
      this.orders = this.orders.filter((order) => order.id !== this.selectedOrder.id);
      this.closeDeleteModal();
    },
    openAddOrderModal() {
      const validationRules = {
        unitNameError: '',
        showUnitNameError: false,
        unitPriceError: '',
        showUnitPriceError: false,
        quantityError: '',
        showQuantityError: false,
        customerError: '',
        showCustomerError: false,
        dateError: '',
        showDateError: false,
        statusError: '',
        showStatusError: false,
        totalError: '',
        showTotalError: false,
        paymentError: '',
        showPaymentError: false
      };

      Object.entries(validationRules).forEach(([key, value]) => {
        this.validationErrors[key] = value;
      });

      this.modalTitle = "Add New Order";
      this.modalOrder = {
        id: null,
        customer: "",
        unitName: "",
        unitPrice: 0,
        quantity: 0,
        date: "",
        status: "",
        total: 0,
        paymentMethod: "",
        selectedAccessories: []
      };
      this.isModalVisible = true;
    },
    editOrder(order) {
      this.modalTitle = "Edit Order";
      this.modalOrder = { ...order };
      this.isModalVisible = true;
      this.resetErrorFlags();
    },
    saveOrder() {
      this.validateField('customer');
      this.validateField('unitName');
      this.validateField('unitPrice');
      this.validateField('quantity');
      this.validateField('date');
      this.validateField('status');
      this.validateField('total');
      this.validateField('paymentMethod');

      if (
        this.validationErrors.showCustomerError ||
        this.validationErrors.showUnitNameError ||
        this.validationErrors.showUnitPriceError ||
        this.validationErrors.showQuantityError ||
        this.validationErrors.showDateError ||
        this.validationErrors.showStatusError ||
        this.validationErrors.showTotalError ||
        this.validationErrors.showPaymentError
      ) {
        return;
      }

      const index = this.orders.findIndex((order) => order.id === this.modalOrder.id);
      if (index !== -1) {
        this.orders.splice(index, 1, { ...this.modalOrder });
      } else {
        const newId = this.orders.length
          ? Math.max(...this.orders.map((order) => order.id)) + 1
          : 1;
        this.orders.push({ ...this.modalOrder, id: newId });
      }

      this.closeModal();
    },
    resetErrorFlags() {
      Object.keys(this.validationErrors).forEach(key => {
        if (key.startsWith('show') || key.startsWith('error')) {
          this.validationErrors[key] = false;
        }
      });
    },
    validateField(field) {
      const validationRules = {
        customer: {
          validate: () => (!this.modalOrder.customer ? 'Customer name is required.' : ''),
          errorKey: 'customerError',
          showErrorKey: 'showCustomerError',
        },
        unitName: {
          validate: () => (!this.modalOrder.unitName ? 'Unit Name is required.' : ''),
          errorKey: 'unitNameError',
          showErrorKey: 'showUnitNameError',
        },
        unitPrice: {
          validate: () => !this.modalOrder.unitPrice || this.modalOrder.unitPrice <= 0 ? 'Please enter a valid unit price.' : '',
          errorKey: 'unitPriceError',
          showErrorKey: 'showUnitPriceError',
        },
        quantity: {
          validate: () => !this.modalOrder.quantity || this.modalOrder.quantity <= 0 ? 'Please enter a valid quantity.' : '',
          errorKey: 'quantityError',
          showErrorKey: 'showQuantityError',
        },
        date: {
          validate: () => (!this.modalOrder.date ? 'Date is required.' : ''),
          errorKey: 'dateError',
          showErrorKey: 'showDateError',
        },
        status: {
          validate: () => (!this.modalOrder.status ? 'Status is required.' : ''),
          errorKey: 'statusError',
          showErrorKey: 'showStatusError',
        },
        total: {
          validate: () => !this.modalOrder.total || this.modalOrder.total <= 0 ? 'Please enter a valid total.' : '',
          errorKey: 'totalError',
          showErrorKey: 'showTotalError',
        },
        paymentMethod: {
          validate: () => (!this.modalOrder.paymentMethod ? 'Payment Method is required.' : ''),
          errorKey: 'paymentError',
          showErrorKey: 'showPaymentError',
        },
      };

      const rule = validationRules[field];
      if (rule) {
        const errorMessage = rule.validate();
        this.validationErrors[rule.errorKey] = errorMessage;
        this.validationErrors[rule.showErrorKey] = !!errorMessage;
      }
    },
    markAsChecked(order) {
      this.checkedOrder = order;
      this.checkModalVisible = true;
      this.orders = this.orders.filter((o) => o.id !== order.id);
    },
    closeCheckModal() {
      this.checkModalVisible = false;
    },
    openAdditionalAccessoriesModal() {
      this.modalOrder.selectedAccessories = this.modalOrder.selectedAccessories || [];
      this.additionalAccessoriesModalVisible = true;
    },
    closeAdditionalAccessoriesModal() {
      this.modalOrder.selectedAccessories = [];
      this.additionalAccessoriesModalVisible = false;
    },
    confirmAdditionalAccessories() {
      const totalAddOns = this.modalOrder.selectedAccessories.reduce((sum, accessoryValue) => {
        return sum + this.getAccessoryPrice(accessoryValue);
      }, 0);

      this.modalOrder.unitPriceAddOns = totalAddOns;
      this.modalOrder.totalPrice = (this.modalOrder.total + totalAddOns) * this.modalOrder.quantity;

      alert(`${this.modalOrder.selectedAccessories.length} accessories have been added to your order for ${this.modalOrder.customer}.`);

      this.closeAdditionalAccessoriesModal();
    },
    getAccessoryPrice(accessoryValue) {
      const accessory = this.accessories.find(acc => acc.value === accessoryValue);
      if (accessory) {
        const priceMatch = accessory.text.match(/\(P(\d+(?:,\d{3})*)\)/);
        if (priceMatch) {
          return parseFloat(priceMatch[1].replace(',', ''));
        }
      }
      return 0;
    },
  }
});
