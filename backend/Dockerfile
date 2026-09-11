# Fase 1: Compilazione con Maven e Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests -Dmaven.wagon.http.ssl.insecure=true

# Fase 2: Avvio del server
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar"]
