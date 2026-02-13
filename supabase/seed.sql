-- Seed data for TwoYes app
-- Sample names for testing

INSERT INTO public.names (name, name_normalized, gender, origins, meaning, etymology, popularity_rank_us, popularity_rank_uk, popularity_trend, rarity_score, metadata) VALUES
-- Popular Girl Names
('Emma', 'emma', 'female', '{english, german}', 'Universal, whole', 'Germanic name meaning "whole" or "universal"', 1, 5, 'stable', 0.05, '{"syllables": 2, "style_tags": ["classic", "elegant"], "famous_people": ["Emma Watson", "Emma Stone"]}'),
('Olivia', 'olivia', 'female', '{english, latin}', 'Olive tree', 'Latin name derived from "olive tree", symbol of peace', 2, 1, 'rising', 0.06, '{"syllables": 4, "style_tags": ["classic", "elegant"], "famous_people": ["Olivia Newton-John"]}'),
('Ava', 'ava', 'female', '{english, latin}', 'Life, bird', 'Possibly from Latin "avis" meaning bird', 3, 8, 'stable', 0.08, '{"syllables": 2, "style_tags": ["modern", "short"], "famous_people": ["Ava Gardner"]}'),
('Sophia', 'sophia', 'female', '{greek}', 'Wisdom', 'Greek name meaning "wisdom"', 4, 12, 'falling', 0.10, '{"syllables": 3, "style_tags": ["classic", "sophisticated"], "famous_people": ["Sophia Loren"]}'),
('Isabella', 'isabella', 'female', '{italian, spanish}', 'Devoted to God', 'Italian and Spanish form of Elizabeth', 5, 4, 'stable', 0.09, '{"syllables": 4, "style_tags": ["elegant", "romantic"], "famous_people": ["Isabella Rossellini"]}'),
('Charlotte', 'charlotte', 'female', '{french, english}', 'Free man', 'French feminine form of Charles', 6, 2, 'rising', 0.07, '{"syllables": 2, "style_tags": ["classic", "royal"], "famous_people": ["Princess Charlotte"]}'),
('Amelia', 'amelia', 'female', '{english, german}', 'Work', 'Germanic name meaning "work" or "industrious"', 7, 3, 'rising', 0.08, '{"syllables": 3, "style_tags": ["vintage", "elegant"], "famous_people": ["Amelia Earhart"]}'),
('Luna', 'luna', 'female', '{latin, spanish}', 'Moon', 'Latin name meaning "moon"', 11, 18, 'rising', 0.15, '{"syllables": 2, "style_tags": ["celestial", "modern"], "famous_people": ["Luna Lovegood"]}'),
('Mia', 'mia', 'female', '{italian, scandinavian}', 'Mine, wished-for child', 'Diminutive of Maria', 8, 6, 'stable', 0.09, '{"syllables": 2, "style_tags": ["short", "modern"], "famous_people": ["Mia Farrow"]}'),
('Harper', 'harper', 'female', '{english}', 'Harp player', 'English occupational surname', 9, 35, 'rising', 0.12, '{"syllables": 2, "style_tags": ["modern", "strong"], "famous_people": ["Harper Lee"]}'),

-- Popular Boy Names
('Liam', 'liam', 'male', '{irish}', 'Strong-willed warrior', 'Irish shortened form of William', 1, 4, 'stable', 0.05, '{"syllables": 2, "style_tags": ["strong", "modern"], "famous_people": ["Liam Neeson", "Liam Hemsworth"]}'),
('Noah', 'noah', 'male', '{hebrew}', 'Rest, comfort', 'Biblical name meaning "rest" or "comfort"', 2, 7, 'stable', 0.06, '{"syllables": 2, "style_tags": ["biblical", "gentle"], "famous_people": ["Noah Wyle"]}'),
('Oliver', 'oliver', 'male', '{english, french}', 'Olive tree', 'English form of Olivier, meaning "olive tree"', 3, 1, 'rising', 0.07, '{"syllables": 3, "style_tags": ["classic", "friendly"], "famous_people": ["Oliver Twist"]}'),
('James', 'james', 'male', '{english, hebrew}', 'Supplanter', 'English form of Jacob', 4, 5, 'stable', 0.04, '{"syllables": 1, "style_tags": ["timeless", "strong"], "famous_people": ["James Bond"]}'),
('Elijah', 'elijah', 'male', '{hebrew}', 'My God is Yahweh', 'Biblical prophet name', 5, 15, 'rising', 0.08, '{"syllables": 3, "style_tags": ["biblical", "strong"], "famous_people": ["Elijah Wood"]}'),
('William', 'william', 'male', '{english, german}', 'Resolute protection', 'Germanic name meaning "will helmet"', 6, 3, 'stable', 0.05, '{"syllables": 2, "style_tags": ["royal", "classic"], "famous_people": ["Prince William"]}'),
('Henry', 'henry', 'male', '{english, german}', 'Home ruler', 'Germanic name meaning "home ruler"', 7, 2, 'rising', 0.06, '{"syllables": 2, "style_tags": ["royal", "vintage"], "famous_people": ["Prince Harry"]}'),
('Lucas', 'lucas', 'male', '{latin, greek}', 'Light', 'Greek name meaning "from Lucania" or "light"', 8, 12, 'stable', 0.09, '{"syllables": 2, "style_tags": ["international", "friendly"], "famous_people": ["George Lucas"]}'),
('Alexander', 'alexander', 'male', '{greek}', 'Defender of men', 'Greek name meaning "defender of mankind"', 10, 8, 'stable', 0.07, '{"syllables": 4, "style_tags": ["strong", "historical"], "famous_people": ["Alexander the Great"]}'),
('Theodore', 'theodore', 'male', '{greek}', 'Gift of God', 'Greek name meaning "gift of God"', 11, 20, 'rising', 0.10, '{"syllables": 3, "style_tags": ["vintage", "sophisticated"], "famous_people": ["Theodore Roosevelt"]}'),

