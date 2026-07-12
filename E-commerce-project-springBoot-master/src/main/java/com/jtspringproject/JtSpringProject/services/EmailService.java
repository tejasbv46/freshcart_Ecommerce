package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.Order;
import com.jtspringproject.JtSpringProject.models.User;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.text.SimpleDateFormat;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("username", user.getUsername());

            String htmlContent = templateEngine.process("mail/welcome", context);

            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to FreshCart! 🛒");
            helper.setText(htmlContent, true);
            helper.setFrom("noreply@freshcart.com");

            mailSender.send(message);
        } catch (Exception e) {
            // Log the exception gracefully
            System.err.println("Failed to send welcome email to " + user.getEmail() + ": " + e.getMessage());
        }
    }

    @Async
    public void sendOrderReceiptEmail(User user, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("username", user.getUsername());
            context.setVariable("orderId", order.getId());
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy HH:mm");
            context.setVariable("orderDate", dateFormat.format(order.getOrderDate()));
            context.setVariable("paymentMethod", order.getPaymentMethod());
            context.setVariable("shippingAddress", order.getShippingAddress());
            context.setVariable("items", order.getItems());
            context.setVariable("total", order.getTotal());

            String htmlContent = templateEngine.process("mail/order_receipt", context);

            helper.setTo(user.getEmail());
            helper.setSubject("FreshCart Order Receipt #FC-" + order.getId());
            helper.setText(htmlContent, true);
            helper.setFrom("orders@freshcart.com");

            mailSender.send(message);
        } catch (Exception e) {
            // Log the exception gracefully
            System.err.println("Failed to send order receipt email to " + user.getEmail() + ": " + e.getMessage());
        }
    }
}
