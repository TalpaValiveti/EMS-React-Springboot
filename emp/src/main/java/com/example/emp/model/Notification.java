package com.example.emp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private boolean isRead = false;

    public Notification() {}
    public Notification(String message) { this.message = message; }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean getIsRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}

