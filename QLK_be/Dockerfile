# --- Giai đoạn 1: Build file JAR ---
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml và tải dependencies trước (tận dụng Docker layer cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy mã nguồn và đóng gói thành file .jar
COPY src ./src
RUN mvn clean package -DskipTests

# --- Giai đoạn 2: Chạy ứng dụng (JRE nhẹ) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy file .jar từ giai đoạn build sang
COPY --from=build /app/target/*.jar app.jar

# Mở cổng mặc định của ứng dụng (ví dụ 8080)
EXPOSE 8080

# Lệnh khởi chạy
ENTRYPOINT ["java", "-jar", "app.jar"]