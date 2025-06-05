const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const { uploadSingle, uploadMultiple, handleMulterError } = require('../middlewares/fileUpload');

// Upload single image endpoint
router.post('/single', 
  adminLimiter,
  protect, 
  authorize('admin'),
  uploadSingle('image'),
  handleMulterError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }      // Get the relative path for frontend usage
      // Simple approach: just return the filename with /uploads/ prefix
      const relativePath = `/uploads/${req.file.filename}`;
      
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: relativePath,
          url: relativePath // For frontend usage
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error.message
      });
    }
  }
);

// Upload multiple images endpoint
router.post('/multiple', 
  adminLimiter,
  protect, 
  authorize('admin'),
  uploadMultiple('images', 5),
  handleMulterError,
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }      const uploadedFiles = req.files.map(file => {
        // Simple approach: just return the filename with /uploads/ prefix
        const relativePath = `/uploads/${file.filename}`;
        return {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: relativePath,
          url: relativePath
        };
      });
      
      res.status(200).json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: uploadedFiles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error.message
      });
    }
  }
);

// Delete uploaded file endpoint
router.delete('/:filename', 
  adminLimiter,
  protect, 
  authorize('admin'),
  (req, res) => {
    try {
      const { filename } = req.params;
      const { folder } = req.query; // Optional folder parameter
      
      let filePath;
      if (folder) {
        filePath = path.join(__dirname, '../../../frontend/public', folder, filename);
      } else {
        // Search in common upload folders
        const searchPaths = [
          path.join(__dirname, '../../../frontend/public/uploads', filename),
          path.join(__dirname, '../../../frontend/public/blogs', filename),
          path.join(__dirname, '../../../frontend/public/products', filename),
          path.join(__dirname, '../../../frontend/public/slider', filename)
        ];
        
        filePath = searchPaths.find(searchPath => fs.existsSync(searchPath));
      }
      
      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      fs.unlinkSync(filePath);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting file',
        error: error.message
      });
    }
  }
);

// Get uploaded files list endpoint
router.get('/list', 
  adminLimiter,
  protect, 
  authorize('admin'),
  (req, res) => {
    try {
      const { folder } = req.query; // Optional folder parameter
      
      let searchPaths = [];
      if (folder) {
        searchPaths.push(path.join(__dirname, '../../../frontend/public', folder));
      } else {
        searchPaths = [
          path.join(__dirname, '../../../frontend/public/uploads'),
          path.join(__dirname, '../../../frontend/public/blogs'),
          path.join(__dirname, '../../../frontend/public/products'),
          path.join(__dirname, '../../../frontend/public/slider')
        ];
      }
      
      const allFiles = [];
      
      searchPaths.forEach(searchPath => {
        if (fs.existsSync(searchPath)) {
          const files = fs.readdirSync(searchPath);
          const folderName = path.basename(searchPath);
          
          files.forEach(file => {
            const filePath = path.join(searchPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
              const relativePath = `/${folderName}/${file}`;
              allFiles.push({
                filename: file,
                folder: folderName,
                size: stats.size,
                uploadDate: stats.mtime,
                url: relativePath
              });
            }
          });
        }
      });
      
      res.status(200).json({
        success: true,
        data: allFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching files',
        error: error.message
      });
    }
  }
);

module.exports = router;
