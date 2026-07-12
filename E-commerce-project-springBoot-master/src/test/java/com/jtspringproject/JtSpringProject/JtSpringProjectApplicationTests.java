package com.jtspringproject.JtSpringProject;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;

class JtSpringProjectApplicationTests {

	@Test
	void applicationMainMethodIsAvailable() {
		assertDoesNotThrow(() -> JtSpringProjectApplication.class.getDeclaredMethod("main", String[].class));
	}

}
