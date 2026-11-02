CREATE DATABASE IF NOT EXISTS `CloudKitchen`;
USE `CloudKitchen`;

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INTEGER NOT NULL auto_increment,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'manager', 'chef', 'delivery', 'customer') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(20),
  `dateOfBirth` DATE,
  `flatNo` VARCHAR(50),
  `street` VARCHAR(150),
  `societyName` VARCHAR(150),
  `city` VARCHAR(80),
  `state` VARCHAR(80),
  `latitude` DOUBLE,
  `longitude` DOUBLE,
  `isActive` TINYINT(1) NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Staffs` (
  `id` INTEGER NOT NULL auto_increment,
  `firstName` VARCHAR(80) NOT NULL,
  `lastName` VARCHAR(80),
  `email` VARCHAR(150) UNIQUE,
  `contactNumber` VARCHAR(20) NOT NULL,
  `role` ENUM('manager', 'chef', 'delivery', 'helper', 'cashier') NOT NULL,
  `salary` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `hiringDate` DATE,
  `isActive` TINYINT(1) NOT NULL DEFAULT true,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `userId` INTEGER,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `Ingredients` (
  `id` INTEGER NOT NULL auto_increment,
  `name` VARCHAR(120) NOT NULL UNIQUE,
  `category` VARCHAR(80),
  `isVeg` TINYINT(1) NOT NULL DEFAULT true,
  `availableQuantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `unit` ENUM('kg', 'g', 'l', 'ml', 'pcs') NOT NULL DEFAULT 'kg',
  `reorderLevel` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `InventoryItems` (
  `id` INTEGER NOT NULL auto_increment,
  `name` VARCHAR(120) NOT NULL UNIQUE,
  `availableQuantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'pcs',
  `reorderLevel` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Suppliers` (
  `id` INTEGER NOT NULL auto_increment,
  `name` VARCHAR(150) NOT NULL,
  `contactNumber` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150),
  `address` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `MenuItems` (
  `id` INTEGER NOT NULL auto_increment,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `category` VARCHAR(80) NOT NULL,
  `foodType` ENUM('Veg', 'Non-Veg') NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `description` TEXT,
  `imageUrl` VARCHAR(500),
  `isAvailable` TINYINT(1) NOT NULL DEFAULT true,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `MenuIngredients` (
  `menuItemId` INTEGER NOT NULL,
  `ingredientId` INTEGER NOT NULL,
  `quantityRequired` DECIMAL(12,3) NOT NULL DEFAULT 0,
  PRIMARY KEY (`menuItemId`, `ingredientId`),
  FOREIGN KEY (`menuItemId`) REFERENCES `MenuItems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ingredientId`) REFERENCES `Ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `Orders` (
  `id` INTEGER NOT NULL auto_increment,
  `totalCost` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `status` ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'placed',
  `flatNo` VARCHAR(50),
  `street` VARCHAR(150),
  `societyName` VARCHAR(150),
  `city` VARCHAR(80),
  `state` VARCHAR(80),
  `latitude` DOUBLE PRECISION,
  `longitude` DOUBLE PRECISION,
  `notes` TEXT,
  `inventoryDeducted` TINYINT(1) NOT NULL DEFAULT false,
  `orderTime` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `customerId` INTEGER NOT NULL,
  `deliveryPartnerId` INTEGER,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`customerId`) REFERENCES `Users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`deliveryPartnerId`) REFERENCES `Staffs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `OrderItems` (
  `id` INTEGER NOT NULL auto_increment,
  `name` VARCHAR(150) NOT NULL,
  `quantity` INTEGER NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `orderId` INTEGER NOT NULL,
  `menuItemId` INTEGER,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`menuItemId`) REFERENCES `MenuItems` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `OrderStatusHistories` (
  `id` INTEGER NOT NULL auto_increment,
  `status` VARCHAR(30) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `orderId` INTEGER NOT NULL,
  `changedById` INTEGER,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`changedById`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `Billings` (
  `id` INTEGER NOT NULL auto_increment,
  `totalAmount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `address` TEXT,
  `paymentStatus` ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `orderId` INTEGER NOT NULL UNIQUE,
  `customerId` INTEGER NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`customerId`) REFERENCES `Users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `Payments` (
  `id` INTEGER NOT NULL auto_increment,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `method` ENUM('cash', 'card', 'upi', 'wallet') NOT NULL,
  `status` ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `transactionId` VARCHAR(100),
  `paidAt` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `billId` INTEGER NOT NULL,
  `orderId` INTEGER NOT NULL,
  `customerId` INTEGER NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`billId`) REFERENCES `Billings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`orderId`) REFERENCES `Orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`customerId`) REFERENCES `Users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `Salaries` (
  `id` INTEGER NOT NULL auto_increment,
  `month` VARCHAR(7) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `paymentStatus` ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
  `paymentDate` DATE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `staffId` INTEGER NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`staffId`) REFERENCES `Staffs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE INDEX `salaries_staff_id_month` (`staffId`, `month`)
);

CREATE TABLE IF NOT EXISTS `Purchases` (
  `id` INTEGER NOT NULL auto_increment,
  `purchaseDate` DATE,
  `totalAmount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `paymentStatus` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  `status` ENUM('ordered', 'received', 'cancelled') NOT NULL DEFAULT 'ordered',
  `receivedAt` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `supplierId` INTEGER NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`supplierId`) REFERENCES `Suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `PurchaseItems` (
  `id` INTEGER NOT NULL auto_increment,
  `quantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
  `unitPrice` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `purchaseId` INTEGER NOT NULL,
  `ingredientId` INTEGER,
  `inventoryItemId` INTEGER,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`purchaseId`) REFERENCES `Purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ingredientId`) REFERENCES `Ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `supplier_ingredients` (
  `supplierId` INTEGER,
  `ingredientId` INTEGER,
  PRIMARY KEY (`supplierId`, `ingredientId`),
  FOREIGN KEY (`supplierId`) REFERENCES `Suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`ingredientId`) REFERENCES `Ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `supplier_inventory` (
  `supplierId` INTEGER,
  `inventoryItemId` INTEGER,
  PRIMARY KEY (`supplierId`, `inventoryItemId`),
  FOREIGN KEY (`supplierId`) REFERENCES `Suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`inventoryItemId`) REFERENCES `InventoryItems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);