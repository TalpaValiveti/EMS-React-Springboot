import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function EmployeeDashboard() {
  const { empid } = useParams();
  const [employee, setEmployee] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [analyticsMonth, setAnalyticsMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

  // Fetch employee info
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/employee/${empid}`)
      .then(res => { setEmployee(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [empid]);

  // Fetch payrolls for employee
  useEffect(() => {
    if (!employee) return;
    axios.get("http://localhost:8080/api/payrolls")
      .then(res => setPayrolls(res.data.filter(p => String(p.empid) === String(employee.id) || p.empid === employee.empid)))
      .catch(err => console.error(err));
  }, [employee]);

  // Compute analytics whenever payrolls/month/year change
  useEffect(() => {
    if (!employee) return;
    const filtered = payrolls.filter(p =>
      p.month.toLowerCase() === analyticsMonth.toLowerCase() &&
      Number(p.year) === Number(analyticsYear)
    );

    let totalPayout = 0;
    filtered.forEach(p => totalPayout += p.netSalary);

    const salaryHistory = {};
    filtered.forEach(p => {
      salaryHistory[`${p.month} ${p.year}`] = p.netSalary;
    });

    setAnalytics({ totalPayrollRecords: filtered.length, totalPayout, salaryHistory });
  }, [payrolls, analyticsMonth, analyticsYear, employee]);

  const handleLogout = () => navigate("/");

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>Employee not found</p>;

  return (
    <div style={{ display: "flex", fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", background: "#2c3e50", color: "#fff", padding: "20px" }}>
        <h2>Employee Dashboard</h2>
        <button onClick={handleLogout} style={{ marginTop: 20, padding: "10px 20px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        <h3>Employee Information</h3>
        <div style={{ marginTop: "20px", backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
          {Object.entries(employee).map(([key, val]) => (
            <p key={key}><strong>{key.toUpperCase()}:</strong> {val}</p>
          ))}
        </div>

        {/* Analytics */}
        <h3 style={{ marginTop: 40 }}>Payroll Analytics</h3>

        {/* Month & Year Select */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <select value={analyticsMonth} onChange={e=>setAnalyticsMonth(e.target.value)} style={{ padding: "5px 10px", borderRadius: 5 }}>
            {months.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <select value={analyticsYear} onChange={e=>setAnalyticsYear(e.target.value)} style={{ padding: "5px 10px", borderRadius: 5 }}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <div style={cardStyle}><div>Total Payroll Records</div><div>{analytics.totalPayrollRecords}</div></div>
          <div style={cardStyle}><div>Total Payout</div><div>${analytics.totalPayout?.toFixed(2)}</div></div>
        </div>

        {analytics.salaryHistory && Object.keys(analytics.salaryHistory).length>0 && (
          <div style={{ maxWidth: 600, marginTop: 40 }}>
            <Bar
              data={{
                labels: Object.keys(analytics.salaryHistory),
                datasets:[{label:"Salary", data:Object.values(analytics.salaryHistory), backgroundColor:"#4caf50"}]
              }}
              options={{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = { flex:1, background:"#fff", padding:16, borderRadius:8, textAlign:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.05)" };

export default EmployeeDashboard;
