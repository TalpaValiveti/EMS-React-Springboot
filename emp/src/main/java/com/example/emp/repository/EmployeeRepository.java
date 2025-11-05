package com.example.emp.repository;

import com.example.emp.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmpid(String empid);
    Optional<Employee> findTopByOrderByIdDesc();

}
