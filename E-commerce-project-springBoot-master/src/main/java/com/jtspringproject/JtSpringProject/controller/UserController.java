package com.jtspringproject.JtSpringProject.controller;

import com.jtspringproject.JtSpringProject.models.*;
import com.jtspringproject.JtSpringProject.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.Collections;
import java.util.List;

@Controller
public class UserController {

	private final UserService userService;
	private final ProductService productService;
	private final CategoryService categoryService;
	private final CartService cartService;
	private final OrderService orderService;
	private final WishlistService wishlistService;

	@Autowired
	public UserController(UserService userService, ProductService productService, CategoryService categoryService,
                          CartService cartService, OrderService orderService, WishlistService wishlistService) {
		this.userService = userService;
		this.productService = productService;
		this.categoryService = categoryService;
		this.cartService = cartService;
		this.orderService = orderService;
		this.wishlistService = wishlistService;
	}

	@GetMapping("/register")
	public String registerUser() {
		return "register";
	}

	@GetMapping("/login")
	public ModelAndView userLogin(@RequestParam(required = false) String error) {
		ModelAndView mv = new ModelAndView("login");
		if ("true".equals(error)) {
			mv.addObject("msg", "Please enter correct email and password");
		}
		return mv;
	}

	@GetMapping("/")
	public ModelAndView indexPage() {
		ModelAndView mView = new ModelAndView("index");
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		mView.addObject("username", username);
		mView.addObject("products", this.productService.getProducts());
		mView.addObject("categories", this.categoryService.getCategories());
		return mView;
	}

	@GetMapping("/product/{id}")
	public ModelAndView productDetails(@PathVariable("id") int id) {
		ModelAndView mView = new ModelAndView("product-details");
		Product product = productService.getProduct(id);
		mView.addObject("product", product);

		// Fetch related products in the same category (limit to 4)
		if (product.getCategory() != null) {
			List<Product> relatedProducts = productService.getProductsByCategory(product.getCategory().getId());
			relatedProducts.removeIf(p -> p.getId() == product.getId());
			if (relatedProducts.size() > 4) {
				relatedProducts = relatedProducts.subList(0, 4);
			}
			mView.addObject("relatedProducts", relatedProducts);
		} else {
			mView.addObject("relatedProducts", Collections.emptyList());
		}

		return mView;
	}

	@GetMapping("/search")
	public ModelAndView searchPage(
			@RequestParam(value = "q", required = false) String query,
			@RequestParam(value = "category", required = false) String categoryName,
			@RequestParam(value = "categoryId", required = false) Integer categoryId,
			@RequestParam(value = "brandId", required = false) Integer brandId,
			@RequestParam(value = "sort", required = false) String sort,
			@RequestParam(value = "inStock", required = false) Boolean inStock) {
		ModelAndView mView = new ModelAndView("search");

		Integer targetCategoryId = categoryId;
		if (targetCategoryId == null && categoryName != null && !categoryName.trim().isEmpty()) {
			Category cat = categoryService.getCategoryByName(categoryName);
			if (cat != null) {
				targetCategoryId = cat.getId();
			}
		}

		List<Product> products = productService.getProductsFiltered(query, targetCategoryId, brandId, sort, inStock);

		mView.addObject("products", products);
		mView.addObject("categories", categoryService.getCategories());
		mView.addObject("brands", productService.getAllBrands());
		mView.addObject("query", query);
		mView.addObject("selectedCategoryId", targetCategoryId);
		mView.addObject("selectedBrandId", brandId);
		mView.addObject("selectedSort", sort);
		mView.addObject("selectedInStock", inStock);
		return mView;
	}

	@PostMapping("/newuserregister")
	public ModelAndView registerNewUser(@ModelAttribute User user) {
		boolean exists = this.userService.checkUserExists(user.getUsername());

		if (!exists) {
			user.setRole("ROLE_NORMAL");
			this.userService.addUser(user);
			return new ModelAndView("redirect:/login");
		} else {
			ModelAndView mView = new ModelAndView("register");
			mView.addObject("msg", user.getUsername() + " is taken. Please choose a different username.");
			return mView;
		}
	}

