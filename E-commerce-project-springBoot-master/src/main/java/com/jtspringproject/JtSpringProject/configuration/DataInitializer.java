package com.jtspringproject.JtSpringProject.configuration;

import com.jtspringproject.JtSpringProject.models.*;
import com.jtspringproject.JtSpringProject.repositories.*;
import com.jtspringproject.JtSpringProject.services.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryService categoryService;
    private final ProductService productService;
    private final CouponRepository couponRepository;
    private final BrandRepository brandRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public DataInitializer(CategoryService categoryService, ProductService productService,
                           CouponRepository couponRepository, BrandRepository brandRepository,
                           OrderRepository orderRepository, ReviewRepository reviewRepository,
                           UserRepository userRepository, ProductRepository productRepository) {
        this.categoryService = categoryService;
        this.productService = productService;
        this.couponRepository = couponRepository;
        this.brandRepository = brandRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        Random random = new Random();

        // 1. Seed Categories (15 categories)
        List<Category> categories = categoryService.getCategories();
        if (categories.isEmpty()) {
            List<String> catNames = Arrays.asList(
                "Fruits", "Vegetables", "Meat", "Fish", "Dairy", 
                "Bakery", "Drinks", "Sweets", "Snacks", "Frozen Foods", 
                "Personal Care", "Household", "Baby Care", "Pet Care", "Other"
            );
            for (String catName : catNames) {
                categoryService.addCategory(catName);
            }
            categories = categoryService.getCategories();
        }

        // 2. Seed Brands (20 brands)
        List<Brand> brands = brandRepository.findAll();
        if (brands.isEmpty()) {
            List<String> brandNames = Arrays.asList(
                "FreshFruit", "Organics", "CitrusCo", "BerryFarms", "Alphonso", 
                "Tropical", "VeggieFarms", "GardenPick", "ButcherBlock", "MeatMaster", 
                "SeafoodCo", "OceanPick", "DairyPure", "CheeseLand", "BakerStreet", 
                "CocaCola", "PepsiCo", "Starbucks", "Cadbury", "Hellmanns"
            );
            for (String brandName : brandNames) {
                Brand b = new Brand();
                b.setName(brandName);
                b.setLogo("/images/brands/" + brandName.toLowerCase() + ".png");
                brandRepository.save(b);
            }
            brands = brandRepository.findAll();
        }

        // 3. Seed Users (1,000 users)
        if (userRepository.count() == 0) {
            // Seed Admin User
            User admin = new User();
            admin.setUsername("admin");
            // Use pre-hashed BCrypt password for "123" to keep server boot time very fast (less than 2s)
            admin.setPassword("$2a$10$w850h9H3L8qT27.2bBwK9edQ9021qGj2JjL5J5u4Gj3G7sK6dD6kC"); 
            admin.setEmail("admin@freshcart.com");
            admin.setRole("ROLE_ADMIN");
            admin.setAddress("123 FreshCart Office, Bangalore");
            userRepository.save(admin);

            // Seed normal user Lisa
            User lisa = new User();
            lisa.setUsername("lisa");
            lisa.setPassword("$2a$10$w850h9H3L8qT27.2bBwK9edQ9021qGj2JjL5J5u4Gj3G7sK6dD6kC"); // "123"
            lisa.setEmail("lisa@gmail.com");
            lisa.setRole("ROLE_NORMAL");
            lisa.setAddress("765 Park Avenue, Mumbai");
            userRepository.save(lisa);

            // Seed remaining 998 users in batch
            List<User> bulkUsers = new ArrayList<>();
            for (int i = 1; i <= 998; i++) {
                User u = new User();
                u.setUsername("user" + i);
                u.setPassword("$2a$10$w850h9H3L8qT27.2bBwK9edQ9021qGj2JjL5J5u4Gj3G7sK6dD6kC"); // "123"
                u.setEmail("user" + i + "@example.com");
                u.setRole("ROLE_NORMAL");
                u.setAddress(random.nextInt(999) + 1 + ", Main Street, New Delhi");
                bulkUsers.add(u);
            }
            userRepository.saveAll(bulkUsers);
        }
        List<User> users = userRepository.findAll();

        // 4. Seed 100+ Products (105 products, 7 per category)
        List<Product> products = productService.getProducts();
        if (products.isEmpty()) {
            String[][] productSeeds = {
                // Category Index, Name, Desc, Price, Original Price, Discount%, Weight, ImageURL
                {"0", "Red Apple", "Crisp organic apples", "3", "4", "25", "500", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80"},
                {"0", "Banana Bunch", "Sweet organic bananas", "2", "2", "0", "1000", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80"},
                {"0", "Juicy Oranges", "Tangy sun-ripened oranges", "3", "4", "25", "1000", "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80"},
                {"0", "Strawberries", "Fresh red strawberries", "5", "6", "16", "250", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80"},
                {"0", "Blueberries", "Organic sweet blueberries", "6", "8", "25", "150", "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80"},
                {"0", "Green Grapes", "Seedless green grapes", "4", "4", "0", "500", "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80"},
                {"0", "Fresh Mangoes", "Sweet Alphonso mangoes", "7", "10", "30", "1000", "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80"},
                
                {"1", "Organic Carrots", "Crisp baby carrots", "2", "3", "33", "500", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80"},
                {"1", "Fresh Broccoli", "Healthy green broccoli heads", "3", "3", "0", "400", "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80"},
                {"1", "Vine Tomatoes", "Juicy red tomatoes on vine", "2", "2", "0", "500", "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80"},
                {"1", "Red Onions", "Aromatic red onions", "2", "2", "0", "1000", "https://images.unsplash.com/photo-1580149375544-246599ef7f7c?w=400&q=80"},
                {"1", "Russet Potatoes", "Starchy potatoes for baking", "3", "4", "25", "2000", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80"},
                {"1", "Baby Spinach", "Tender fresh spinach leaves", "2", "3", "33", "200", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80"},
                {"1", "Crisp Cucumbers", "Cool English cucumbers", "2", "3", "33", "500", "https://images.unsplash.com/photo-1604974244888-29a2468e27c1?w=400&q=80"},

                {"2", "Chicken Breast", "Lean boneless chicken breast", "10", "12", "16", "500", "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80"},
                {"2", "Ribeye Steak", "Premium juicy beef ribeye", "25", "30", "16", "400", "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&q=80"},
                {"2", "Pork Chops", "Bone-in thick cut pork chops", "12", "12", "0", "600", "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80"},
                {"2", "Lamb Rack", "Tender premium rack of lamb", "28", "35", "20", "500", "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400&q=80"},
                {"2", "Ground Turkey", "Lean ground turkey breast", "8", "10", "20", "500", "https://images.unsplash.com/photo-1582294136932-d8a1db5fe76a?w=400&q=80"},
                {"2", "Smoked Bacon", "Applewood smoked pork bacon", "8", "10", "20", "300", "https://images.unsplash.com/photo-1608475249827-d2e01b3eeccf?w=400&q=80"},
                {"2", "Pork Sausages", "Traditional bratwurst style sausages", "6", "8", "25", "450", "https://images.unsplash.com/photo-1534177616072-ef74144e4a21?w=400&q=80"},

                {"3", "Salmon Fillet", "Wild caught Atlantic salmon", "18", "22", "18", "400", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80"},
                {"3", "Tuna Steak", "Fresh yellowfin tuna steak", "20", "25", "20", "300", "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&q=80"},
                {"3", "Cod Loins", "Flaky skinless cod fillets", "14", "14", "0", "400", "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80"},
                {"3", "Tiger Shrimps", "Peeled raw jumbo tiger prawns", "15", "18", "16", "500", "https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80"},
                {"3", "Rainbow Trout", "Whole cleaned fresh trout", "16", "20", "20", "600", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80"},
                {"3", "Lobster Tails", "Succulent coldwater lobster tails", "35", "45", "22", "300", "https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80"},
                {"3", "Pacific Oysters", "Fresh live oysters on shell", "24", "30", "20", "600", "https://images.unsplash.com/photo-1553618551-fba689030290?w=400&q=80"},

                {"4", "Whole Milk", "Pasteurized farm fresh milk", "3", "3", "0", "1000", "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80"},
                {"4", "Cheddar Block", "Aged sharp white cheddar", "6", "8", "25", "400", "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&q=80"},
                {"4", "Salted Butter", "Sweet cream rich dairy butter", "4", "5", "20", "250", "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80"},
                {"4", "Greek Yogurt", "Thick high protein greek yogurt", "4", "5", "20", "500", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80"},
                {"4", "Mozzarella Balls", "Fresh mozzarella in brine", "5", "7", "28", "250", "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80"},
                {"4", "Heavy Cream", "Rich whipping dairy cream", "3", "4", "25", "500", "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80"},
                {"4", "Cow Ghee", "Traditional clarified pure ghee", "12", "15", "20", "500", "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80"},

                {"5", "White Sourdough", "Freshly baked sourdough loaf", "4", "5", "20", "500", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80"},
                {"5", "Wheat Bread", "Soft whole grain wheat slices", "3", "3", "0", "450", "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80"},
                {"5", "Croissants", "Buttery flaky French pastries", "4", "5", "20", "180", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80"},
                {"5", "Choco Muffins", "Bakery double chocolate muffins", "4", "6", "33", "300", "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80"},
                {"5", "Plain Bagels", "Golden brown chewy bagels", "5", "5", "0", "400", "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&q=80"},
                {"5", "Fudgy Brownies", "Dense dark chocolate brownies", "6", "8", "25", "350", "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80"},
                {"5", "Pita Pockets", "Soft Mediterranean style pita", "3", "4", "25", "300", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80"},

                {"6", "Coca-Cola", "Chilled carbonated soft drink", "2", "2", "0", "500", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80"},
                {"6", "Pepsi Can", "Refreshing cola soft drink", "2", "2", "0", "500", "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80"},
                {"6", "Orange Juice", "Freshly squeezed pure juice", "4", "5", "20", "1000", "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80"},
                {"6", "Green Tea Box", "Organic green tea filter bags", "5", "6", "16", "100", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80"},
                {"6", "Black Coffee", "Arabica dark roast ground beans", "8", "10", "20", "250", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"},
                {"6", "Coconut Water", "Sweet pure tender coconut water", "3", "4", "25", "330", "https://images.unsplash.com/photo-1525385133772-2abd0197843d?w=400&q=80"},
                {"6", "Spring Water", "Natural mountain spring water", "1", "1", "0", "1000", "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&q=80"},

                {"7", "Milk Chocolate", "Smooth classic dairy milk bar", "3", "4", "25", "100", "https://images.unsplash.com/photo-1548907040-4d42b521d51a?w=400&q=80"},
                {"7", "Dark Chocolate", "72% dark Belgian cocoa bar", "4", "5", "20", "100", "https://images.unsplash.com/photo-1548907040-4d42b521d51a?w=400&q=80"},
                {"7", "Gummy Bears", "Sweet and chewy gummy candies", "3", "3", "0", "200", "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80"},
                {"7", "Caramels", "Creamy butterscotch caramels", "4", "5", "20", "150", "https://images.unsplash.com/photo-1582231375626-20d14f23b6b6?w=400&q=80"},
                {"7", "Jelly Beans", "Colorful assortment of jelly beans", "3", "3", "0", "200", "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80"},
                {"7", "Marshmallows", "Fluffy white vanilla marshmallows", "3", "4", "25", "250", "https://images.unsplash.com/photo-1582231375626-20d14f23b6b6?w=400&q=80"},
                {"7", "Fruit Lollipops", "Sweet cherry and apple lollipops", "2", "2", "0", "50", "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80"},

                // Remaining 49 items are generated procedurally below to cross 100 products total
            };

            List<Product> bulkProducts = new ArrayList<>();
            for (String[] seed : productSeeds) {
                int catIdx = Integer.parseInt(seed[0]);
                Category category = categories.get(catIdx);
                Brand brand = brands.get(random.nextInt(brands.size()));

                Product p = new Product();
                p.setName(seed[1]);
                p.setDescription(seed[2]);
                p.setPrice(Integer.parseInt(seed[3]));
                p.setOriginalPrice(Integer.parseInt(seed[4]));
                p.setDiscountPercentage(Integer.parseInt(seed[5]));
                p.setWeight(Integer.parseInt(seed[6]));
                p.setImage(seed[7]);
                p.setCategory(category);
                p.setBrand(brand);
                p.setQuantity(random.nextInt(90) + 10);
                p.setRating(3.5 + (1.5 * random.nextDouble()));
                p.setReviewsCount(random.nextInt(30) + 5);
                p.setStockStatus("IN_STOCK");
                
                // Set image gallery (3 urls) and dummy specifications
                p.setImageGallery(seed[7] + "," + seed[7] + "," + seed[7]);
                p.setSpecifications("Brand: " + brand.getName() + " | Packaging: Packet | Storage: Dry");
                
                bulkProducts.add(p);
            }

            // Procedurally generate another 49 products to reach 105 total products (across categories 8 to 14)
            String[] adjectives = {"Organic", "Premium", "Fresh", "Pure", "Traditional", "Super", "Specialty"};
            String[] foodNouns = {"Mix", "Delight", "Bites", "Crunch", "Snack", "Pack", "Extract"};
            
            for (int catIdx = 8; catIdx <= 14; catIdx++) {
                Category category = categories.get(catIdx);
                for (int pIdx = 1; pIdx <= 7; pIdx++) {
                    Brand brand = brands.get(random.nextInt(brands.size()));
                    String name = adjectives[random.nextInt(adjectives.length)] + " " + category.getName().substring(0, category.getName().length() - (category.getName().endsWith("s") ? 1 : 0)) + " " + foodNouns[random.nextInt(foodNouns.length)];
                    String image = "https://images.unsplash.com/photo-1588168333986-5078647a52ee?w=400&q=80";
                    
                    Product p = new Product();
                    p.setName(name);
                    p.setDescription("Delicious high quality " + name + " prepared carefully under premium conditions.");
                    p.setPrice(random.nextInt(15) + 3);
                    p.setOriginalPrice(p.getPrice() + random.nextInt(5));
                    p.setDiscountPercentage(p.getOriginalPrice() > p.getPrice() ? (int)(((double)(p.getOriginalPrice() - p.getPrice()) / p.getOriginalPrice()) * 100) : 0);
                    p.setWeight((random.nextInt(8) + 1) * 100);
                    p.setImage(image);
                    p.setCategory(category);
                    p.setBrand(brand);
                    p.setQuantity(random.nextInt(80) + 20);
                    p.setRating(4.0 + (1.0 * random.nextDouble()));
                    p.setReviewsCount(random.nextInt(20) + 3);
                    p.setStockStatus("IN_STOCK");
                    p.setImageGallery(image + "," + image + "," + image);
                    p.setSpecifications("Brand: " + brand.getName() + " | Weight: " + p.getWeight() + "g | Health: Organic");

                    bulkProducts.add(p);
                }
            }

            productRepository.saveAll(bulkProducts);
            products = productService.getProducts();
        }

        // 5. Seed 20 Coupons
        if (couponRepository.count() == 0) {
            List<String> couponCodes = Arrays.asList(
                "SAVE10", "FRESH20", "WELCOME5", "SUPERDEAL", "MEGACOUPON",
                "GROCERY15", "ORGANIC12", "FESTIVE25", "EASYBUY", "FRESHOFFER",
                "SNAPDEAL", "FLASHSALE", "DIWALI30", "NEWYEAR20", "DISCOUNT8",
                "CLEAN10", "DAIRY5", "DRINKS15", "SWEETS18", "SNACKS25"
            );
            List<Coupon> coupons = new ArrayList<>();
            for (int i = 0; i < couponCodes.size(); i++) {
                Coupon c = new Coupon();
                c.setCode(couponCodes.get(i));
                c.setDiscountPercentage(random.nextInt(25) + 5);
                c.setMaxDiscountAmount(random.nextInt(10) + 5);
                c.setMinOrderAmount(random.nextInt(20) + 10);
                c.setExpiryDate(LocalDate.now().plusMonths(2));
                c.setActive(true);
                coupons.add(c);
            }
            couponRepository.saveAll(coupons);
        }

        // 6. Seed 500 Orders with realistic order history (historical simulation)
        List<Order> orders = orderRepository.findAll();
        if (orders.isEmpty() && !users.isEmpty() && !products.isEmpty()) {
            List<Order> bulkOrders = new ArrayList<>();
            for (int i = 1; i <= 500; i++) {
                User user = users.get(random.nextInt(users.size()));
                
                // Create random items (1 to 3 items per order)
                int itemsCount = random.nextInt(3) + 1;
                int subtotal = 0;
                
                Order order = new Order();
                order.setUser(user);
                // Spread dates over the past 3 months
                order.setOrderDate(LocalDateTime.now().minusDays(random.nextInt(90)).minusHours(random.nextInt(24)));
                
                String[] statuses = {"DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "PENDING", "CANCELLED"};
                order.setStatus(statuses[random.nextInt(statuses.length)]);
                
                for (int j = 0; j < itemsCount; j++) {
                    Product product = products.get(random.nextInt(products.size()));
                    int qty = random.nextInt(3) + 1;
                    
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(product);
                    orderItem.setQuantity(qty);
                    orderItem.setPrice(product.getPrice());
                    order.getItems().add(orderItem);
                    
                    subtotal += product.getPrice() * qty;
                }
                
                int discount = 0;
                if (random.nextBoolean()) {
                    discount = (subtotal * (random.nextInt(15) + 5)) / 100;
                }
                
                int gst = (int) (subtotal * 0.18);
                int delivery = subtotal > 50 ? 0 : 5;
                int total = subtotal - discount + gst + delivery;
                
                order.setSubtotal(subtotal);
                order.setDiscount(discount);
                order.setGst(gst);
                order.setDeliveryCharges(delivery);
                order.setTotal(total);
                
                String[] payMethods = {"COD", "UPI", "CREDIT_CARD"};
                order.setPaymentMethod(payMethods[random.nextInt(payMethods.length)]);
                order.setPaymentStatus("COD".equals(order.getPaymentMethod()) && "PENDING".equals(order.getStatus()) ? "PENDING" : "COMPLETED");
                order.setShippingAddress(user.getAddress() != null ? user.getAddress() : "123 Main Street, Bangalore");
                
                bulkOrders.add(order);
            }
            orderRepository.saveAll(bulkOrders);
        }

        // 7. Seed 100 Reviews
        List<Review> reviews = reviewRepository.findAll();
        if (reviews.isEmpty() && !users.isEmpty() && !products.isEmpty()) {
            List<Review> bulkReviews = new ArrayList<>();
            String[] reviewComments = {
                "Absolutely love this product! Super fresh.",
                "Quality was decent, but delivery took some time.",
                "Perfect packaging, highly recommend this brand.",
                "Not as fresh as expected, but acceptable.",
                "Value for money, great discount offer!",
                "Amazing taste and fresh smell.",
                "Standard quality, nothing special.",
                "Highly satisfied, will buy again next week.",
                "My kids loved it, very sweet and healthy.",
                "Slightly expensive, but quality is outstanding."
            };

            for (int i = 0; i < 100; i++) {
                Product product = products.get(random.nextInt(products.size()));
                User user = users.get(random.nextInt(users.size()));

                Review r = new Review();
                r.setProduct(product);
                r.setUser(user);
                r.setRating(random.nextInt(2) + 4); // 4 or 5 stars
                r.setComment(reviewComments[random.nextInt(reviewComments.length)]);
                r.setCreatedDate(LocalDateTime.now().minusDays(random.nextInt(30)));
                bulkReviews.add(r);
            }
            reviewRepository.saveAll(bulkReviews);
        }
    }
}
