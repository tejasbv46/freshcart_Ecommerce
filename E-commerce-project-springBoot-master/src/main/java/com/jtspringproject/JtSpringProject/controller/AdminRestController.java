package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.*;
import com.jtspringproject.JtSpringProject.services.CategoryService;
import com.jtspringproject.JtSpringProject.services.OrderService;
import com.jtspringproject.JtSpringProject.services.ProductService;
import com.jtspringproject.JtSpringProject.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    private final OrderService orderService;
    private final UserService userService;
    private final ProductService productService;
    private final CategoryService categoryService;

    public AdminRestController(OrderService orderService, UserService userService,
                               ProductService productService, CategoryService categoryService) {
        this.orderService = orderService;
        this.userService = userService;
        this.productService = productService;
        this.categoryService = categoryService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        List<Order> orders = orderService.getAllOrders();
        int totalRevenue = orders.stream().mapToInt(Order::getTotal).sum();
        int totalOrdersCount = orders.size();
        int totalUsersCount = userService.getUsers().size();

        List<Product> lowStock = productService.getProducts().stream()
                .filter(p -> p.getQuantity() < 25)
                .limit(6)
                .toList();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRevenue", totalRevenue);
        metrics.put("totalOrdersCount", totalOrdersCount);
        metrics.put("totalUsersCount", totalUsersCount);
        metrics.put("recentOrders", orders.size() > 5 ? orders.subList(0, 5) : orders);
        metrics.put("lowStockProducts", lowStock);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<User>> getCustomers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @PostMapping("/categories/add")
    public ResponseEntity<?> addCategory(@RequestParam("categoryname") String categoryName) {
        Category category = categoryService.addCategory(categoryName);
        return ResponseEntity.ok(category);
    }

    @PostMapping("/categories/update")
    public ResponseEntity<?> updateCategory(
            @RequestParam("categoryid") int id,
            @RequestParam("categoryname") String categoryName) {
        Category category = categoryService.updateCategory(id, categoryName);
        return ResponseEntity.ok(category);
    }

    @PostMapping("/categories/delete/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") int id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/brands/add")
    public ResponseEntity<?> addBrand(@RequestParam("name") String name) {
        Brand brand = new Brand();
        brand.setName(name);
        Brand saved = productService.addBrand(brand);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/products/add")
    public ResponseEntity<?> addProduct(
            @RequestParam("name") String name,
            @RequestParam("categoryid") int categoryId,
            @RequestParam(value = "brandId", required = false) Integer brandId,
            @RequestParam("price") int price,
            @RequestParam("weight") int weight,
            @RequestParam("quantity") int quantity,
            @RequestParam("description") String description,
            @RequestParam("productImage") String productImage) {
        Product product = buildProduct(name, categoryId, brandId, price, weight, quantity, description, productImage);
        Product saved = productService.addProduct(product);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/products/update/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable("id") int id,
            @RequestParam("name") String name,
            @RequestParam("categoryid") int categoryId,
            @RequestParam(value = "brandId", required = false) Integer brandId,
            @RequestParam("price") int price,
            @RequestParam("weight") int weight,
            @RequestParam("quantity") int quantity,
            @RequestParam("description") String description,
            @RequestParam("productImage") String productImage) {
        Product product = buildProduct(name, categoryId, brandId, price, weight, quantity, description, productImage);
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/products/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") int id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Success");
    }

    private Product buildProduct(String name, int categoryId, Integer brandId, int price, int weight, int quantity,
                                  String description, String productImage) {
        Category category = this.categoryService.getCategory(categoryId);
        Brand brandObj = null;
        if (brandId != null) {
            brandObj = this.productService.getBrand(brandId);
        }
        if (brandObj == null) {
            List<Brand> allBrands = this.productService.getAllBrands();
            if (!allBrands.isEmpty()) {
                brandObj = allBrands.get(0);
            }
        }

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setDescription(description);
        product.setPrice(price);
        product.setImage(productImage);
        product.setWeight(weight);
        product.setQuantity(quantity);
        product.setOriginalPrice(price);
        product.setDiscountPercentage(0);
        product.setBrand(brandObj);
        product.setStockStatus(quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK");
        return product;
    }
}
