package com.rugved.paymentProject.service;

import com.rugved.paymentProject.dto.VpaRequest;
import com.rugved.paymentProject.model.VirtualPaymentAddress;

import java.util.List;
import java.util.Optional;

public interface VpaService {

    VirtualPaymentAddress createVpa(VpaRequest vpaRequest, Long userId);
    List<VirtualPaymentAddress> getUserVpas(Long userId);
    VirtualPaymentAddress setPrimaryVpa(String vpa, Long userId);
    boolean checkVpaAvailability(String vpa);
    boolean deleteVpa(String vpa, Long userId);
    Optional<VirtualPaymentAddress> getVpaByAddress(String vpa);
}
