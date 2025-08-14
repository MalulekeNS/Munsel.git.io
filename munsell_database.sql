-- Drop database if it exists to ensure clean setup
DROP DATABASE IF EXISTS munsell_chart;
CREATE DATABASE munsell_chart;
USE munsell_chart;

-- Table for hues (e.g., 5R, 10R, 5YR)
CREATE TABLE hues (
    hue_id INT AUTO_INCREMENT PRIMARY KEY,
    hue_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., '5R', '10YR'
    hue_name VARCHAR(50) NOT NULL, -- e.g., 'Red', 'Yellow-Orange'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for colors within each hue
CREATE TABLE colors (
    color_id INT AUTO_INCREMENT PRIMARY KEY,
    hue_id INT NOT NULL,
    hex_code VARCHAR(7) NOT NULL, -- e.g., '#FFE6E6'
    value_level INT NOT NULL CHECK (value_level BETWEEN 0 AND 9), -- Munsell value (0-9)
    chroma_level INT NOT NULL CHECK (chroma_level BETWEEN 0 AND 16), -- Munsell chroma
    rgb_r INT NOT NULL CHECK (rgb_r BETWEEN 0 AND 255),
    rgb_g INT NOT NULL CHECK (rgb_g BETWEEN 0 AND 255),
    rgb_b INT NOT NULL CHECK (rgb_b BETWEEN 0 AND 255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hue_id) REFERENCES hues(hue_id) ON DELETE CASCADE,
    INDEX idx_hex_code (hex_code)
);

-- Table for users (for favorites and selections)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for user favorite colors
CREATE TABLE favorite_colors (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    color_id INT NOT NULL,
    notes TEXT, -- Optional user notes for the favorite
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colors(color_id) ON DELETE CASCADE,
    UNIQUE (user_id, color_id) -- Prevent duplicate favorites
);

-- Table for user color selections (for export purposes)
CREATE TABLE color_selections (
    selection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    color_id INT NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colors(color_id) ON DELETE CASCADE,
    UNIQUE (user_id, color_id) -- Prevent duplicate selections
);

-- Insert Munsell hue data
INSERT INTO hues (hue_code, hue_name) VALUES
('5R', 'Red'),
('10R', 'Red-Orange'),
('5YR', 'Orange'),
('10YR', 'Yellow-Orange'),
('5Y', 'Yellow'),
('10Y', 'Green-Yellow'),
('5GY', 'Yellow-Green'),
('10GY', 'Green'),
('5G', 'Blue-Green'),
('5B', 'Blue'),
('10B', 'Purple-Blue'),
('5P', 'Purple'),
('10P', 'Red-Purple');

-- Function to convert hex to RGB
DELIMITER //
CREATE FUNCTION hex_to_rgb(hex VARCHAR(7))
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE r INT;
    DECLARE g INT;
    DECLARE b INT;
    SET hex = REPLACE(hex, '#', '');
    SET r = CONV(SUBSTRING(hex, 1, 2), 16, 10);
    SET g = CONV(SUBSTRING(hex, 3, 2), 16, 10);
    SET b = CONV(SUBSTRING(hex, 5, 2), 16, 10);
    RETURN JSON_OBJECT('r', r, 'g', g, 'b', b);
END //
DELIMITER ;

-- Insert Munsell color data
INSERT INTO colors (hue_id, hex_code, value_level, chroma_level, rgb_r, rgb_g, rgb_b)
SELECT 
    h.hue_id,
    c.hex,
    c.value,
    c.chroma,
    JSON_EXTRACT(hex_to_rgb(c.hex), '$.r'),
    JSON_EXTRACT(hex_to_rgb(c.hex), '$.g'),
    JSON_EXTRACT(hex_to_rgb(c.hex), '$.b')
FROM (
    SELECT '5R' AS hue, '#FFE6E6' AS hex, 9 AS value, 2 AS chroma UNION
    SELECT '5R', '#FFCCCC', 8, 4 UNION
    SELECT '5R', '#FFB3B3', 7, 6 UNION
    SELECT '5R', '#FF9999', 6, 8 UNION
    SELECT '5R', '#FF8080', 5, 10 UNION
    SELECT '5R', '#FF6666', 4, 12 UNION
    SELECT '5R', '#FF4D4D', 3, 14 UNION
    SELECT '5R', '#FF3333', 2, 16 UNION
    SELECT '10R', '#FFE6E0', 9, 2 UNION
    SELECT '10R', '#FFCCC0', 8, 4 UNION
    SELECT '10R', '#FFB3A0', 7, 6 UNION
    SELECT '10R', '#FF9980', 6, 8 UNION
    SELECT '10R', '#FF8060', 5, 10 UNION
    SELECT '10R', '#FF6640', 4, 12 UNION
    SELECT '10R', '#FF4D20', 3, 14 UNION
    SELECT '10R', '#FF3300', 2, 16 UNION
    SELECT '5YR', '#FFE6D9', 9, 2 UNION
    SELECT '5YR', '#FFCCB3', 8, 4 UNION
    SELECT '5YR', '#FFB38D', 7, 6 UNION
    SELECT '5YR', '#FF9966', 6, 8 UNION
    SELECT '5YR', '#FF8040', 5, 10 UNION
    SELECT '5YR', '#FF661A', 4, 12 UNION
    SELECT '5YR', '#E54D00', 3, 14 UNION
    SELECT '5YR', '#CC4400', 2, 16 UNION
    SELECT '10YR', '#FFF2E6', 9, 2 UNION
    SELECT '10YR', '#FFE6CC', 8, 4 UNION
    SELECT '10YR', '#FFD9B3', 7, 6 UNION
    SELECT '10YR', '#FFCC99', 6, 8 UNION
    SELECT '10YR', '#FFBF80', 5, 10 UNION
    SELECT '10YR', '#FFB366', 4, 12 UNION
    SELECT '10YR', '#FFA64D', 3, 14 UNION
    SELECT '10YR', '#FF9933', 2, 16 UNION
    SELECT '5Y', '#FFFFF2', 9, 2 UNION
    SELECT '5Y', '#FFFFE6', 8, 4 UNION
    SELECT '5Y', '#FFFFD9', 7, 6 UNION
    SELECT '5Y', '#FFFFCC', 6, 8 UNION
    SELECT '5Y', '#FFFFBF', 5, 10 UNION
    SELECT '5Y', '#FFFFB3', 4, 12 UNION
    SELECT '5Y', '#FFFF80', 3, 14 UNION
    SELECT '5Y', '#FFFF4D', 2, 16 UNION
    SELECT '10Y', '#F2FFE6', 9, 2 UNION
    SELECT '10Y', '#E6FFCC', 8, 4 UNION
    SELECT '10Y', '#D9FFB3', 7, 6 UNION
    SELECT '10Y', '#CCFF99', 6, 8 UNION
    SELECT '10Y', '#BFFF80', 5, 10 UNION
    SELECT '10Y', '#B3FF66', 4, 12 UNION
    SELECT '10Y', '#A6FF4D', 3, 14 UNION
    SELECT '10Y', '#99FF33', 2, 16 UNION
    SELECT '5GY', '#E6FFE6', 9, 2 UNION
    SELECT '5GY', '#CCFFCC', 8, 4 UNION
    SELECT '5GY', '#B3FFB3', 7, 6 UNION
    SELECT '5GY', '#99FF99', 6, 8 UNION
    SELECT '5GY', '#80FF80', 5, 10 UNION
    SELECT '5GY', '#66FF66', 4, 12 UNION
    SELECT '5GY', '#4DFF4D', 3, 14 UNION
    SELECT '5GY', '#33FF33', 2, 16 UNION
    SELECT '10GY', '#E6FFEC', 9, 2 UNION
    SELECT '10GY', '#CCFFD9', 8, 4 UNION
    SELECT '10GY', '#B3FFC6', 7, 6 UNION
    SELECT '10GY', '#99FFB3', 6, 8 UNION
    SELECT '10GY', '#80FFA0', 5, 10 UNION
    SELECT '10GY', '#66FF8D', 4, 12 UNION
    SELECT '10GY', '#4DFF7A', 3, 14 UNION
    SELECT '10GY', '#33FF66', 2, 16 UNION
    SELECT '5G', '#E6FFF2', 9, 2 UNION
    SELECT '5G', '#CCFFE6', 8, 4 UNION
    SELECT '5G', '#B3FFD9', 7, 6 UNION
    SELECT '5G', '#99FFCC', 6, 8 UNION
    SELECT '5G', '#80FFBF', 5, 10 UNION
    SELECT '5G', '#66FFB3', 4, 12 UNION
    SELECT '5G', '#4DFFA6', 3, 14 UNION
    SELECT '5G', '#33FF99', 2, 16 UNION
    SELECT '5B', '#E6E6FF', 9, 2 UNION
    SELECT '5B', '#CCCCFF', 8, 4 UNION
    SELECT '5B', '#B3B3FF', 7, 6 UNION
    SELECT '5B', '#9999FF', 6, 8 UNION
    SELECT '5B', '#8080FF', 5, 10 UNION
    SELECT '5B', '#6666FF', 4, 12 UNION
    SELECT '5B', '#4D4DFF', 3, 14 UNION
    SELECT '5B', '#3333FF', 2, 16 UNION
    SELECT '10B', '#EDE6FF', 9, 2 UNION
    SELECT '10B', '#DBCCFF', 8, 4 UNION
    SELECT '10B', '#C9B3FF', 7, 6 UNION
    SELECT '10B', '#B799FF', 6, 8 UNION
    SELECT '10B', '#A580FF', 5, 10 UNION
    SELECT '10B', '#9366FF', 4, 12 UNION
    SELECT '10B', '#814DFF', 3, 14 UNION
    SELECT '10B', '#6F33FF', 2, 16 UNION
    SELECT '5P', '#F2E6FF', 9, 2 UNION
    SELECT '5P', '#E6CCFF', 8, 4 UNION
    SELECT '5P', '#D9B3FF', 7, 6 UNION
    SELECT '5P', '#CC99FF', 6, 8 UNION
    SELECT '5P', '#BF80FF', 5, 10 UNION
    SELECT '5P', '#B366FF', 4, 12 UNION
    SELECT '5P', '#A64DFF', 3, 14 UNION
    SELECT '5P', '#9933FF', 2, 16 UNION
    SELECT '10P', '#FFE6F2', 9, 2 UNION
    SELECT '10P', '#FFCCE6', 8, 4 UNION
    SELECT '10P', '#FFB3D9', 7, 6 UNION
    SELECT '10P', '#FF99CC', 6, 8 UNION
    SELECT '10P', '#FF80BF', 5, 10 UNION
    SELECT '10P', '#FF66B3', 4, 12 UNION
    SELECT '10P', '#FF4DA6', 3, 14 UNION
    SELECT '10P', '#FF3399', 2, 16
) c
JOIN hues h ON c.hue = h.hue_code;

-- View for simplified color queries
CREATE VIEW color_details AS
SELECT 
    c.color_id,
    h.hue_code,
    h.hue_name,
    c.hex_code,
    c.value_level,
    c.chroma_level,
    c.rgb_r,
    c.rgb_g,
    c.rgb_b
FROM colors c
JOIN hues h ON c.hue_id = h.hue_id;

-- Example queries for the frontend
-- Get all colors for a specific hue
-- SELECT * FROM color_details WHERE hue_code = '5R';

-- Get colors by value and chroma
-- SELECT * FROM color_details WHERE value_level = 6 AND chroma_level = 8;

-- Get user favorites
-- SELECT cd.* FROM favorite_colors fc
-- JOIN color_details cd ON fc.color_id = cd.color_id
-- WHERE fc.user_id = 1;

-- Add sample user for testing
INSERT INTO users (username, email) VALUES
('testuser', 'test@example.com');

-- Add sample favorites for testing
INSERT INTO favorite_colors (user_id, color_id, notes) 
SELECT 
    (SELECT user_id FROM users WHERE username = 'testuser'),
    color_id,
    'Sample favorite color'
FROM colors 
WHERE hex_code IN ('#FF6666', '#99FF99') LIMIT 2;