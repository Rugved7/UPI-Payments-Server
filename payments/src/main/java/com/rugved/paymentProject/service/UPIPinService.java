package com.rugved.paymentProject.service;

public interface UPIPinService {
    void setUPIPin(Long userId, String upiPin);

    boolean validateUPIPin(Long userId, String upiPin);

    void changeUPIPin(Long userId, String oldPin, String newPin);
}