-- Unisex Names
('Avery', 'avery', 'unisex', '{english}', 'Ruler of elves', 'English surname from Alfred', 15, 25, 'rising', 0.14, '{"syllables": 3, "style_tags": ["modern", "unisex"], "famous_people": []}'),
('Riley', 'riley', 'unisex', '{irish}', 'Courageous', 'Irish surname meaning "courageous"', 18, 30, 'stable', 0.16, '{"syllables": 2, "style_tags": ["modern", "friendly"], "famous_people": []}'),
('Jordan', 'jordan', 'unisex', '{hebrew}', 'To flow down', 'From the River Jordan', 85, 65, 'stable', 0.25, '{"syllables": 2, "style_tags": ["sporty", "strong"], "famous_people": ["Michael Jordan"]}'),
('Taylor', 'taylor', 'unisex', '{english}', 'Tailor', 'English occupational surname', 120, 90, 'stable', 0.30, '{"syllables": 2, "style_tags": ["modern", "professional"], "famous_people": ["Taylor Swift"]}'),
('Morgan', 'morgan', 'unisex', '{welsh}', 'Sea circle', 'Welsh name meaning "sea circle"', 150, 110, 'stable', 0.35, '{"syllables": 2, "style_tags": ["celtic", "strong"], "famous_people": ["Morgan Freeman"]}'),

-- Unique/Rising Names
('Aria', 'aria', 'female', '{italian, hebrew}', 'Air, lioness', 'Musical term or Hebrew for "lioness"', 22, 45, 'rising', 0.18, '{"syllables": 3, "style_tags": ["musical", "elegant"], "famous_people": []}'),
('Asher', 'asher', 'male', '{hebrew}', 'Happy, blessed', 'Biblical name meaning "happy" or "blessed"', 25, 55, 'rising', 0.20, '{"syllables": 2, "style_tags": ["biblical", "happy"], "famous_people": []}'),
('Hazel', 'hazel', 'female', '{english}', 'Hazel tree', 'English nature name', 30, 40, 'rising', 0.22, '{"syllables": 2, "style_tags": ["vintage", "nature"], "famous_people": []}'),
('Silas', 'silas', 'male', '{latin, greek}', 'Forest, wood', 'Biblical name meaning "of the forest"', 32, 70, 'rising', 0.24, '{"syllables": 2, "style_tags": ["biblical", "vintage"], "famous_people": []}'),
('Isla', 'isla', 'female', '{scottish}', 'Island', 'Scottish name meaning "island"', 35, 10, 'rising', 0.20, '{"syllables": 2, "style_tags": ["nature", "scottish"], "famous_people": ["Isla Fisher"]}');

-- Add some historical popularity data for Emma
INSERT INTO public.name_popularity (name_id, year, country, rank, count)
SELECT id, y, 'USA',
  CASE
    WHEN y < 2000 THEN 150 + (RANDOM() * 50)::int
    WHEN y < 2010 THEN 80 + (RANDOM() * 30)::int
    WHEN y < 2020 THEN 20 + (RANDOM() * 15)::int
    ELSE 1 + (RANDOM() * 3)::int
  END,
  CASE
    WHEN y < 2000 THEN 5000 + (RANDOM() * 2000)::int
    WHEN y < 2010 THEN 10000 + (RANDOM() * 5000)::int
    WHEN y < 2020 THEN 18000 + (RANDOM() * 3000)::int
    ELSE 20000 + (RANDOM() * 2000)::int
  END
FROM public.names, generate_series(1990, 2024) y
WHERE name = 'Emma';
