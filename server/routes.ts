import type { Express } from "express";
import express from "express";
import session from "express-session";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { hashPassword, comparePasswords, requireAuth } from "./auth";
import { insertProductSchema, insertCategorySchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration - use memory store to avoid conflicts
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const admin = await storage.getAdminByUsername(loginData.username);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
      }

      const isValidPassword = await comparePasswords(loginData.password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
      }

      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;

      res.json({
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Lỗi đăng nhập" });
      }
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Lỗi đăng xuất" });
      }
      res.json({ message: "Đăng xuất thành công" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const admin = await storage.getAdmin(req.session.adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin không tồn tại" });
      }
      res.json({
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
      });
    } catch (error) {
      console.error("Error fetching admin:", error);
      res.status(500).json({ message: "Lỗi lấy thông tin admin" });
    }
  });

  // Public routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId, search, limit = 20, offset = 0 } = req.query;
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/stats', async (req, res) => {
    try {
      const stats = await storage.getProductStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching product stats:", error);
      res.status(500).json({ message: "Failed to fetch product stats" });
    }
  });

  // Protected admin routes
  app.post('/api/products', requireAuth, upload.single('image'), async (req, res) => {
    try {
      // No need for manual transformation, schema handles it now
      

      
      const productData = insertProductSchema.parse(req.body);
      
      // Generate slug from product name
      const slug = productData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9\s]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim();
      
      const finalProductData = {
        ...productData,
        slug: slug,
      };
      
      if (req.file) {
        finalProductData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const product = await storage.createProduct(finalProductData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put('/api/products/:id', requireAuth, upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Schema handles string-to-type transformations
      const productData = insertProductSchema.partial().parse(req.body);
      
      // Generate slug if name is being updated
      if (productData.name) {
        const slug = productData.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/[^a-z0-9\s]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single
          .trim();
        
        productData.slug = slug;
      }
      
      if (req.file) {
        productData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete('/api/products/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post('/api/categories', requireAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  // Initialize default admin and categories
  app.post('/api/init-data', async (req, res) => {
    try {
      // Create default admin if none exists
      const existingAdmin = await storage.getAdminByUsername("admin");
      if (!existingAdmin) {
        const hashedPassword = await hashPassword("admin123");
        await storage.createAdmin({
          username: "admin",
          password: hashedPassword,
          fullName: "Quản trị viên",
          isActive: true,
        });
      }

      // Create default categories if none exist
      const existingCategories = await storage.getCategories();
      if (existingCategories.length === 0) {
        const defaultCategories = [
          { name: "Đồ uống", slug: "do-uong", icon: "fas fa-wine-bottle" },
          { name: "Bánh kẹo", slug: "banh-keo", icon: "fas fa-cookie-bite" },
          { name: "Rau củ", slug: "rau-cu", icon: "fas fa-carrot" },
          { name: "Sữa & trứng", slug: "sua-trung", icon: "fas fa-cheese" },
          { name: "Thịt cá", slug: "thit-ca", icon: "fas fa-drumstick-bite" },
          { name: "Gia dụng", slug: "gia-dung", icon: "fas fa-spray-can" },
        ];
        
        for (const category of defaultCategories) {
          await storage.createCategory(category);
        }
      }
      res.json({ message: "Data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
