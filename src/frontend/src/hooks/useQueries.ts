import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client, Order } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      phone: string;
      instagram: string;
      email: string;
      clientType: string;
      favoriteFlowers: string;
      favoriteTruffles: string;
      importantDates: string;
      notes: string;
      isVip: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addClient(
        data.firstName,
        data.lastName,
        data.phone,
        data.instagram,
        data.email,
        data.clientType,
        data.favoriteFlowers,
        data.favoriteTruffles,
        data.importantDates,
        data.notes,
        data.isVip,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      firstName: string;
      lastName: string;
      phone: string;
      instagram: string;
      email: string;
      clientType: string;
      favoriteFlowers: string;
      favoriteTruffles: string;
      importantDates: string;
      notes: string;
      isVip: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateClient(
        data.id,
        data.firstName,
        data.lastName,
        data.phone,
        data.instagram,
        data.email,
        data.clientType,
        data.favoriteFlowers,
        data.favoriteTruffles,
        data.importantDates,
        data.notes,
        data.isVip,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useAddOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      clientId: bigint;
      clientName: string;
      productName: string;
      quantity: bigint;
      occasion: string;
      deliveryDate: string;
      deliveryAddress: string;
      isPickup: boolean;
      price: bigint;
      deposit: bigint;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const createdAt = BigInt(Date.now()) * 1_000_000n;
      return actor.addOrder(
        data.clientId,
        data.clientName,
        data.productName,
        data.quantity,
        data.occasion,
        data.deliveryDate,
        data.deliveryAddress,
        data.isPickup,
        data.price,
        data.deposit,
        data.status,
        data.notes,
        createdAt,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      clientId: bigint;
      clientName: string;
      productName: string;
      quantity: bigint;
      occasion: string;
      deliveryDate: string;
      deliveryAddress: string;
      isPickup: boolean;
      price: bigint;
      deposit: bigint;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateOrder(
        data.id,
        data.clientId,
        data.clientName,
        data.productName,
        data.quantity,
        data.occasion,
        data.deliveryDate,
        data.deliveryAddress,
        data.isPickup,
        data.price,
        data.deposit,
        data.status,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
