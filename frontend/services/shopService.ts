import api from './api';

export const shopService = {
    async getAllItems() {
        const response = await api.get('/shop/items');
        return response.data;
    },
    async getInventory() {
        const response = await api.get('/shop/inventory');
        return response.data;
    },
    async buyItem(itemName: string) {
        const response = await api.post(`/shop/buy/${encodeURIComponent(itemName)}`);
        return response.data;
    },
    async equipItem(itemName: string) {
        const response = await api.post(`/shop/equip/${encodeURIComponent(itemName)}`);
        return response.data;
    },
};