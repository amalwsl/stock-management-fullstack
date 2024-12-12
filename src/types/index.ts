export interface User {
  _id: string |undefined;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: string;
  password:string
}

export interface Vehicle {
  _id: string;
  type: string;
  name: string;
  model: string;
  year: number;
}

export interface Part {
  _id: string | undefined;
  reference: string;
  referenceOrg: string;
  turboType: string;
  vehicleType: string;
  model: string;
  description: string;
  quantity: number;
  size: string;
  image: string;
  createdAt: string;
  updatedBy: string|null;
  state:"Pièce"|"Turbo terminé"
}

export interface Consultation {
  _id: string | undefined;
  reference: string;
  referenceOrg: string;
  turboType: string;
  vehicleType: string;
  model: string;
  description: string;
  size: string;
  image: string;
  createdAt: string;
  updatedBy: string|null;
  receptionDate:string;
  issueDate:string;
  isFixed:string;
  state:"Pièce"|"Turbo terminé"
}

export interface StockHistory {
  _id: string;
  partId: string;
  userId: string;
  type: 'input' | 'output';
  quantity: number;
  date: string;
  notes: string;
}