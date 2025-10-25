FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy parent pom first
COPY pom.xml ./
COPY services/manufacturing-service/pom.xml services/manufacturing-service/

# Copy source code
COPY services/manufacturing-service/src services/manufacturing-service/src

# Build the application
RUN mvn -f services/manufacturing-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the jar from build stage
COPY --from=build /app/services/manufacturing-service/target/*.jar app.jar

EXPOSE 8098

ENTRYPOINT ["java", "-jar", "app.jar"]

