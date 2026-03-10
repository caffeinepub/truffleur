import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";

actor {
  type Client = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    phone : Text;
    instagram : Text;
    email : Text;
    clientType : Text;
    favoriteFlowers : Text;
    favoriteTruffles : Text;
    importantDates : Text;
    notes : Text;
    isVip : Bool;
  };

  type Order = {
    id : Nat;
    clientId : Nat;
    clientName : Text;
    productName : Text;
    quantity : Nat;
    occasion : Text;
    deliveryDate : Text;
    deliveryAddress : Text;
    isPickup : Bool;
    price : Nat;
    deposit : Nat;
    status : Text;
    notes : Text;
    createdAt : Int;
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    basePrice : Nat;
    costPrice : Nat;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  let clients = Map.empty<Nat, Client>();
  let orders = Map.empty<Nat, Order>();
  let products = Map.empty<Nat, Product>();

  var clientsCounter = 0;
  var ordersCounter = 0;
  var productsCounter = 0;

  let seedProducts = [
    {
      id = 0;
      name = "Bouquet";
      category = "Flowers";
      basePrice = 30_000;
      costPrice = 10_000;
    },
    {
      id = 1;
      name = "Truffle Box";
      category = "Chocolates";
      basePrice = 20_000;
      costPrice = 8_000;
    },
    {
      id = 2;
      name = "Gift Basket";
      category = "Gifts";
      basePrice = 50_000;
      costPrice = 20_000;
    },
    {
      id = 3;
      name = "Single Rose";
      category = "Flowers";
      basePrice = 5_000;
      costPrice = 2_000;
    },
    {
      id = 4;
      name = "Mixed Chocolate Box";
      category = "Chocolates";
      basePrice = 25_000;
      costPrice = 10_000;
    },
  ];

  public shared ({ caller }) func addClient(firstName : Text, lastName : Text, phone : Text, instagram : Text, email : Text, clientType : Text, favoriteFlowers : Text, favoriteTruffles : Text, importantDates : Text, notes : Text, isVip : Bool) : async Nat {
    let clientId = clientsCounter;
    let client : Client = {
      id = clientId;
      firstName;
      lastName;
      phone;
      instagram;
      email;
      clientType;
      favoriteFlowers;
      favoriteTruffles;
      importantDates;
      notes;
      isVip;
    };
    clients.add(clientId, client);
    clientsCounter += 1;
    clientId;
  };

  public shared ({ caller }) func updateClient(id : Nat, firstName : Text, lastName : Text, phone : Text, instagram : Text, email : Text, clientType : Text, favoriteFlowers : Text, favoriteTruffles : Text, importantDates : Text, notes : Text, isVip : Bool) : async Bool {
    switch (clients.get(id)) {
      case null { false };
      case (?_existing) {
        let updated : Client = {
          id;
          firstName;
          lastName;
          phone;
          instagram;
          email;
          clientType;
          favoriteFlowers;
          favoriteTruffles;
          importantDates;
          notes;
          isVip;
        };
        clients.add(id, updated);
        true;
      };
    };
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    clients.values().toArray();
  };

  public shared ({ caller }) func addOrder(clientId : Nat, clientName : Text, productName : Text, quantity : Nat, occasion : Text, deliveryDate : Text, deliveryAddress : Text, isPickup : Bool, price : Nat, deposit : Nat, status : Text, notes : Text, createdAt : Int) : async Nat {
    let orderId = ordersCounter;
    let order : Order = {
      id = orderId;
      clientId;
      clientName;
      productName;
      quantity;
      occasion;
      deliveryDate;
      deliveryAddress;
      isPickup;
      price;
      deposit;
      status;
      notes;
      createdAt;
    };
    orders.add(orderId, order);
    ordersCounter += 1;
    orderId;
  };

  public shared ({ caller }) func updateOrder(id : Nat, clientId : Nat, clientName : Text, productName : Text, quantity : Nat, occasion : Text, deliveryDate : Text, deliveryAddress : Text, isPickup : Bool, price : Nat, deposit : Nat, status : Text, notes : Text) : async Bool {
    switch (orders.get(id)) {
      case null { false };
      case (?existing) {
        let updated : Order = {
          id;
          clientId;
          clientName;
          productName;
          quantity;
          occasion;
          deliveryDate;
          deliveryAddress;
          isPickup;
          price;
          deposit;
          status;
          notes;
          createdAt = existing.createdAt;
        };
        orders.add(id, updated);
        true;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByStatus(status : Text) : async [Order] {
    orders.values().toArray().filter(func(order) { order.status == status });
  };

  public shared ({ caller }) func addProduct(name : Text, category : Text, basePrice : Nat, costPrice : Nat) : async Nat {
    let productId = productsCounter;
    let product : Product = {
      id = productId;
      name;
      category;
      basePrice;
      costPrice;
    };
    products.add(productId, product);
    productsCounter += 1;
    productId;
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };
};
