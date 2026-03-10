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

  // Retained for upgrade compatibility with previous version
  stable var seedProducts : [Product] = [];

  // Stable storage - survives upgrades
  stable var stableClients : [Client] = [];
  stable var stableOrders : [Order] = [];
  stable var stableProducts : [Product] = [];
  stable var stableClientsCounter : Nat = 0;
  stable var stableOrdersCounter : Nat = 0;
  stable var stableProductsCounter : Nat = 0;

  // In-memory working state rebuilt from stable on startup
  let clients = Map.empty<Nat, Client>();
  let orders = Map.empty<Nat, Order>();
  let products = Map.empty<Nat, Product>();

  var clientsCounter = stableClientsCounter;
  var ordersCounter = stableOrdersCounter;
  var productsCounter = stableProductsCounter;

  // Restore data from stable arrays on startup
  for (c in stableClients.vals()) { clients.add(c.id, c) };
  for (o in stableOrders.vals()) { orders.add(o.id, o) };
  for (p in stableProducts.vals()) { products.add(p.id, p) };

  // Save to stable before upgrade
  system func preupgrade() {
    stableClients := clients.values().toArray();
    stableOrders := orders.values().toArray();
    stableProducts := products.values().toArray();
    stableClientsCounter := clientsCounter;
    stableOrdersCounter := ordersCounter;
    stableProductsCounter := productsCounter;
  };

  // Clear stable arrays after upgrade (data is back in Maps)
  system func postupgrade() {
    stableClients := [];
    stableOrders := [];
    stableProducts := [];
  };

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

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, category : Text, basePrice : Nat, costPrice : Nat) : async Bool {
    switch (products.get(id)) {
      case null { false };
      case (?_existing) {
        let updated : Product = {
          id;
          name;
          category;
          basePrice;
          costPrice;
        };
        products.add(id, updated);
        true;
      };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };
};
