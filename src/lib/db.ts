// in-memory "database" for the demo. everything is seeded from JSON files on
// first access and lives in a globalThis singleton so it survives dev hot
// reloads. restarting the server resets it, which is actually kind of handy.

import accountsJson from "@/data/accounts.json";
import positionsJson from "@/data/positions.json";
import cardsJson from "@/data/cards.json";
import statementsJson from "@/data/statements.json";
import type {
  Account,
  Card,
  DemoUser,
  Notification,
  Position,
  Statement,
  Transaction,
  Transfer,
} from "./types";

export type Store = {
  idSeq: number;
  user: DemoUser;
  accounts: Account[];
  positions: Position[];
  transactions: Transaction[];
  transfers: Transfer[];
  cards: Card[];
  statements: Statement[];
  notifications: Notification[];
};

// ------------------------------------------------------------------
// seed data
// ------------------------------------------------------------------

// [day, description, amount, category]
const CHECKING_ROWS: [number, string, number, string][] = [
  [1, "Rent — Sunset Ridge Apts", -1650.0, "Housing"],
  [5, "Trader Joe's", -142.33, "Groceries"],
  [7, "Blue Bottle Coffee", -6.75, "Dining"],
  [11, "Shell gas station", -48.2, "Gas"],
  [12, "Netflix", -15.49, "Subscription"],
  [15, "Payroll — ACME Corp", 2850.0, "Payroll"],
  [18, "City Power & Light", -96.11, "Utilities"],
  [21, "Little Star Pizza", -63.4, "Dining"],
  [22, "Credit card payment — Chase", -1050.0, "Payment"],
  [25, "Auto-save to savings", -500.0, "Transfer"],
  [26, "Transfer to brokerage", -2000.0, "Transfer"],
  [30, "Payroll — ACME Corp", 2850.0, "Payroll"],
];

const SAVINGS_ROWS: [number, string, number, string][] = [
  [25, "Transfer from Schwab Checking", 500.0, "Transfer"],
  [30, "Interest earned", 74.38, "Interest"],
];

const BROKERAGE_ROWS: [number, string, number, string][] = [
  [15, "Dividend — SCHB", 12.44, "Dividend"],
  [26, "Transfer from Schwab Checking", 2000.0, "Transfer"],
];

const IRA_ROWS: [number, string, number, string][] = [
  [30, "Dividend — SWPPX", 9.87, "Dividend"],
];

const MONTHS = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
const CURRENT_MONTH = "2026-10";

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

// build the transaction history: a repeating monthly pattern across the seed
// months, plus a one-off ACH deposit that landed mid-September.
function generateTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  let seq = 0;

  const templates: [string, [number, string, number, string][]][] = [
    ["acct_checking", CHECKING_ROWS],
    ["acct_savings", SAVINGS_ROWS],
    ["acct_brokerage", BROKERAGE_ROWS],
    ["acct_ira", IRA_ROWS],
  ];

  for (const month of MONTHS) {
    for (const [accountId, rows] of templates) {
      for (const [day, description, amount, category] of rows) {
        seq++;
        const pending = month === CURRENT_MONTH && day >= 30;
        txs.push({
          id: `tx_${month}_${accountId}_${seq}`,
          accountId,
          date: `${month}-${pad(day)}T12:00:00`,
          description,
          amount,
          category,
          pending,
        });
      }
    }
  }

  // the one-off: car sale proceeds, showed up as an inbound ACH on Sep 15
  txs.push({
    id: "tx_2026-09_ach_deposit",
    accountId: "acct_checking",
    date: "2026-09-15T09:02:00",
    description: "ACH deposit — First National Bank",
    amount: 5000.0,
    category: "Deposit",
  });

  return txs.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function seedTransfers(): Transfer[] {
  return [
    {
      id: "tr_ach_deposit",
      fromAccountId: "acct_ext_fnb",
      toAccountId: "acct_checking",
      amount: 5000.0,
      frequency: "once",
      status: "completed",
      createdAt: "2026-09-15T09:02:00",
      memo: "Car sale proceeds",
    },
    {
      id: "tr_autosave_oct",
      fromAccountId: "acct_checking",
      toAccountId: "acct_savings",
      amount: 500.0,
      frequency: "monthly",
      status: "completed",
      createdAt: "2026-10-25T06:00:00",
      memo: "Auto-save",
    },
    {
      id: "tr_invest_oct",
      fromAccountId: "acct_checking",
      toAccountId: "acct_brokerage",
      amount: 2000.0,
      frequency: "monthly",
      status: "completed",
      createdAt: "2026-10-26T06:00:00",
      memo: "Monthly investing",
    },
    {
      id: "tr_autosave_nov",
      fromAccountId: "acct_checking",
      toAccountId: "acct_savings",
      amount: 500.0,
      frequency: "monthly",
      status: "scheduled",
      scheduledFor: "2026-11-01",
      createdAt: "2026-10-01T08:00:00",
      memo: "Auto-save",
    },
    {
      id: "tr_reimb_nov",
      fromAccountId: "acct_ext_fnb",
      toAccountId: "acct_checking",
      amount: 1500.0,
      frequency: "once",
      status: "scheduled",
      scheduledFor: "2026-11-13",
      createdAt: "2026-10-27T10:12:00",
      memo: "Reimbursement",
    },
  ];
}

function seedNotifications(): Notification[] {
  return [
    {
      id: "ntf_div_oct",
      title: "Dividend posted",
      body: "SCHB paid a dividend of $12.44 to Individual Brokerage.",
      date: "2026-10-15T12:00:00",
      read: true,
    },
    {
      id: "ntf_stmt_sep",
      title: "Statement available",
      body: "Your September 2026 statements are ready to view.",
      date: "2026-09-30T06:00:00",
      read: true,
    },
    {
      id: "ntf_xfer_done",
      title: "Transfer completed",
      body: "$500.00 auto-save transfer to High-Yield Investor Savings completed.",
      date: "2026-10-25T06:00:00",
      read: false,
    },
    {
      id: "ntf_signin",
      title: "New sign-in detected",
      body: "New sign-in from macOS · Chrome on October 28. If this wasn't you, change your password.",
      date: "2026-10-28T21:12:00",
      read: false,
    },
  ];
}

function createSeed(): Store {
  // NOTE: clone the JSON data. module-level imports are cached, so mutating
  // the arrays directly would poison the seed for the rest of the process.
  return {
    idSeq: 100,
    user: {
      id: "user_connor",
      name: "Connor Green",
      email: "connor.demo@example.com",
      paperless: true,
      alerts: true,
    },
    accounts: structuredClone(accountsJson) as Account[],
    positions: structuredClone(positionsJson) as Position[],
    transactions: generateTransactions(),
    transfers: seedTransfers(),
    cards: structuredClone(cardsJson) as Card[],
    statements: structuredClone(statementsJson) as Statement[],
    notifications: seedNotifications(),
  };
}

// ------------------------------------------------------------------
// accessors
// ------------------------------------------------------------------

export function getStore(): Store {
  const g = globalThis as any;
  if (!g.__demoStore) {
    g.__demoStore = createSeed();
  }
  return g.__demoStore;
}

export function resetStore(): void {
  const g = globalThis as any;
  g.__demoStore = createSeed();
}

export function nextId(prefix: string): string {
  const store = getStore();
  store.idSeq += 1;
  return `${prefix}_${store.idSeq}`;
}

export function getAccount(id: string): Account | undefined {
  return getStore().accounts.find((a) => a.id === id);
}
