-- Initialize databases for all services
CREATE DATABASE user_service_db;
CREATE DATABASE template_service_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE user_service_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE template_service_db TO postgres;
