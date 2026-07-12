package com.jtspringproject.JtSpringProject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import com.jtspringproject.JtSpringProject.models.Category;
import com.jtspringproject.JtSpringProject.models.Product;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.models.Order;
import com.jtspringproject.JtSpringProject.models.Brand;
import com.jtspringproject.JtSpringProject.services.CategoryService;
import com.jtspringproject.JtSpringProject.services.ProductService;
import com.jtspringproject.JtSpringProject.services.UserService;
import com.jtspringproject.JtSpringProject.services.OrderService;

@Controller
@RequestMapping("/admin")
public class AdminController {

	private final UserService userService;
	private final CategoryService categoryService;
	private final ProductService productService;
	private final OrderService orderService;

	private static final String REDIRECT_ADMIN_PRODUCTS = "redirect:/admin/products";
	private static final String REDIRECT_ADMIN_CATEGORIES = "redirect:/admin/categories";
	private static final String VIEW_CATEGORIES = "categories";

	@Autowired
	public AdminController(UserService userService, CategoryService categoryService, ProductService productService, OrderService orderService) {
		this.userService = userService;
		this.categoryService = categoryService;
		this.productService = productService;
		this.orderService = orderService;
	}

	@GetMapping("/index")
	public String index(Model model) {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		model.addAttribute("username", username);
		return "index";
	}

	@GetMapping("login")
	public ModelAndView adminLogin(@RequestParam(required = false) String error) {
		ModelAndView mv = new ModelAndView("adminlogin");
		if ("true".equals(error)) {
			mv.addObject("msg", "Invalid username or password. Please try again.");
		}
		return mv;
	}

	@GetMapping(value = { "/", "Dashboard" })
	public ModelAndView adminHome() {
		ModelAndView mv = new ModelAndView("admin/dashboard");
		
		List<Order> orders = orderService.getAllOrders();
		int totalRevenue = orders.stream().mapToInt(Order::getTotal).sum();
		int totalOrdersCount = orders.size();
		int totalUsersCount = userService.getUsers().size();

		// Find low stock products (qty < 25) for alerts
		List<Product> lowStock = productService.getProducts().stream()
				.filter(p -> p.getQuantity() < 25)
				.limit(6)
				.toList();

		mv.addObject("totalRevenue", totalRevenue);
		mv.addObject("totalOrdersCount", totalOrdersCount);
		mv.addObject("totalUsersCount", totalUsersCount);
		mv.addObject("recentOrders", orders.size() > 5 ? orders.subList(0, 5) : orders);
		mv.addObject("lowStockProducts", lowStock);

		return mv;
	}

	@GetMapping("categories")
	public ModelAndView getCategories() {
		ModelAndView mView = new ModelAndView(VIEW_CATEGORIES);
		List<Category> categories = this.categoryService.getCategories();
		mView.addObject(VIEW_CATEGORIES, categories);
		return mView;
	}

	@PostMapping("/categories")
	public String addCategory(@RequestParam("categoryname") String categoryName) {
		this.categoryService.addCategory(categoryName);
		return "redirect:categories";
	}

	@PostMapping("categories/delete")
	public String deleteCategory(@RequestParam("id") int id) {
		try {
			this.categoryService.deleteCategory(id);
		} catch (IllegalStateException e) {
			// Catch foreign key violations and redirect with an error message (could be improved)
			return REDIRECT_ADMIN_CATEGORIES + "?error=" + e.getMessage();
		}
		return REDIRECT_ADMIN_CATEGORIES;
	}

	@PostMapping("categories/update")
	public String updateCategory(@RequestParam("categoryid") int id,
			@RequestParam("categoryname") String categoryname) {
		this.categoryService.updateCategory(id, categoryname);
		return REDIRECT_ADMIN_CATEGORIES;
	}

	@GetMapping("products")
	public ModelAndView getProducts() {
		ModelAndView mView = new ModelAndView("admin/products");
		List<Product> products = this.productService.getProducts();
		mView.addObject("products", products);
		return mView;
	}

	@GetMapping("products/add")
	public ModelAndView addProduct() {
		ModelAndView mView = new ModelAndView("productsAdd");
		List<Category> categories = this.categoryService.getCategories();
		List<Brand> brands = this.productService.getAllBrands();
		mView.addObject(VIEW_CATEGORIES, categories);
		mView.addObject("brands", brands);
		return mView;
	}

	@PostMapping("products/add")
	public String addProduct(@RequestParam("name") String name, 
			@RequestParam("categoryid") int categoryId,
			@RequestParam(value = "brandId", required = false) Integer brandId,
			@RequestParam("price") int price, @RequestParam("weight") int weight,
			@RequestParam("quantity") int quantity, @RequestParam("description") String description,
			@RequestParam("productImage") String productImage) {
		Product product = buildProduct(name, categoryId, brandId, price, weight, quantity, description, productImage);
		this.productService.addProduct(product);
		return REDIRECT_ADMIN_PRODUCTS;
	}

	@GetMapping("products/update/{id}")
	public ModelAndView getUpdateProductPage(@PathVariable("id") int id) {
		ModelAndView mView = new ModelAndView("productsUpdate");
		Product product = this.productService.getProduct(id);
		List<Category> categories = this.categoryService.getCategories();
		List<Brand> brands = this.productService.getAllBrands();

		mView.addObject(VIEW_CATEGORIES, categories);
		mView.addObject("brands", brands);
		mView.addObject("product", product);
		return mView;
	}

	@PostMapping("products/update/{id}")
	public String updateProduct(@PathVariable("id") int id, @RequestParam("name") String name,
			@RequestParam("categoryid") int categoryId, 
			@RequestParam(value = "brandId", required = false) Integer brandId,
			@RequestParam("price") int price,
			@RequestParam("weight") int weight, @RequestParam("quantity") int quantity,
			@RequestParam("description") String description, @RequestParam("productImage") String productImage) {
		Product product = buildProduct(name, categoryId, brandId, price, weight, quantity, description, productImage);
		this.productService.updateProduct(id, product);
		return REDIRECT_ADMIN_PRODUCTS;
	}

	@PostMapping("products/delete")
	public String removeProduct(@RequestParam("id") int id) {
		this.productService.deleteProduct(id);
		return REDIRECT_ADMIN_PRODUCTS;
	}

	@PostMapping("products")
	public String redirectProductsPost() {
		return REDIRECT_ADMIN_CATEGORIES;
	}

	@GetMapping("customers")
	public ModelAndView getCustomerDetail() {
		ModelAndView mView = new ModelAndView("displayCustomers");
		List<User> users = this.userService.getUsers();
		mView.addObject("customers", users);
		return mView;
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
