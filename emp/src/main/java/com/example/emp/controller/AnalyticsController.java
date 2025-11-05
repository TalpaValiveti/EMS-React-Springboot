package com.example.emp.controller;

import com.example.emp.model.Payroll;
import com.example.emp.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private PayrollRepository payrollRepo;

    @GetMapping
    public Map<String, Object> getPayrollAnalytics() {
        List<Payroll> payrolls = payrollRepo.findAll();

        if (payrolls.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("totalEmployees", 0);
            empty.put("totalPayrolls", 0);
            empty.put("totalPayout", 0);
            empty.put("monthWiseSalary", new HashMap<>());
            empty.put("empWiseSalary", new HashMap<>());
            return empty;
        }

        long totalEmployees = payrolls.stream().map(Payroll::getEmpid).distinct().count();
        long totalPayrolls = payrolls.size();
        double totalPayout = payrolls.stream().mapToDouble(Payroll::getNetSalary).sum();

        Map<String, Double> monthWiseSalary = payrolls.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getMonth().substring(0, 1).toUpperCase() + p.getMonth().substring(1).toLowerCase(),
                        Collectors.summingDouble(Payroll::getNetSalary)
                ));

        Map<String, Double> empWiseSalary = payrolls.stream()
                .collect(Collectors.groupingBy(
                        Payroll::getEmpid,
                        Collectors.summingDouble(Payroll::getNetSalary)
                ));

        Map<String, Object> response = new HashMap<>();
        response.put("totalEmployees", totalEmployees);
        response.put("totalPayrolls", totalPayrolls);
        response.put("totalPayout", totalPayout);
        response.put("monthWiseSalary", monthWiseSalary);
        response.put("empWiseSalary", empWiseSalary);

        return response;
    }
}
