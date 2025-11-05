import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function HRDashboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [analyticsMonth, setAnalyticsMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", department: "", designation: "", salary: "" });
  const [newPayroll, setNewPayroll] = useState({ empid: "", month: analyticsMonth, year: analyticsYear, basicSalary: "", bonus: "", deductions: "" });

  // Fetch employees
  const fetchEmployees = () => {
    setLoading(true);
    axios.get("http://localhost:8080/api/employees")
      .then(res => { setEmployees(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  // Fetch payrolls
  const fetchPayrolls = () => {
    axios.get("http://localhost:8080/api/payrolls")
      .then(res => setPayrolls(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  useEffect(() => {
    const filtered = payrolls.filter(p =>
      p.month.toLowerCase() === analyticsMonth.toLowerCase() &&
      Number(p.year) === Number(analyticsYear)
    );

    let totalPayout = 0;
    const salaryByEmployee = {};
    filtered.forEach(p => {
      totalPayout += p.netSalary;
      const emp = employees.find(e => Number(e.id) === Number(p.empid));
      salaryByEmployee[emp ? emp.name : p.empid] = p.netSalary;
    });

    setAnalytics({ totalEmployees: employees.length, totalPayroll: filtered.length, totalPayout, salaryByEmployee });
  }, [payrolls, employees, analyticsMonth, analyticsYear]);

  const handleLogout = () => navigate("/");

  // Employee CRUD
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    const payload = { ...currentEmployee || newEmployee, salary: Number(currentEmployee ? currentEmployee.salary : newEmployee.salary) };
    if (currentEmployee) {
      axios.put(`http://localhost:8080/api/employees/${currentEmployee.id}`, payload)
        .then(() => { fetchEmployees(); setShowEmployeeForm(false); setCurrentEmployee(null); })
        .catch(err => console.error(err));
    } else {
      axios.post("http://localhost:8080/api/employees", payload)
        .then(() => { fetchEmployees(); setShowEmployeeForm(false); setNewEmployee({ name: "", email: "", department: "", designation: "", salary: "" }); })
        .catch(err => console.error(err));
    }
  };

  const handleEmployeeDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      axios.delete(`http://localhost:8080/api/employees/${id}`).then(fetchEmployees).catch(console.error);
    }
  };

  // Payroll CRUD
  const handlePayrollSubmit = (e) => {
    e.preventDefault();
    const payload = { ...currentPayroll || newPayroll };
    if (currentPayroll) {
      axios.put(`http://localhost:8080/api/payrolls/${currentPayroll.id}`, payload)
        .then(() => { fetchPayrolls(); setShowPayrollForm(false); setCurrentPayroll(null); })
        .catch(err => console.error(err));
    } else {
      axios.post("http://localhost:8080/api/payrolls", payload)
        .then(() => { fetchPayrolls(); setShowPayrollForm(false); setNewPayroll({ empid: "", month: analyticsMonth, year: analyticsYear, basicSalary: "", bonus: "", deductions: "" }); })
        .catch(err => console.error(err));
    }
  };

  const handlePayrollDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      axios.delete(`http://localhost:8080/api/payrolls/${id}`).then(fetchPayrolls).catch(console.error);
    }
  };

  if (loading) return <p>Loading...</p>;

  // --- Render Tables ---
  const renderTable = (data, type) => (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
      <thead style={{ backgroundColor: "#4caf50", color: "#fff" }}>
        <tr>
          {data.length > 0 && Object.keys(data[0]).map(key => (<th key={key} style={{ padding: "12px", textAlign: "left" }}>{key.toUpperCase()}</th>))}
          <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id} style={{ backgroundColor: "#f9f9f9" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dcedc8"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f9f9f9"}>
            {Object.keys(row).map((key, i) => (
              <td key={i} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {key === "paymentDate" ? new Date(row[key]).toLocaleDateString() : row[key]}
              </td>
            ))}
            <td style={{ padding: "10px" }}>
              <button onClick={() => { type==="employees"?setCurrentEmployee(row):setCurrentPayroll(row); type==="employees"?setShowEmployeeForm(true):setShowPayrollForm(true); }} style={btnBlue}>Edit</button>
              <button onClick={() => type==="employees"?handleEmployeeDelete(row.id):handlePayrollDelete(row.id)} style={btnRed}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const btnBlue = { marginRight: "5px", padding: "5px 10px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
  const btnRed = { padding: "5px 10px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };
  const btnGreen = { padding: "10px 20px", marginRight: "10px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

  return (
    <div style={{ display: "flex", fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", background: "#2c3e50", color: "#fff", padding: "20px" }}>
        <h2>HR Dashboard</h2>
        {["employees","payroll","analytics"].map(t => (
          <div key={t} onClick={()=>setTab(t)} style={{ padding:"10px 15px", margin:"8px 0", cursor:"pointer", backgroundColor: tab===t?"#34495e":"transparent", borderRadius:5 }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </div>
        ))}
        <button onClick={handleLogout} style={{ marginTop: 20, ...btnRed }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        {tab==="employees" && <>
          <button onClick={()=>setShowEmployeeForm(true)} style={btnGreen}>Create Employee</button>
          {renderTable(employees,"employees")}
        </>}
        {tab==="payroll" && <>
          <button onClick={()=>setShowPayrollForm(true)} style={btnGreen}>Add Payroll</button>
          {renderTable(payrolls,"payroll")}
        </>}
        {tab==="analytics" && <>
          <h3>Payroll Analytics</h3>

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
            <div style={cardStyle}><div>Total Employees</div><div>{analytics.totalEmployees}</div></div>
            <div style={cardStyle}><div>Total Payroll Records</div><div>{analytics.totalPayroll}</div></div>
            <div style={cardStyle}><div>Total Payout</div><div>${analytics.totalPayout?.toFixed(2)}</div></div>
          </div>
          {analytics.salaryByEmployee && Object.keys(analytics.salaryByEmployee).length>0 && (
            <div style={{ maxWidth: 600, marginTop: 40 }}>
              <Bar
                data={{
                  labels: Object.keys(analytics.salaryByEmployee),
                  datasets:[{label:"Salary", data:Object.values(analytics.salaryByEmployee), backgroundColor:"#4caf50"}]
                }}
                options={{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }}
              />
            </div>
          )}
        </>}
      </div>

      {/* Modal Forms */}
      {showEmployeeForm && <ModalForm title={currentEmployee?"Update Employee":"Create Employee"} data={currentEmployee||newEmployee} setData={currentEmployee?setCurrentEmployee:setNewEmployee} onSubmit={handleEmployeeSubmit} onClose={()=>{setShowEmployeeForm(false);setCurrentEmployee(null)}} />}
      {showPayrollForm && <ModalForm title={currentPayroll?"Update Payroll":"Add Payroll"} data={currentPayroll||newPayroll} setData={currentPayroll?setCurrentPayroll:setNewPayroll} onSubmit={handlePayrollSubmit} onClose={()=>{setShowPayrollForm(false);setCurrentPayroll(null)}} />}
    </div>
  );
}

const cardStyle = { flex:1, background:"#fff", padding:16, borderRadius:8, textAlign:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.05)" };

// ModalForm Component
const ModalForm = ({title,data,setData,onSubmit,onClose}) => (
  <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%", background:"rgba(0,0,0,0.3)", display:"flex", justifyContent:"center", alignItems:"center" }}>
    <form onSubmit={onSubmit} style={{ background:"#fff", padding:30, borderRadius:8, width:400 }}>
      <h3>{title}</h3>
      {Object.keys(data).map(field => {
        if(field==="id" || field==="netSalary" || field==="paymentDate") return null;
        return <input key={field} placeholder={field.charAt(0).toUpperCase()+field.slice(1)} value={data[field]} onChange={e=>setData({...data,[field]:e.target.value})} style={{ width:"100%",padding:10,marginBottom:15,borderRadius:5,border:"1px solid #ccc" }} />
      })}
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <button type="submit" style={{ ...{padding:"10px 20px", background:"#4caf50", color:"#fff", border:"none", borderRadius:5, cursor:"pointer"} }}>Submit</button>
        <button type="button" onClick={onClose} style={{ ...{padding:"10px 20px", background:"#f44336", color:"#fff", border:"none", borderRadius:5, cursor:"pointer"} }}>Cancel</button>
      </div>
    </form>
  </div>
);

export default HRDashboard;
