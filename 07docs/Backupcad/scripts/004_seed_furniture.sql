-- Seed AFC India furniture catalog (50+ items)
-- Workstations (12 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('Linear Workstation', 'workstation', 'linear', 'AFC India', 120, 60, 75, 'Single linear workstation with cable management', '["white", "oak", "walnut"]'),
('L-Shape Workstation', 'workstation', 'l-shape', 'AFC India', 160, 140, 75, 'L-shaped corner workstation for maximum workspace', '["white", "oak", "walnut"]'),
('Cluster Workstation 2-Seater', 'workstation', 'cluster', 'AFC India', 240, 120, 75, 'Face-to-face 2-person workstation cluster', '["white", "oak", "walnut"]'),
('Cluster Workstation 4-Seater', 'workstation', 'cluster', 'AFC India', 240, 240, 75, 'Square 4-person workstation cluster with center partition', '["white", "oak", "walnut"]'),
('Cluster Workstation 6-Seater', 'workstation', 'cluster', 'AFC India', 360, 240, 75, 'Large 6-person workstation cluster', '["white", "oak", "walnut"]'),
('Executive Workstation', 'workstation', 'executive', 'AFC India', 180, 90, 75, 'Premium executive workstation with storage', '["walnut", "mahogany"]'),
('Standing Desk Workstation', 'workstation', 'standing', 'AFC India', 150, 75, 120, 'Height-adjustable standing workstation', '["white", "black"]'),
('Cubicle Workstation', 'workstation', 'cubicle', 'AFC India', 150, 150, 120, 'Private cubicle workstation with high partitions', '["gray", "blue"]'),
('Reception Workstation', 'workstation', 'reception', 'AFC India', 200, 80, 110, 'Front desk reception workstation', '["white", "walnut"]'),
('Training Workstation', 'workstation', 'training', 'AFC India', 120, 50, 75, 'Compact training room workstation', '["white", "oak"]'),
('Hot Desk Station', 'workstation', 'hotdesk', 'AFC India', 100, 60, 75, 'Compact hot-desking station', '["white", "oak"]'),
('Bench Workstation', 'workstation', 'bench', 'AFC India', 180, 70, 75, 'Collaborative bench-style workstation', '["white", "oak"]');

-- Desks (8 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('Executive Desk', 'desk', 'executive', 'AFC India', 180, 90, 75, 'Large executive desk with drawer pedestals', '["walnut", "mahogany", "oak"]'),
('Manager Desk', 'desk', 'manager', 'AFC India', 160, 80, 75, 'Mid-size manager desk with side return', '["walnut", "oak", "white"]'),
('Computer Desk', 'desk', 'computer', 'AFC India', 120, 60, 75, 'Standard computer desk with keyboard tray', '["white", "oak", "walnut"]'),
('Writing Desk', 'desk', 'writing', 'AFC India', 100, 50, 75, 'Minimalist writing desk', '["white", "oak"]'),
('Standing Desk', 'desk', 'standing', 'AFC India', 150, 75, 120, 'Electric height-adjustable desk', '["white", "black", "oak"]'),
('Corner Desk', 'desk', 'corner', 'AFC India', 140, 140, 75, 'L-shaped corner desk', '["white", "oak", "walnut"]'),
('Compact Desk', 'desk', 'compact', 'AFC India', 80, 50, 75, 'Space-saving compact desk', '["white", "oak"]'),
('Conference Table Desk', 'desk', 'conference', 'AFC India', 300, 120, 75, 'Large conference-style desk', '["walnut", "oak"]');

-- Chairs (10 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('Executive Chair', 'chair', 'executive', 'AFC India', 70, 70, 120, 'High-back leather executive chair', '["black", "brown", "burgundy"]'),
('Ergonomic Task Chair', 'chair', 'ergonomic', 'AFC India', 65, 65, 100, 'Adjustable ergonomic task chair with lumbar support', '["black", "gray", "blue"]'),
('Mesh Back Chair', 'chair', 'mesh', 'AFC India', 60, 60, 95, 'Breathable mesh back office chair', '["black", "gray"]'),
('Visitor Chair', 'chair', 'visitor', 'AFC India', 55, 55, 85, 'Guest visitor chair without arms', '["black", "gray", "blue"]'),
('Conference Chair', 'chair', 'conference', 'AFC India', 60, 60, 90, 'Mid-back conference room chair', '["black", "gray", "white"]'),
('Office Stool', 'chair', 'stool', 'AFC India', 40, 40, 65, 'Height-adjustable drafting stool', '["black", "gray"]'),
('Lounge Chair', 'chair', 'lounge', 'AFC India', 80, 80, 75, 'Comfortable lounge chair for break areas', '["gray", "blue", "green"]'),
('Training Chair', 'chair', 'training', 'AFC India', 50, 50, 80, 'Stackable training room chair with tablet arm', '["black", "blue"]'),
('Cafeteria Chair', 'chair', 'cafeteria', 'AFC India', 45, 45, 80, 'Durable cafeteria chair', '["blue", "red", "green", "orange"]'),
('Executive High Back', 'chair', 'executive', 'AFC India', 70, 70, 130, 'Premium high-back executive chair', '["black", "brown"]');

-- Tables (8 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('Conference Table 8-Seater', 'table', 'conference', 'AFC India', 300, 120, 75, 'Rectangular conference table for 8', '["walnut", "oak", "white"]'),
('Conference Table 12-Seater', 'table', 'conference', 'AFC India', 400, 140, 75, 'Large conference table for 12', '["walnut", "oak"]'),
('Round Meeting Table', 'table', 'meeting', 'AFC India', 120, 120, 75, 'Round meeting table for 4-5 people', '["white", "oak", "walnut"]'),
('Cafeteria Table 4-Seater', 'table', 'cafeteria', 'AFC India', 120, 80, 75, 'Rectangular cafeteria table', '["white", "oak"]'),
('Coffee Table', 'table', 'coffee', 'AFC India', 100, 60, 45, 'Low coffee table for lounge areas', '["walnut", "oak", "white"]'),
('Side Table', 'table', 'side', 'AFC India', 50, 50, 55, 'Small side table', '["white", "oak", "walnut"]'),
('Training Table', 'table', 'training', 'AFC India', 150, 60, 75, 'Foldable training room table', '["white", "oak"]'),
('Collaboration Table', 'table', 'collaboration', 'AFC India', 200, 100, 75, 'Large collaboration table with power outlets', '["white", "oak"]');

-- Storage (8 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('Filing Cabinet 2-Drawer', 'storage', 'filing', 'AFC India', 40, 50, 70, 'Lockable 2-drawer filing cabinet', '["gray", "white", "black"]'),
('Filing Cabinet 4-Drawer', 'storage', 'filing', 'AFC India', 40, 50, 130, 'Lockable 4-drawer filing cabinet', '["gray", "white", "black"]'),
('Mobile Pedestal', 'storage', 'pedestal', 'AFC India', 40, 50, 60, '3-drawer mobile pedestal with casters', '["white", "gray", "oak"]'),
('Bookshelf', 'storage', 'bookshelf', 'AFC India', 80, 35, 180, 'Open bookshelf with 5 shelves', '["oak", "walnut", "white"]'),
('Storage Cupboard', 'storage', 'cupboard', 'AFC India', 90, 45, 180, 'Tall storage cupboard with doors', '["gray", "white", "oak"]'),
('Locker Unit', 'storage', 'locker', 'AFC India', 30, 45, 180, 'Single locker unit', '["gray", "blue"]'),
('Credenza', 'storage', 'credenza', 'AFC India', 150, 45, 75, 'Low storage credenza', '["walnut", "oak", "white"]'),
('Open Shelf Unit', 'storage', 'shelf', 'AFC India', 100, 40, 150, 'Open shelving unit with 4 shelves', '["white", "oak"]');

-- Soft Seating (6 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('2-Seater Sofa', 'seating', 'sofa', 'AFC India', 150, 80, 85, 'Comfortable 2-seater office sofa', '["gray", "blue", "green", "black"]'),
('3-Seater Sofa', 'seating', 'sofa', 'AFC India', 200, 80, 85, 'Spacious 3-seater office sofa', '["gray", "blue", "green", "black"]'),
('Single Sofa', 'seating', 'sofa', 'AFC India', 90, 80, 85, 'Single seater armchair', '["gray", "blue", "green"]'),
('Ottoman', 'seating', 'ottoman', 'AFC India', 60, 60, 45, 'Upholstered ottoman/footrest', '["gray", "blue", "green"]'),
('Bean Bag', 'seating', 'beanbag', 'AFC India', 90, 90, 100, 'Large bean bag for casual seating', '["red", "blue", "green", "yellow"]'),
('Bench Seating', 'seating', 'bench', 'AFC India', 180, 50, 45, 'Upholstered bench seating', '["gray", "blue"]');

-- Accessories (6 items)
INSERT INTO public.furniture_items (name, category, subcategory, brand, width_cm, depth_cm, height_cm, description, color_options) VALUES
('Partition Screen', 'accessory', 'partition', 'AFC India', 120, 5, 150, 'Fabric-covered office partition screen', '["gray", "blue", "green"]'),
('Whiteboard', 'accessory', 'whiteboard', 'AFC India', 180, 5, 120, 'Magnetic whiteboard on wheels', '["white"]'),
('Plant Stand', 'accessory', 'plant', 'AFC India', 40, 40, 80, 'Decorative plant stand', '["black", "white"]'),
('Coat Rack', 'accessory', 'coatrack', 'AFC India', 50, 50, 180, 'Free-standing coat rack', '["black", "chrome"]'),
('Waste Bin', 'accessory', 'wastebin', 'AFC India', 30, 30, 40, 'Office waste bin', '["black", "gray"]'),
('Monitor Arm', 'accessory', 'monitor', 'AFC India', 10, 50, 50, 'Adjustable single monitor arm', '["black", "silver"]');
