package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.Address;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileRestController {

    private final UserService userService;

    public ProfileRestController(UserService userService) {
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByUsername(username);
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("address") String address,
            @RequestParam(value = "password", required = false) String password) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User updated = userService.updateUserProfile(user.getId(), username, email, password, address);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAddresses() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Collections.emptyList());
        }
        return ResponseEntity.ok(userService.getUserAddresses(user.getId()));
    }

    @PostMapping("/addresses/add")
    public ResponseEntity<?> addAddress(
            @RequestParam("street") String street,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam("zipCode") String zipCode,
            @RequestParam("country") String country) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Address address = new Address();
        address.setStreet(street);
        address.setCity(city);
        address.setState(state);
        address.setZipCode(zipCode);
        address.setCountry(country);
        Address saved = userService.addAddress(user.getId(), address);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/addresses/delete/{id}")
    public ResponseEntity<String> deleteAddress(@PathVariable("id") int addressId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        userService.deleteAddress(user.getId(), addressId);
        return ResponseEntity.ok("Success");
    }
}
