package com.jtspringproject.JtSpringProject.repositories;

import com.jtspringproject.JtSpringProject.models.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    Optional<Coupon> findByCodeIgnoreCaseAndActiveTrue(String code);
}
