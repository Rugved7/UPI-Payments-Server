package com.rugved.paymentProject.repository;

import com.rugved.paymentProject.model.VirtualPaymentAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VpaRepository extends JpaRepository<VirtualPaymentAddress, Long> {
    Optional<VirtualPaymentAddress> findByVpa(String vpa);
    List<VirtualPaymentAddress> findByUserId(Long userId);
    Optional<VirtualPaymentAddress> findByUserIdAndIsPrimaryTrue(Long userId);
    boolean existsByVpa(String Vpa);

    @Query("SELECT COUNT(v) > 0 FROM VirtualPaymentAddress v WHERE v.vpa = :vpa AND v.user.id != :userId")
    boolean existsByVpaAndUserIdNot(@Param("vpa") String vpa, @Param("userId") Long userId);
}
