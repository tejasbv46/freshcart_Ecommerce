package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.Brand;
import java.util.List;

public interface ProductService {
    List<Product> getProducts();
    Product addProduct(Product product);
    Product getProduct(int id);
    Product updateProduct(int id, Product product);
    boolean deleteProduct(int id);
    List<Product> getProductsByCategory(int categoryId);
    List<Product> searchProducts(String query);
    
    // Filtered & Sorted Search
    List<Product> getProductsFiltered(String query, Integer categoryId, Integer brandId, String sort, Boolean inStockOnly);
    
    // Brand Management
    List<Brand> getAllBrands();
    Brand getBrand(int brandId);
    Brand getBrandByName(String name);
    Brand addBrand(Brand brand);
    boolean deleteBrand(int brandId);
}
