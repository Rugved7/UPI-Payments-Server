package com.rugved.paymentProject.repository;

import com.rugved.paymentProject.model.PaymentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, Long> {
    Optional<PaymentRequest> findByRequestId(String requestId);
    
    List<PaymentRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    
    List<PaymentRequest> findByPayerIdOrderByCreatedAtDesc(Long payerId);
    
    @Query("SELECT pr FROM PaymentRequest pr WHERE (pr.requester.id = :userId OR pr.payer.id = :userId) ORDER BY pr.createdAt DESC")
    List<PaymentRequest> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT pr FROM PaymentRequest pr WHERE pr.payer.id = :userId AND pr.status = 'PENDING' ORDER BY pr.createdAt DESC")
    List<PaymentRequest> findPendingRequestsForPayer(@Param("userId") Long userId);
    
    long countByPayerIdAndStatus(Long payerId, PaymentRequest.RequestStatus status);
}
