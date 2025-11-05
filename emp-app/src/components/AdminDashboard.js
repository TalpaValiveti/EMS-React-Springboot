import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [missingEmployees, setMissingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = () => {
    axios.get("http://localhost:8080/api/users")
      .then(res => { setUsers(res.data); setFilteredUsers(res.data); })
      .catch(err => console.error(err));
  };

  const fetchMissingEmployees = () => {
    axios.get("http://localhost:8080/api/missing-credentials")
      .then(res => setMissingEmployees(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUsers(), fetchMissingEmployees()])
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => navigate("/");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8080/api/createUser", currentUser)
      .then(() => { fetchUsers(); fetchMissingEmployees(); setShowCreateForm(false); setCurrentUser(null); })
      .catch(err => console.error(err));
  };

  if (loading) return <p>Loading...</p>;

  // --- Analytics Cards ---
  const analyticsCards = [
    { title: "Total Users", value: users.length, filter: null },
    { title: "Employees without credentials", value: missingEmployees.length, filter: "missing" },
    { title: "Admins", value: users.filter(u => u.role === "Admin").length, filter: "Admin" },
    { title: "HR", value: users.filter(u => u.role === "HR").length, filter: "HR" },
    { title: "Employees", value: users.filter(u => u.role === "Employee").length, filter: "Employee" }
  ];

  const handleCardClick = (filter) => {
    if (activeFilter === filter || filter === null) {
      // Reset filter
      setFilteredUsers(users);
      setActiveFilter(null);
    } else if (filter === "missing") {
      setFilteredUsers(missingEmployees.map(emp => ({ ...emp, role: "Employee" })));
      setActiveFilter(filter);
    } else {
      setFilteredUsers(users.filter(u => u.role === filter));
      setActiveFilter(filter);
    }
  };

  return (
    <div style={{ display: "flex", fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", background: "#2c3e50", color: "#fff", padding: "20px" }}>
        <h2>Admin Dashboard</h2>
        <div style={{ marginTop: "20px", cursor: "pointer", padding: "10px", borderRadius: 5, backgroundColor: "#34495e" }}>
          Users
        </div>
        <button onClick={handleLogout} style={{ marginTop: 20, padding: "10px 20px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        {/* --- Interactive Analytics Cards (Modern Design) --- */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
          {analyticsCards.map(card => (
            <div
              key={card.title}
              onClick={() => handleCardClick(card.filter)}
              style={{
                flex: "1 1 220px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: activeFilter === card.filter
                  ? "0 8px 20px rgba(0,0,0,0.2)"
                  : "0 4px 12px rgba(0,0,0,0.1)",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                {card.title === "Admins" && "🛡️"}
                {card.title === "HR" && "📋"}
                {card.title === "Employees" && "👤"}
                {card.title === "Employees without credentials" && "⚠️"}
                {card.title === "Total Users" && "👥"}
              </div>
              <h4 style={{ margin: "5px 0", fontSize: "16px", textAlign: "center" }}>{card.title}</h4>
              <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* --- Missing Employees Alert --- */}
        {missingEmployees.length > 0 && (
          <div style={{ marginTop: "20px", backgroundColor: "#fff3cd", color: "#856404", padding: "15px", borderRadius: "5px" }}>
            <h4>New Employees without credentials:</h4>
            <ul>
              {missingEmployees.map(emp => (
                <li key={emp.id}>
                  {emp.name} (EmpID: {emp.empid}){" "}
                  <button onClick={() => { setCurrentUser({ username: "", password: "", role: "Employee", empid: emp.empid }); setShowCreateForm(true); }}
                          style={{ marginLeft: "10px", padding: "5px 10px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Create Credential
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showCreateForm && (
          <ModalForm
            title={`Create User for EmpID: ${currentUser?.empid}`}
            user={currentUser}
            setUser={setCurrentUser}
            onSubmit={handleCreateSubmit}
            onClose={() => { setShowCreateForm(false); setCurrentUser(null); }}
          />
        )}

        {/* --- Users Table --- */}
        <div style={{ marginTop: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#2196f3", color: "#fff" }}>
              <tr>
                {filteredUsers.length > 0 && Object.keys(filteredUsers[0]).map(key => (
                  <th key={key} style={{ padding: "12px", textAlign: "left" }}>{key.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ backgroundColor: "#f9f9f9", transition: "background-color 0.3s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dcedc8"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f9f9f9"}>
                  {Object.values(user).map((val, i) => (
                    <td key={i} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const ModalForm = ({ title, user, setUser, onSubmit, onClose }) => (
  <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <form onSubmit={onSubmit} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", width: "400px" }}>
      <h3 style={{ marginBottom: "20px" }}>{title}</h3>
      {["username", "password", "role", "empid"].map(field => (
        <input
          key={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={user[field]}
          onChange={e => setUser({ ...user, [field]: e.target.value })}
          readOnly={field === "role" || (field === "empid" && user.empid !== "")}
          style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
      ))}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Submit</button>
        <button type="button" onClick={onClose} style={{ padding: "10px 20px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
      </div>
    </form>
  </div>
);

export default AdminDashboard;
