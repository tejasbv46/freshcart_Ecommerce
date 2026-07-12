package com.jtspringproject.JtSpringProject.services.impl;

import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.Brand;
import com.jtspringproject.JtSpringProject.repositories.ProductRepository;
import com.jtspringproject.JtSpringProject.repositories.BrandRepository;
import com.jtspringproject.JtSpringProject.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository, BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
    }

    @Override
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    @Override
    @Transactional
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product getProduct(int id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Product updateProduct(int id, Product product) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        existing.setName(product.getName());
        existing.setImage(product.getImage());
        existing.setCategory(product.getCategory());
        existing.setQuantity(product.getQuantity());
        existing.setPrice(product.getPrice());
        existing.setWeight(product.getWeight());
        existing.setDescription(product.getDescription());
        existing.setOriginalPrice(product.getOriginalPrice());
        existing.setDiscountPercentage(product.getDiscountPercentage());
        existing.setBrand(product.getBrand());
        existing.setRating(product.getRating());
        existing.setReviewsCount(product.getReviewsCount());
        existing.setStockStatus(product.getStockStatus());
        existing.setImageGallery(product.getImageGallery());
        existing.setSpecifications(product.getSpecifications());

        return productRepository.save(existing);
    }

    @Override
    @Transactional
    public boolean deleteProduct(int id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<Product> getProductsByCategory(int categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    @Override
    public List<Product> getProductsFiltered(String query, Integer categoryId, Integer brandId, String sort, Boolean inStockOnly) {
        List<Product> products = productRepository.findAll();

        if (query != null && !query.trim().isEmpty()) {
            String q = query.toLowerCase().trim();
            products = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(q) || 
                                 (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        if (categoryId != null) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getId() == categoryId)
                    .collect(Collectors.toList());
        }

        if (brandId != null) {
            products = products.stream()
                    .filter(p -> p.getBrand() != null && p.getBrand().getId() == brandId)
                    .collect(Collectors.toList());
        }

        if (inStockOnly != null && inStockOnly) {
            products = products.stream()
                    .filter(p -> p.getQuantity() > 0)
                    .collect(Collectors.toList());
        }

        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    products.sort((p1, p2) -> Integer.compare(p1.getPrice(), p2.getPrice()));
                    break;
                case "price_desc":
                    products.sort((p1, p2) -> Integer.compare(p2.getPrice(), p1.getPrice()));
                    break;
                case "rating_desc":
                    products.sort((p1, p2) -> Double.compare(p2.getRating(), p1.getRating()));
                    break;
                case "discount_desc":
                    products.sort((p1, p2) -> Integer.compare(p2.getDiscountPercentage(), p1.getDiscountPercentage()));
                    break;
                default:
                    // default order
                    break;
            }
        }

        return products;
    }

    @Override
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Override
    public Brand getBrand(int brandId) {
        return brandRepository.findById(brandId).orElse(null);
    }

    @Override
    public Brand getBrandByName(String name) {
        return brandRepository.findByName(name).orElse(null);
    }

    @Override
    @Transactional
    public Brand addBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    @Override
    @Transactional
    public boolean deleteBrand(int brandId) {
        if (brandRepository.existsById(brandId)) {
            brandRepository.deleteById(brandId);
            return true;
        }
        return false;
    }
}
