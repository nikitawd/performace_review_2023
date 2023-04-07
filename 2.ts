interface CompletedOrder {
  status: "completed";
  customerName: string;
}

interface PendingOrder {
  status: "pending";
}

type Order = CompletedOrder | PendingOrder;

// * 1. Write a custom type guard checking if order is completed

// * 2. Write a function which accepts order and returns customer name
