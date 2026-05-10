// Setup Super Admin (One-time use)
exports.setupSuperAdmin = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const User = require("../models/User");
      const bcrypt = require("bcryptjs");
      
      // Check if super admin already exists
      const existing = await User.findOne({ role: "superadmin" });
      if (existing) {
        return res.status(400).json({ message: "Super admin already exists. This setup page is disabled." });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create super admin
      const user = new User({
        name: name || "Super Administrator",
        email: email,
        password: hashedPassword,
        role: "superadmin",
        isActive: true,
      });
      
      await user.save();
      
      res.status(201).json({ 
        message: "Super admin created successfully!",
        user: { email: user.email, role: user.role }
      });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({ message: error.message });
    }
  };