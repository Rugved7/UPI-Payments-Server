package com.rugved.paymentProject.repository;

import com.rugved.paymentProject.model.ERole;
import com.rugved.paymentProject.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role,Integer> {
    Optional<Role> findByName(ERole name);
}
