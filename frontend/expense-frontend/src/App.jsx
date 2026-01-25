import { useState } from "react";
import { motion } from "framer-motion";
import api from "./api";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from "recharts";
import { Wallet, TrendingUp, PieChart as PieChartIcon, Download, Filter, Plus } from "lucide-react";

function App() {
  const [dailyData, setDailyData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [warning, setWarning] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const pieData = analytics
    ? Object.entries(analytics.by_category).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const handleLogin = async () => {
    try {
      const response = await api.post("users/login/", {
        email,
        password,
      });
      localStorage.setItem("access", response.data.access);
      setMessage("Login successful");
      setIsLoggedIn(true);
    } catch {
      setMessage("Login failed");
    }
  };

  const handleRegister = async () => {
  try {
    const response = await api.post("users/register/", {
      email,
      password,
    });
    setMessage("Registration successful. Please login.");
    setIsRegister(false);
  } catch (error) {
    setMessage(
      error.response?.data?.error || "Registration failed"
    );
  }
};


  const fetchAnalytics = async () => {
    const response = await api.get("analytics/monthly/");
    setAnalytics(response.data);
  };

  const fetchExpenses = async () => {
    let url = "expenses/?";
    if (filterMonth) url += `month=${filterMonth}&`;
    if (filterCategory) url += `category=${filterCategory}&`;
    const response = await api.get(url);
    setExpenses(response.data);
  };

  const fetchDailyAnalytics = async () => {
    const response = await api.get("analytics/daily/");
    setDailyData(response.data);
  };

  const downloadCSV = async () => {
    let url = "expenses/export/csv/?";
    if (filterMonth) url += `month=${filterMonth}&`;
    if (filterCategory) url += `category=${filterCategory}&`;
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "expenses.csv";
    link.click();
  };

  const downloadPDF = async () => {
    let url = "expenses/export/pdf/?";
    if (filterMonth) url += `month=${filterMonth}&`;
    if (filterCategory) url += `category=${filterCategory}&`;
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "expenses.pdf";
    link.click();
  };

  const addExpense = async () => {
    setWarning("");
    try {
      const response = await api.post("expenses/", {
        amount,
        category,
        date: new Date().toISOString().slice(0, 10),
        description: "Added from React",
      });

      if (response.data.warning) {
        setWarning(response.data.warning);
        setExpenses([...expenses, response.data.expense]);
      } else {
        setExpenses([...expenses, response.data]);
      }
      setAmount("");
    } catch (error) {
      console.log("BACKEND ERROR:", error.response.data);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-200 text-sm font-medium">{payload[0].name}</p>
          <p className="text-blue-400 text-lg font-bold">₹{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (!isLoggedIn) {
   return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Smart Expense Tracker
        </h1>
        <p className="text-slate-400 text-center mb-8">
          {isRegister ? "Create your account" : "Sign in to manage your finances"}
        </p>

        <div className="space-y-4">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          {!isRegister ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg"
            >
              Login
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg"
            >
              Register
            </motion.button>
          )}

          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            className="w-full text-sm text-slate-400 hover:text-white transition"
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don’t have an account? Register"}
          </button>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center text-sm ${
                message.includes("successful")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  </div>
);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Smart Expense Tracker
                </h1>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchExpenses}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-sm font-medium"
                >
                  Refresh
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-white">
                ₹{analytics?.total || 0}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/10 p-3 rounded-xl">
                  <PieChartIcon className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Categories</p>
              <p className="text-3xl font-bold text-white">
                {pieData.length}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500/10 p-3 rounded-xl">
                  <Wallet className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Transactions</p>
              <p className="text-3xl font-bold text-white">{expenses.length}</p>
            </motion.div>
          </motion.div>

          {/* Add Expense & Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Add Expense</h3>
              </div>
              <div className="space-y-4">
                <input
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Rent</option>
                  <option>Shopping</option>
                  <option>Other</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addExpense}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Add Expense
                </motion.button>
                {warning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-xl p-3"
                  >
                    <p className="text-red-400 text-sm">⚠️ {warning}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Filters & Export</h3>
              </div>
              <div className="space-y-4">
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Categories</option>
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Rent</option>
                  <option>Shopping</option>
                  <option>Other</option>
                </select>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchExpenses}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                  >
                    Apply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadCSV}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadPDF}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Analytics Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchAnalytics}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Fetch Analytics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchDailyAnalytics}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Fetch Daily Trend
            </motion.button>
          </motion.div>

          {/* Charts */}
          {analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Category-wise Spending
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ color: "#94a3b8" }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {dailyData.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Daily Spending Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          )}

          {/* Expenses List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Expenses
            </h3>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No expenses found. Add your first expense!
                </p>
              ) : (
                expenses.map((e, index) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {e.category[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{e.category}</p>
                        <p className="text-slate-400 text-sm">{e.date}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-white">₹{e.amount}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;