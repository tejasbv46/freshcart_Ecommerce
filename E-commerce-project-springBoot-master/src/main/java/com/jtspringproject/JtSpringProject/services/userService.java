package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.models.Address;
import java.util.List;

public interface UserService {
    List<User> getUsers();
    User addUser(User user);
    boolean checkUserExists(String username);
    User getUserByUsername(String username);
    User getUserById(int id);
    User updateUserProfile(int userId, String username, String email, String password, String address);
    User saveUser(User user);
    
    // Address-specific actions
    Address addAddress(int userId, Address address);
    void deleteAddress(int userId, int addressId);
    List<Address> getUserAddresses(int userId);
}
