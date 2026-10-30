// core domain types. some of the older components still declare their own
// inline copies of these -- eventually those should import from here.

export type AccountType = "brokerage" | "ira" | "checking" | "savings" | "external";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  number: string;        // last 4, displayed as •••• 1234
  balance: number;
  cash?: number;         // cash sweep for investment accounts
  apy?: number;          // savings only
  openedOn: string;
};

export type Position = {
  id: string;
  accountId: string;
  symbol: string;
  shares: number;
  costBasisPerShare: number;  // 0 when basis wasn't carried over (transferred-in lots)
};

export type Transaction = {
  id: string;
  accountId: string;
  date: string;          // ISO-ish, "2026-10-15T12:00:00"
  description: string;
  amount: number;        // negative = money out
  category: string;
  pending?: boolean;
};

export type TransferFrequency = "once" | "weekly" | "monthly";

export type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  frequency: TransferFrequency;
  scheduledFor?: string; // "2026-11-01" for future-dated
  memo?: string;
  status: "scheduled" | "processing" | "completed" | "failed" | "cancelled";
  createdAt: string;
};

export type Card = {
  id: string;
  accountId: string;
  label: string;
  last4: string;
  number: string;        // full (fake) number, masked in the UI by default
  cvv: string;
  expiry: string;        // "09/29"
  frozen: boolean;
  dailyLimit: number;    // dollars
  international: boolean;
  openedOn: string;
};

export type Statement = {
  id: string;
  accountId: string;
  month: string;         // "2026-09"
  beginning: number;
  deposits: number;
  withdrawals: number;
  interest: number;
  dividends: number;
  fees: number;
  marketActivity: number; // investment accounts only, 0 otherwise
  ending: number;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  paperless: boolean;
  alerts: boolean;
};
