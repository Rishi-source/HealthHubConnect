import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import {
  TrendingUp, Users, Calendar, DollarSign, Clock,
  Star, ArrowUp, ArrowDown, Filter, ChevronDown,
  Activity, FileText, MessageSquare, Calendar as CalendarIcon
} from 'lucide-react';

const monthlyData = [
  { month: 'Jan', patients: 120, revenue: 12000, appointments: 180 },
  { month: 'Feb', patients: 150, revenue: 15000, appointments: 220 },
  { month: 'Mar', patients: 180, revenue: 18000, appointments: 260 },
  { month: 'Apr', patients: 160, revenue: 16000, appointments: 240 },
  { month: 'May', patients: 200, revenue: 20000, appointments: 300 },
  { month: 'Jun', patients: 220, revenue: 22000, appointments: 320 }
];

const patientDistribution = [
  { name: 'New', value: 45, color: '#10B981' },
  { name: 'Returning', value: 35, color: '#3B82F6' },
  { name: 'Referral', value: 20, color: '#6366F1' }
];

const timeSlotData = [
  { time: '9-11 AM', appointments: 45 },
  { time: '11-1 PM', appointments: 35 },
  { time: '2-4 PM', appointments: 50 },
  { time: '4-6 PM', appointments: 30 }
];

const satisfactionData = [
  { category: 'Very Satisfied', value: 45, color: '#10B981' },
  { category: 'Satisfied', value: 30, color: '#3B82F6' },
  { category: 'Neutral', value: 15, color: '#6366F1' },
  { category: 'Unsatisfied', value: 10, color: '#EF4444' }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, trend, percentage, icon: Icon }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm"
  >
    <div className="flex justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
        <div className="flex items-center gap-2 mt-2">
          {trend === 'up' ? (
            <ArrowUp className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            {percentage}% vs last month
          </span>
        </div>
      </div>
      <div className="p-4 bg-teal-50 rounded-xl">
        <Icon className="w-6 h-6 text-teal-500" />
      </div>
    </div>
  </motion.div>
);

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-500">Monitor your practice performance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg
                appearance-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white border
            border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-500" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value="1,248"
          trend="up"
          percentage="12"
          icon={Users}
        />
        <StatCard
          title="Appointments"
          value="156"
          trend="up"
          percentage="8"
          icon={Calendar}
        />
        <StatCard
          title="Revenue"
          value="$15,840"
          trend="down"
          percentage="3"
          icon={DollarSign}
        />
        <StatCard
          title="Average Rating"
          value="4.8"
          trend="up"
          percentage="2"
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue & Appointments</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="appointments"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Patient Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label
                >
                  {patientDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Popular Time Slots</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="appointments" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Patient Satisfaction</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { icon: Calendar, text: "New appointment scheduled with Sarah Johnson", time: "5 mins ago" },
              { icon: FileText, text: "Prescription issued for Michael Chen", time: "1 hour ago" },
              { icon: MessageSquare, text: "New message from Emily Davis", time: "2 hours ago" },
              { icon: Star, text: "New 5-star review received", time: "3 hours ago" }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="p-2 bg-teal-50 rounded-lg">
                  <activity.icon className="w-5 h-5 text-teal-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{activity.text}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Upcoming Appointments</h3>
          <div className="space-y-4">
            {[
              { name: "Sarah Johnson", time: "10:00 AM", type: "Follow-up" },
              { name: "Michael Chen", time: "11:30 AM", type: "New Patient" },
              { name: "Emily Davis", time: "2:00 PM", type: "Check-up" }
            ].map((apt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{apt.name}</p>
                    <p className="text-sm text-gray-500">{apt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-teal-600">{apt.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;