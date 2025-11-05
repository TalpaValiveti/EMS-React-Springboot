package com.example.emp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.emp.model.Payroll;
import com.example.emp.repository.PayrollRepository;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/payrolls")
public class PayrollController {

    @Autowired
    private PayrollRepository payrollRepo;

    @PostMapping
    public Payroll createPayroll(@RequestBody Payroll payroll) {
        return payrollRepo.save(payroll);
    }

    @GetMapping
    public List<Payroll> getAllPayroll() {
        return payrollRepo.findAll();
    }

    @GetMapping("/employee/{empid}")
    public List<Payroll> getPayrollByEmpId(@PathVariable String empid) {
        return payrollRepo.findByEmpid(empid);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id, @RequestBody Payroll payrollDetails) {
        Optional<Payroll> optionalPayroll = payrollRepo.findById(id);
        if (!optionalPayroll.isPresent()) return ResponseEntity.notFound().build();
        Payroll payroll = optionalPayroll.get();
        payroll.setEmpid(payrollDetails.getEmpid());
        payroll.setMonth(payrollDetails.getMonth());
        payroll.setYear(payrollDetails.getYear());
        payroll.setBasicSalary(payrollDetails.getBasicSalary());
        payroll.setBonus(payrollDetails.getBonus());
        payroll.setDeductions(payrollDetails.getDeductions());
        Payroll updated = payrollRepo.save(payroll);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long id) {
        Optional<Payroll> optionalPayroll = payrollRepo.findById(id);
        if (!optionalPayroll.isPresent()) return ResponseEntity.notFound().build();
        payrollRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
