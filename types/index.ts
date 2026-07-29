export type UserRole = "admin" | "investor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  company?: string;
  title?: string;
  joinedAt: string;
}

export type PaymentStatus =
  | "completed"
  | "upcoming"
  | "scheduled"
  | "overdue"
  | "future"
  | "partially_paid"
  | "cancelled";

export type InvestmentStatus = "active" | "matured" | "closed" | "pending";

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
  totalInvested: number;
  outstandingBalance: number;
  joinedAt: string;
}

export interface Investment {
  id: string;
  investorId: string;
  investorName: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  outstandingBalance: number;
  interestEarned: number;
  principalRepaid: number;
  status: InvestmentStatus;
  startDate: string;
  maturityDate: string;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  paymentDay?: number;
  repaymentModel?: string;
  gracePeriodMonths?: number;
  balloonAmount?: number;
}

export interface Loan {
  id: string;
  investmentId: string;
  investorId?: string;
  borrower: string;
  amount: number;
  rate: number;
  status: InvestmentStatus;
  fundedAt: string;
}

export interface Payment {
  id: string;
  investmentId: string;
  investorId: string;
  sequence?: number;
  dueDate: string;
  paymentDate: string | null;
  principal: number;
  interest: number;
  total: number;
  remainingBalance: number;
  amountPaid?: number;
  status: PaymentStatus;
}

export type TimelineEventType =
  | "investment_started"
  | "loan_funded"
  | "scheduled_payment"
  | "completed_payment"
  | "interest_payment"
  | "upcoming_payment"
  | "overdue_payment"
  | "loan_closed";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  amount?: number;
  status: "completed" | "upcoming" | "future" | "overdue";
}

export type ReportCategory =
  | "monthly"
  | "quarterly"
  | "annual"
  | "kpi"
  | "other";

export interface Report {
  id: string;
  title: string;
  category: ReportCategory;
  period: string;
  uploadedAt: string;
  size: string;
  fileUrl?: string;
  fileName?: string;
  investorId?: string;
  assignedInvestors?: string[];
}

export type ContractType =
  | "loan_agreement"
  | "subordinated_loan"
  | "amendment"
  | "additional";

export interface Contract {
  id: string;
  title: string;
  type: ContractType;
  signedAt: string;
  size: string;
  fileUrl?: string;
  fileName?: string;
  investorId?: string;
  assignedInvestors?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "payment" | "report" | "system" | "alert";
}

export interface Activity {
  id: string;
  action: string;
  subject: string;
  timestamp: string;
  user: string;
}

export interface ChartPoint {
  month: string;
  value?: number;
  principal?: number;
  interest?: number;
}
