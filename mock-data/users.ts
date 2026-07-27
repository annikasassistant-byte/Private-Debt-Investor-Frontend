import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "usr-admin-1",
    name: "John Anderson",
    email: "admin@buyback.com",
    role: "admin",
    phone: "+49 30 1234 5678",
    company: "BuyBack Capital",
    title: "Platform Administrator",
    joinedAt: "2022-03-15",
  },
  {
    id: "usr-inv-1",
    name: "Michael Thompson",
    email: "investor@buyback.com",
    role: "investor",
    phone: "+49 89 9876 5432",
    company: "Thompson Family Office",
    title: "Managing Partner",
    joinedAt: "2024-01-10",
  },
];
