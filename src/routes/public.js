import express from "express";
import {
  getPublicProfile,
  getPublicProjects,
  getPublicFavoriteProjects,
  getPublicProjectDetail,
  getPublicCertifications,
  getPublicExperience,
  getPublicEducations,
  submitContact,
  getPublicBlogs,
  getPublicBlogBySlug,
} from "../controllers/publicController.js";

const router = express.Router();

// All these match the Django URL patterns exactly
router.get("/profile/", getPublicProfile);
router.get("/projects/", getPublicProjects);
router.get("/favorite-projects/", getPublicFavoriteProjects);
router.get("/projects/:id/detail/", getPublicProjectDetail);
router.get("/certifications/", getPublicCertifications);
router.get("/experience/", getPublicExperience);
router.get("/educations/", getPublicEducations);
router.post("/contact/", submitContact);
router.get("/blogs/", getPublicBlogs);
router.get("/blogs/:slug/", getPublicBlogBySlug);

export default router;
