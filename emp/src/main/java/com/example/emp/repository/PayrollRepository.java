package com.example.emp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.emp.model.Payroll;
import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmpid(String empid);
}
