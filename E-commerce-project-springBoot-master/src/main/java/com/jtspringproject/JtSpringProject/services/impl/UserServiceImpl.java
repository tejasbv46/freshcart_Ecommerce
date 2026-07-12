package com.jtspringproject.JtSpringProject.services.impl;

import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.models.Address;
import com.jtspringproject.JtSpringProject.repositories.UserRepository;
import com.jtspringproject.JtSpringProject.repositories.AddressRepository;
import com.jtspringproject.JtSpringProject.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, AddressRepository addressRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User addUser(User user) {
        if (user.getPassword() != null && !isPasswordEncoded(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("ROLE_NORMAL");
        }
        return userRepository.save(user);
    }

    @Override
    public boolean checkUserExists(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public User getUserByUsername(String username) {
        // No auto-hashing on read path to prevent performance bottlenecks and DB locks during authentication
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public User getUserById(int id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public User updateUserProfile(int userId, String username, String email, String password, String address) {
        User existingUser = userRepository.findById(userId).orElse(null);
        if (existingUser == null) {
            return null;
        }

        existingUser.setUsername(username);
        existingUser.setEmail(email);
        existingUser.setAddress(address);

        if (password != null && !password.trim().isEmpty()) {
            existingUser.setPassword(isPasswordEncoded(password) ? password : passwordEncoder.encode(password));
        }

        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public Address addAddress(int userId, Address address) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            address.setUser(user);
            return addressRepository.save(address);
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteAddress(int userId, int addressId) {
        addressRepository.findById(addressId).ifPresent(address -> {
            if (address.getUser().getId() == userId) {
                addressRepository.delete(address);
            }
        });
    }

    @Override
    public List<Address> getUserAddresses(int userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null ? user.getAddresses() : Collections.emptyList();
    }

    private boolean isPasswordEncoded(String password) {
        return password != null
                && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }
}
