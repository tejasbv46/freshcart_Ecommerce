package com.jtspringproject.JtSpringProject.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

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
