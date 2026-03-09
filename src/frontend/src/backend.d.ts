import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Client {
    id: bigint;
    clientType: string;
    instagram: string;
    favoriteTruffles: string;
    email: string;
    notes: string;
    importantDates: string;
    isVip: boolean;
    phone: string;
    lastName: string;
    favoriteFlowers: string;
    firstName: string;
}
export interface Order {
    id: bigint;
    status: string;
    deliveryAddress: string;
    clientId: bigint;
    clientName: string;
    createdAt: bigint;
    deliveryDate: string;
    productName: string;
    deposit: bigint;
    occasion: string;
    notes: string;
    quantity: bigint;
    price: bigint;
    isPickup: boolean;
}
export interface Product {
    id: bigint;
    name: string;
    category: string;
    costPrice: bigint;
    basePrice: bigint;
}
export interface backendInterface {
    addClient(firstName: string, lastName: string, phone: string, instagram: string, email: string, clientType: string, favoriteFlowers: string, favoriteTruffles: string, importantDates: string, notes: string, isVip: boolean): Promise<bigint>;
    addOrder(clientId: bigint, clientName: string, productName: string, quantity: bigint, occasion: string, deliveryDate: string, deliveryAddress: string, isPickup: boolean, price: bigint, deposit: bigint, status: string, notes: string, createdAt: bigint): Promise<bigint>;
    addProduct(name: string, category: string, basePrice: bigint, costPrice: bigint): Promise<bigint>;
    getAllClients(): Promise<Array<Client>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getOrdersByStatus(status: string): Promise<Array<Order>>;
}
