package com.example.emp.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "payroll")
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String empid;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private int year;

    @Column(name = "basic_salary")
    private double basicSalary;

    private double bonus;
    private double deductions;

    @Column(name = "net_salary")
    private double netSalary;

    @Column(name = "payment_date", updatable = false)
    private Timestamp paymentDate;

    public Payroll() { }

    public Payroll(String empid, String month, int year, double basicSalary, double bonus, double deductions) {
        this.empid = empid;
        this.month = month;
        this.year = year;
        this.basicSalary = basicSalary;
        this.bonus = bonus;
        this.deductions = deductions;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmpid() { return empid; }
    public void setEmpid(String empid) { this.empid = empid; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public double getBasicSalary() { return basicSalary; }
    public void setBasicSalary(double basicSalary) { this.basicSalary = basicSalary; }
    public double getBonus() { return bonus; }
    public void setBonus(double bonus) { this.bonus = bonus; }
    public double getDeductions() { return deductions; }
    public void setDeductions(double deductions) { this.deductions = deductions; }
    public double getNetSalary() { return netSalary; }
    public void setNetSalary(double netSalary) { this.netSalary = netSalary; }
    public Timestamp getPaymentDate() { return paymentDate; }
    public void setPaymentDate(Timestamp paymentDate) { this.paymentDate = paymentDate; }

    @PrePersist
    public void prePersist() {
        this.netSalary = this.basicSalary + this.bonus - this.deductions;
        this.paymentDate = new Timestamp(System.currentTimeMillis());
    }
}
