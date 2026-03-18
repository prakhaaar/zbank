const API = "https://api.zbank.prakharhq.site/api/v1"; //cors  i

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const bot = {
  // Auth
  register: (data) =>
    fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: (data) =>
    fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  me: () =>
    fetch(`${API}/auth/me`, { headers: headers() }).then((r) => r.json()),

  logout: () =>
    fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: headers(),
    }).then((r) => r.json()),

  // Accounts
  getAccounts: () =>
    fetch(`${API}/accounts`, { headers: headers() }).then((r) => r.json()),

  getAccount: (id) =>
    fetch(`${API}/accounts/${id}`, { headers: headers() }).then((r) =>
      r.json(),
    ),

  getTransactions: (id, page = 1, limit = 10) =>
    fetch(`${API}/accounts/${id}/transactions?page=${page}&limit=${limit}`, {
      headers: headers(),
    }).then((r) => r.json()),

  deposit: (data) =>
    fetch(`${API}/accounts/deposit`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  lookupAccount: (account_number) =>
    fetch(`${API}/accounts/lookup/${account_number}`, {
      headers: headers(),
    }).then((r) => r.json()),
  // Transactions
  transfer: (data) =>
    fetch(`${API}/transactions/transfer`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};
