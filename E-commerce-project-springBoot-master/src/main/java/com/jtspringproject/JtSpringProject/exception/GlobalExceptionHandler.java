package com.jtspringproject.JtSpringProject.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Object handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );

        if (request.getRequestURI().startsWith("/api/")) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Validation failed");
            response.put("details", errors);
            return ResponseEntity.badRequest().body(response);
        }

        ModelAndView mv = new ModelAndView("403");
        mv.addObject("msg", "Validation failed: " + errors);
        return mv;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public Object handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String property = violation.getPropertyPath().toString();
            // Simplify property path (e.g. placeOrder.shippingAddress -> shippingAddress)
            if (property.contains(".")) {
                property = property.substring(property.lastIndexOf('.') + 1);
            }
            errors.put(property, violation.getMessage());
        });

        if (request.getRequestURI().startsWith("/api/")) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", "Parameter validation failed");
            response.put("details", errors);
            return ResponseEntity.badRequest().body(response);
        }

        ModelAndView mv = new ModelAndView("403");
        mv.addObject("msg", "Parameter validation failed: " + errors);
        return mv;
    }

    @ExceptionHandler(IllegalStateException.class)
    public Object handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        if (request.getRequestURI().startsWith("/api/")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
        ModelAndView mv = new ModelAndView("403"); 
        mv.addObject("msg", ex.getMessage());
        return mv;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Object handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        if (request.getRequestURI().startsWith("/api/")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
        ModelAndView mv = new ModelAndView("403");
        mv.addObject("msg", ex.getMessage());
        return mv;
    }

    @ExceptionHandler(Exception.class)
    public Object handleGenericException(Exception ex, HttpServletRequest request) {
        if (request.getRequestURI().startsWith("/api/")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected system error occurred: " + ex.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
        ModelAndView mv = new ModelAndView("403");
        mv.addObject("msg", "An unexpected error occurred: " + ex.getMessage());
        return mv;
    }
}
