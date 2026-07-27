import { mockInvestors } from "./investors";
import { mockInvestments } from "./investments";
import { getAllPayments } from "./payments";
import { mockLoans } from "./loans";
import { mockReports } from "./reports";
import { mockContracts } from "./contracts";
import { mockNotifications, mockActivities } from "./analytics";
import { investorTimeline, adminTimeline } from "./timeline";
import { michaelInvestment } from "./investments";
import { investorPayments } from "./payments";
import { mockReports as reports } from "./reports";
import { mockContracts as contracts } from "./contracts";

export const mockApi = {
  investors: mockInvestors,
  investments: mockInvestments,
  loans: mockLoans,
  payments: getAllPayments(),
  reports: mockReports,
  contracts: mockContracts,
  notifications: mockNotifications,
  activities: mockActivities,
  investorTimeline,
  adminTimeline,
  michaelInvestment,
  investorPayments,
  investorReports: reports.filter((r) => r.investorId === "inv-1"),
  investorContracts: contracts.filter((c) => c.investorId === "inv-1"),
};

export function getAdminStats() {
  const totalInvestors = mockInvestors.filter((i) => i.status === "active").length;
  const totalInvestments = mockInvestments.length;
  const portfolioValue = mockInvestments.reduce((s, i) => s + i.principal, 0);
  const outstanding = mockInvestments.reduce((s, i) => s + i.outstandingBalance, 0);
  const interestEarned = mockInvestments.reduce((s, i) => s + i.interestEarned, 0);
  const upcoming = getAllPayments().filter((p) => p.status === "upcoming").length;
  const overdue = getAllPayments().filter((p) => p.status === "overdue").length;
  return {
    totalInvestors,
    totalInvestments,
    portfolioValue,
    outstanding,
    interestEarned,
    upcomingPayments: upcoming,
    overduePayments: overdue,
    collectionRate: 98.4,
    portfolioGrowth: 12.6,
  };
}
