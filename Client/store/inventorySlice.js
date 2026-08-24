import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';

// Async Thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.inventory.getAll(params);
      return response.inventories || response.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch inventory');
    }
  }
);

export const createInventory = createAsyncThunk(
  'inventory/createInventory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.inventory.create(data);
      return response.inventory || response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create inventory item');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/updateInventory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.inventory.update(id, data);
      return response.inventory || response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update inventory item');
    }
  }
);

export const deleteInventory = createAsyncThunk(
  'inventory/deleteInventory',
  async (id, { rejectWithValue }) => {
    try {
      await api.inventory.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete inventory item');
    }
  }
);

export const distributeInventory = createAsyncThunk(
  'inventory/distributeInventory',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.inventory.distribute(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to distribute stock');
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  'inventory/fetchLowStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.inventory.getLowStock();
      return response.inventories || response.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch low stock items');
    }
  }
);

export const fetchHistory = createAsyncThunk(
  'inventory/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.inventory.getHistory();
      return response.history || response.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch transfer history');
    }
  }
);

const initialState = {
  items: [],
  lowStockItems: [],
  history: [],
  loading: false,
  error: null,
  successMessage: null,
  filters: {
    search: '',
    category: 'All',
    status: 'All',
    sku: ''
  }
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Inventory
      .addCase(createInventory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.successMessage = 'Inventory item created successfully';
      })
      .addCase(createInventory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Inventory
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = 'Inventory item updated successfully';
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete Inventory
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.successMessage = 'Inventory item deleted successfully';
      })
      .addCase(deleteInventory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Distribute Inventory
      .addCase(distributeInventory.fulfilled, (state, action) => {
        if (action.payload?.updatedSource) {
          const idx = state.items.findIndex(i => i.id === action.payload.updatedSource.id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload.updatedSource };
          }
        }
        if (action.payload?.transferRecord) {
          state.history.unshift(action.payload.transferRecord);
        }
        state.successMessage = 'Stock distributed successfully';
      })
      .addCase(distributeInventory.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Low Stock
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
      })

      // History
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  }
});

export const { setFilter, clearMessages } = inventorySlice.actions;
export default inventorySlice.reducer;
