import express from "express";
import { upload } from "../lib/cloudinary.js";
import {
  // Profile
  getAdminProfile,
  updateAdminProfile,
  uploadProfileImage,
  uploadResume,
  uploadVisionImage,
  // Projects
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFavorite,
  toggleProjectPublish,
  // Experience
  getAdminExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  // Education
  getAdminEducations,
  createEducation,
  updateEducation,
  deleteEducation,
  // Certifications
  getAdminCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  // Achievements
  getAdminAchievements,
  createAchievement,
  deleteAchievement,
  // Messages
  getAdminMessages,
  markMessageRead,
  deleteMessage,
  // Blogs
  getAdminBlogs,
  getAdminBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  // Stats
  getDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// ─── Profile ────────────────────────────────────────────────────────
router.get("/profile", getAdminProfile);
router.put("/profile", updateAdminProfile);
router.post("/profile/image", upload.single("image"), uploadProfileImage);
router.post("/profile/resume", upload.single("resume"), uploadResume);
router.post("/profile/vision", upload.single("vision"), uploadVisionImage);

// ─── Projects ───────────────────────────────────────────────────────
const projectUpload = upload.fields([
  { name: "canvasImage", maxCount: 1 },
  { name: "svgFile", maxCount: 1 },
]);
router.get("/projects", getAdminProjects);
router.get("/projects/:id", getAdminProject);
router.post("/projects", projectUpload, createProject);
router.put("/projects/:id", projectUpload, updateProject);
router.delete("/projects/:id", deleteProject);
router.patch("/projects/:id/favorite", toggleProjectFavorite);
router.patch("/projects/:id/publish", toggleProjectPublish);

// ─── Experience ─────────────────────────────────────────────────────
router.get("/experiences", getAdminExperiences);
router.post("/experiences", createExperience);
router.put("/experiences/:id", updateExperience);
router.delete("/experiences/:id", deleteExperience);

// ─── Education ──────────────────────────────────────────────────────
router.get("/educations", getAdminEducations);
router.post("/educations", createEducation);
router.put("/educations/:id", updateEducation);
router.delete("/educations/:id", deleteEducation);

// ─── Certifications ─────────────────────────────────────────────────
router.get("/certifications", getAdminCertifications);
router.post("/certifications", upload.single("image"), createCertification);
router.put("/certifications/:id", upload.single("image"), updateCertification);
router.delete("/certifications/:id", deleteCertification);

// ─── Achievements / Gallery ─────────────────────────────────────────
router.get("/achievements", getAdminAchievements);
router.post("/achievements", upload.single("image"), createAchievement);
router.delete("/achievements/:id", deleteAchievement);

// ─── Contact Messages ───────────────────────────────────────────────
router.get("/messages", getAdminMessages);
router.patch("/messages/:id/read", markMessageRead);
router.delete("/messages/:id", deleteMessage);

// ─── Blogs ──────────────────────────────────────────────────────────
router.get("/blogs", getAdminBlogs);
router.get("/blogs/:id", getAdminBlog);
router.post("/blogs", upload.single("coverImage"), createBlog);
router.put("/blogs/:id", upload.single("coverImage"), updateBlog);
router.delete("/blogs/:id", deleteBlog);

// ─── Dashboard Stats ────────────────────────────────────────────────
router.get("/stats", getDashboardStats);

export default router;
