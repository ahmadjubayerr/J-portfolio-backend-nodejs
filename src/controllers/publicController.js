import { prisma } from "../lib/prisma.js";
import { sendContactNotificationEmail } from "../lib/email.js";

// ─── GET /api/profile/ ──────────────────────────────────────────────
// Returns profile data in the EXACT same shape as Django
export const getPublicProfile = async (req, res, next) => {
  try {
    let profile = await dbQueryWithRetry(() =>
      prisma.profile.findUnique({
        where: { id: "hero" },
        include: { achievements: true },
      })
    );

    if (!profile) {
      return res.status(404).json({ detail: "Profile not found" });
    }

    // Return in Django's response format
    const data = {
      name: profile.name,
      resume: profile.resumeUrl,
      about_me: profile.aboutMe,
      why_hire_me: profile.whyHireMe,
      expertise: profile.expertise ? profile.expertise.split(",").map((s) => s.trim()).filter(Boolean) : [],
      skills: profile.skills ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      counts: {
        website: profile.websiteDesignCount,
        mobile: profile.mobileAppDesignCount,
        live: profile.liveProjectCount,
      },
      profile_image: profile.profileImage,
      vision: profile.visionImage,
      achievements: (() => {
        const arr = Array(7).fill(null);
        profile.achievements.forEach((ach) => {
          if (ach.slot >= 0 && ach.slot < 7) {
            arr[ach.slot] = ach.image;
          }
        });
        return arr;
      })(),
      // Also include Node.js-style fields so dashboard/frontend can use either
      aboutMe: profile.aboutMe,
      whyHireMe: profile.whyHireMe,
      profileImage: profile.profileImage,
      resumeUrl: profile.resumeUrl,
      visionImage: profile.visionImage,
      websiteCount: profile.websiteDesignCount,
      mobileCount: profile.mobileAppDesignCount,
      projectCount: profile.liveProjectCount,
      headline: profile.headline,
      whyChooseMeFeatures: profile.whyChooseMeFeatures,
      whyChooseMeHeading: profile.whyChooseMeHeading,
      why_choose_me_heading: profile.whyChooseMeHeading,
      projectHeroText: profile.projectHeroText,
      project_hero_text: profile.projectHeroText,
      projectCategories: profile.projectCategories,
      project_categories: profile.projectCategories,
    };

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/projects/ ─────────────────────────────────────────────
// List all published projects. Optional ?category= filter
// Helper: retry DB queries to handle Neon DB cold-starts / pooler reconnects
async function dbQueryWithRetry(fn, retries = 3, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[DB Retry] Attempt ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// ─── GET /api/projects/ ─────────────────────────────────────────────
export const getPublicProjects = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { isPublished: true };
    if (category) {
      where.category = category;
    }

    const projects = await dbQueryWithRetry(() =>
      prisma.project.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    );

    const data = projects.map(formatProjectForPublic);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/favorite-projects/ ────────────────────────────────────
export const getPublicFavoriteProjects = async (req, res, next) => {
  try {
    const projects = await dbQueryWithRetry(() =>
      prisma.project.findMany({
        where: { isFavorite: true, isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    );

    const data = projects.map(formatProjectForPublic);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/projects/:id/detail/ ──────────────────────────────────
export const getPublicProjectDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      // Try numeric ID for backward compatibility with Django integer IDs
      return res.status(400).json({ err: "not found" });
    }

    res.json(formatProjectForPublic(project));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/certifications/ ───────────────────────────────────────
export const getPublicCertifications = async (req, res, next) => {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = certifications.map((c) => ({
      title: c.title,
      institute: c.institute,
      description: c.description,
      image: c.image,
      pdf_file: c.pdfFile,
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/experience/ ───────────────────────────────────────────
export const getPublicExperience = async (req, res, next) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = experiences.map((e) => ({
      id: e.id,
      position: e.position,
      title: e.title,
      description: e.description,
      startDate: e.startDate,
      endDate: e.endDate,
      duration: e.duration,
      start_date: e.startDate,
      end_date: e.endDate,
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/educations/ ───────────────────────────────────────────
export const getPublicEducations = async (req, res, next) => {
  try {
    const educations = await prisma.education.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = educations.map((e) => ({
      title: e.title,
      university: e.university,
      description: e.description,
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/contact/ ─────────────────────────────────────────────
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ detail: "Name, email, and message are required." });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    // Send email notification (non-blocking)
    sendContactNotificationEmail(contact).catch((err) =>
      console.error("Failed to send contact notification email:", err)
    );

    res.status(201).json({ detail: "Contact message sent successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/blogs/ ────────────────────────────────────────────────
export const getPublicBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/blogs/:slug ───────────────────────────────────────────
export const getPublicBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { slug, isPublished: true },
    });

    if (!blog) {
      return res.status(404).json({ detail: "Blog post not found" });
    }

    res.json(blog);
  } catch (error) {
    next(error);
  }
};

// ─── Helper: format project for public API (Django-compatible) ──────
function formatProjectForPublic(p) {
  return {
    id: p.id,
    title: p.title,
    description: p.description || "",
    tag: p.tag,
    category: p.category,
    duration: p.duration,
    responsibility: p.responsibility || "UX & UI Design",
    client: p.client || "Client Work",
    bg_color: p.bgColor || "#081228",
    bgColor: p.bgColor || "#081228",
    canvas_image: p.canvasImage,
    canvasImage: p.canvasImage,
    image: p.canvasImage,
    svg_file: p.svgFile,
    svgFile: p.svgFile,
    overview_video_link: p.overviewVideoLink,
    overviewVideoLink: p.overviewVideoLink,
    body: p.body,
    is_favorite: p.isFavorite,
    isFavorite: p.isFavorite,
    isPublished: p.isPublished,
  };
}