	@GetMapping("/cart")
	public ModelAndView viewCart() {
		ModelAndView mView = new ModelAndView("cart");
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(username);
		if (user == null) {
			return new ModelAndView("redirect:/login");
		}

		Cart cart = cartService.getOrCreateCart(user);
		List<CartProduct> cartItems = cartService.getCartItems(cart);

		int subtotal = cartItems.stream().mapToInt(item -> item.getProduct().getPrice() * item.getQuantity()).sum();
		int gst = (int) (subtotal * 0.18);
		int deliveryCharges = (subtotal > 50 || subtotal == 0) ? 0 : 5;
		int total = subtotal + gst + deliveryCharges;

		mView.addObject("cartItems", cartItems);
		mView.addObject("subtotal", subtotal);
		mView.addObject("gst", gst);
		mView.addObject("deliveryCharges", deliveryCharges);
		mView.addObject("total", total);
		return mView;
	}

	@GetMapping("/checkout")
	public ModelAndView viewCheckout() {
		ModelAndView mView = new ModelAndView("checkout");
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(username);
		if (user == null) {
			return new ModelAndView("redirect:/login");
		}

		Cart cart = cartService.getOrCreateCart(user);
		List<CartProduct> cartItems = cartService.getCartItems(cart);
		if (cartItems.isEmpty()) {
			return new ModelAndView("redirect:/cart");
		}

		int subtotal = cartItems.stream().mapToInt(item -> item.getProduct().getPrice() * item.getQuantity()).sum();
		int gst = (int) (subtotal * 0.18);
		int deliveryCharges = subtotal > 50 ? 0 : 5;
		int total = subtotal + gst + deliveryCharges;

		mView.addObject("user", user);
		mView.addObject("addresses", user.getAddresses());
		mView.addObject("cartItems", cartItems);
		mView.addObject("subtotal", subtotal);
		mView.addObject("gst", gst);
		mView.addObject("deliveryCharges", deliveryCharges);
		mView.addObject("total", total);
		return mView;
	}

	@PostMapping("/checkout/place-order")
	public String placeOrder(
			@RequestParam("shippingAddress") String shippingAddress,
			@RequestParam("paymentMethod") String paymentMethod,
			@RequestParam(value = "couponCode", required = false) String couponCode) {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(username);
		if (user == null) {
			return "redirect:/login";
		}

		Cart cart = cartService.getOrCreateCart(user);
		orderService.createOrder(user, cart, shippingAddress, paymentMethod, couponCode);

		return "redirect:/profile?tab=orders";
	}

	@GetMapping("/profile")
	public ModelAndView userProfile() {
		ModelAndView mView = new ModelAndView("profile");
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(username);
		if (user == null) {
			return new ModelAndView("redirect:/login");
		}

		List<Order> orders = orderService.getOrdersByUser(user);
		List<Wishlist> wishlist = wishlistService.getWishlistByUser(user);
		
		mView.addObject("user", user);
		mView.addObject("orders", orders);
		mView.addObject("wishlist", wishlist);
		mView.addObject("addresses", user.getAddresses());
		return mView;
	}

	@PostMapping("/profile/update")
	public String updateProfile(
			@RequestParam("username") String username,
			@RequestParam("email") String email,
			@RequestParam("address") String address,
			@RequestParam(value = "password", required = false) String password) {
		String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(currentUsername);
		if (user == null) {
			return "redirect:/login";
		}

		userService.updateUserProfile(user.getId(), username, email, password, address);
		return "redirect:/profile";
	}

	@PostMapping("/profile/address/add")
	public String addAddress(
			@RequestParam("street") String street,
			@RequestParam("city") String city,
			@RequestParam("state") String state,
			@RequestParam("zipCode") String zipCode,
			@RequestParam("country") String country) {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(username);
		if (user == null) {
			return "redirect:/login";
		}
		Address address = new Address();
		address.setStreet(street);
		address.setCity(city);
		address.setState(state);
		address.setZipCode(zipCode);
		address.setCountry(country);
		userService.addAddress(user.getId(), address);
		return "redirect:/profile?tab=addresses";
	}

	@PostMapping("/profile/address/delete/{id}")
	public String deleteAddress(@PathVariable("id") int addressId) {
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userService.getUserByUsername(username);
		if (user == null) {
			return "redirect:/login";
		}
		userService.deleteAddress(user.getId(), addressId);
		return "redirect:/profile?tab=addresses";
	}
}