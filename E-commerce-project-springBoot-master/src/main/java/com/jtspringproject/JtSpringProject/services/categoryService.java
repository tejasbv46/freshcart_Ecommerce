package com.jtspringproject.JtSpringProject.services;

import com.jtspringproject.JtSpringProject.models.Category;
import java.util.List;

public interface CategoryService {
    Category addCategory(String name);
    List<Category> getCategories();
    Category getCategory(int id);
    Category getCategoryByName(String name);
    Category updateCategory(int id, String name);
    boolean deleteCategory(int id);
}
