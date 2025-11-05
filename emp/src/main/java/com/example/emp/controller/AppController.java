package com.example.emp.controller;

import com.example.emp.model.*;
import com.example.emp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AppController {

    @Autowired private UserRepository userRepo;
    @Autowired private EmployeeRepository empRepo;
    @Autowired private NotificationRepository notifRepo;

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Optional<User> optionalUser = userRepo.findByUsername(user.getUsername().trim());
        if (optionalUser.isEmpty())
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username"));

        User u = optionalUser.get();
        if (!u.getPassword().equals(user.getPassword().trim()))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));

        return ResponseEntity.ok(u);
    }

    // --- CREATE EMPLOYEE (HR) ---
   @PostMapping("/employees")
public Employee createEmployee(@RequestBody Employee emp) {
    if (emp.getEmpid() == null || emp.getEmpid().isEmpty()) {
        // Get last employee by ID
        Optional<Employee> lastEmpOpt = empRepo.findTopByOrderByIdDesc();
        int nextId = lastEmpOpt.map(e -> Integer.parseInt(e.getEmpid())).orElse(0) + 1;
        emp.setEmpid(String.format("%03d", nextId)); // zero-padded 3 digits like 009, 010
    }
    Employee savedEmp = empRepo.save(emp);

    // Notify admin
    String msg = "New employee added: " + savedEmp.getName() + " (EmpID: " + savedEmp.getEmpid() + ")";
    notifRepo.save(new Notification(msg));

    return savedEmp;
}


    // --- GET ALL EMPLOYEES ---
    @GetMapping("/employees")
    public List<Employee> getEmployees() {
        return empRepo.findAll();
    }

    // --- GET SINGLE EMPLOYEE BY EMPID ---
    @GetMapping("/employee/{empid}")
    public ResponseEntity<?> getEmployee(@PathVariable String empid) {
        Optional<Employee> empOpt = empRepo.findByEmpid(empid);
        if (empOpt.isPresent()) return ResponseEntity.ok(empOpt.get());
        else return ResponseEntity.status(404).body(Map.of("error", "Employee not found"));
    }

    // --- ADMIN NOTIFICATIONS ---
    @GetMapping("/notifications")
    public List<Notification> getNotifications() {
        return notifRepo.findByIsReadFalse();
    }

    @PutMapping("/notifications/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        Notification n = notifRepo.findById(id).orElseThrow();
        n.setRead(true);
        return notifRepo.save(n);
    }

    // --- ADMIN CREATES USER CREDENTIALS ---
    @PostMapping("/createUser")
    public User createUser(@RequestBody User user) {
        return userRepo.save(user);
    }

    // --- GET ALL USERS (for Admin Dashboard) ---
    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepo.findAll();
    }

    // --- UPDATE EMPLOYEE ---
    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee updated) {
        Optional<Employee> empOpt = empRepo.findById(id);
        if (empOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Employee not found"));

        Employee emp = empOpt.get();
        emp.setName(updated.getName());
        emp.setEmail(updated.getEmail());
        emp.setDepartment(updated.getDepartment());
        emp.setDesignation(updated.getDesignation());
        emp.setSalary(updated.getSalary());
        empRepo.save(emp);
        return ResponseEntity.ok(emp);
    }

    // --- DELETE EMPLOYEE ---
    @DeleteMapping("/employees/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!empRepo.existsById(id))
            return ResponseEntity.status(404).body(Map.of("error", "Employee not found"));

        empRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("success", "Employee deleted"));
    }

    // --- ADMIN ALERT: Employees without User accounts ---
    @GetMapping("/missing-credentials")
    public List<Employee> getEmployeesWithoutUser() {
        List<Employee> employees = empRepo.findAll();
        List<Employee> missingUsers = new ArrayList<>();
        for (Employee e : employees) {
            boolean exists = userRepo.findByEmpid(e.getEmpid()).isPresent();
            if (!exists) missingUsers.add(e);
        }
        return missingUsers;
    }
}

