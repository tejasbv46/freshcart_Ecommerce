package com.jtspringproject.JtSpringProject.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import com.jtspringproject.JtSpringProject.models.User;
import com.jtspringproject.JtSpringProject.services.UserService;

@Configuration
public class SecurityConfiguration {

	private final UserService userService;

	public SecurityConfiguration(UserService userService) {
		this.userService = userService;
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.authorizeHttpRequests(requests -> requests
				.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD, jakarta.servlet.DispatcherType.ERROR).permitAll()
				.requestMatchers("/", "/login", "/register", "/newuserregister", "/search", "/product/**", "/api/wishlist/check", "/api/auth/**").permitAll()
				.requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()
				.requestMatchers("/admin/**").hasRole("ADMIN")
				.anyRequest().authenticated()
			)
			.formLogin(login -> login
				.loginPage("/login")
				.loginProcessingUrl("/userloginvalidate")
				.successHandler((request, response, authentication) -> {
					boolean isAdmin = authentication.getAuthorities().stream()
							.anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
					if (isAdmin) {
						response.sendRedirect("/admin/Dashboard");
					} else {
						response.sendRedirect("/");
					}
				})
				.failureUrl("/login?error=true")
			)
			.logout(logout -> logout
				.logoutUrl("/logout")
				.logoutSuccessUrl("/login")
				.deleteCookies("JSESSIONID")
			)
			.exceptionHandling(handling -> handling
				.defaultAuthenticationEntryPointFor(
					new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
					new AntPathRequestMatcher("/api/**")
				)
			)
			.csrf(csrf -> csrf
				.ignoringRequestMatchers(new AntPathRequestMatcher("/api/**"))
			);

		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type", "X-Requested-With", "X-CSRF-Token"));
		configuration.setExposedHeaders(List.of("Set-Cookie"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	UserDetailsService userDetailsService() {
		return username -> {
			User user = userService.getUserByUsername(username);
			if (user == null) {
				throw new UsernameNotFoundException("User with username " + username + " not found.");
			}
			String role = "ROLE_ADMIN".equals(user.getRole()) ? "ADMIN" : "USER";

			return org.springframework.security.core.userdetails.User
					.withUsername(username)
					.password(user.getPassword())
					.roles(role)
					.build();
		};
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}
}
