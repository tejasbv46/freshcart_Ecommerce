# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download project dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and package the application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Create the runtime container with lightweight Temurin JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the packaged JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 for application access
EXPOSE 8080

# Configure execution entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
