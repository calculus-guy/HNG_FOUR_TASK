+-- Create databases for each service
CREATE DATABASE user_db;
CREATE DATABASE template_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE user_db TO user;
GRANT ALL PRIVILEGES ON DATABASE template_db TO user;
