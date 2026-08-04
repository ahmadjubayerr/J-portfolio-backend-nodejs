import { prisma } from "../lib/prisma.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";

// ═══════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════

export const getAdminProfile = async (req, res, next) => {
  try {
    let profile = await prisma.profile.findUnique({
      where: { id: "hero" },
      include: { achievements: true },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: { id: "hero" },
        include: { achievements: true },
      });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const {
      name, headline, aboutMe, whyHireMe, expertise, skills,
      websiteDesignCount, mobileAppDesignCount, liveProjectCount,
      profileImage, resumeUrl, visionImage,
      // Legacy field names from dashboard
      websiteCount, mobileCount, projectCount,
    } = req.body;

    const profile = await prisma.profile.upsert({
      where: { id: "hero" },
      update: {
        ...(name !== undefined && { name }),
        ...(headline !== undefined && { headline }),
        ...(aboutMe !== undefined && { aboutMe }),
        ...(whyHireMe !== undefined && { whyHireMe }),
        ...(expertise !== undefined && { expertise }),
        ...(skills !== undefined && { skills }),
        ...(profileImage !== undefined && { profileImage }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(visionImage !== undefined && { visionImage }),
        ...((websiteDesignCount !== undefined || websiteCount !== undefined) && {
          websiteDesignCount: parseInt(websiteDesignCount ?? websiteCount) || 0,
        }),
        ...((mobileAppDesignCount !== undefined || mobileCount !== undefined) && {
          mobileAppDesignCount: parseInt(mobileAppDesignCount ?? mobileCount) || 0,
        }),
        ...((liveProjectCount !== undefined || projectCount !== undefined) && {
          liveProjectCount: parseInt(liveProjectCount ?? projectCount) || 0,
        }),
      },
      create: {
        id: "hero",
        name: name || "Ahmad Jubayer",
        headline: headline || "Creative Designer & Developer",
        aboutMe: aboutMe || "",
        whyHireMe: whyHireMe || "",
        expertise: expertise || "",
        skills: skills || "",
        profileImage: profileImage || null,
        resumeUrl: resumeUrl || null,
        visionImage: visionImage || null,
        websiteDesignCount: parseInt(websiteDesignCount ?? websiteCount) || 0,
        mobileAppDesignCount: parseInt(mobileAppDesignCount ?? mobileCount) || 0,
        liveProjectCount: parseInt(liveProjectCount ?? projectCount) || 0,
      },
    });

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "portfolio/profile");
    await prisma.profile.upsert({
      where: { id: "hero" },
      update: { profileImage: result.url },
      create: { id: "hero", profileImage: result.url },
    });
    res.json({ message: "Profile image uploaded", url: result.url });
  } catch (error) {
    next(error);
  }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "portfolio/resumes", "raw");
    await prisma.profile.upsert({
      where: { id: "hero" },
      update: { resumeUrl: result.url },
      create: { id: "hero", resumeUrl: result.url },
    });
    res.json({ message: "Resume uploaded", url: result.url });
  } catch (error) {
    next(error);
  }
};

export const uploadVisionImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "portfolio/vision");
    await prisma.profile.upsert({
      where: { id: "hero" },
      update: { visionImage: result.url },
      create: { id: "hero", visionImage: result.url },
    });
    res.json({ message: "Vision image uploaded", url: result.url });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════

export const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getAdminProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, body, tag, category, duration, overviewVideoLink, isFavorite, isPublished } = req.body;

    let canvasImageUrl = null;
    let svgFileUrl = null;

    // Handle file uploads
    if (req.files) {
      if (req.files.canvasImage?.[0]) {
        const result = await uploadToCloudinary(req.files.canvasImage[0].buffer, "portfolio/projects/canvas");
        canvasImageUrl = result.url;
      }
      if (req.files.svgFile?.[0]) {
        const result = await uploadToCloudinary(req.files.svgFile[0].buffer, "portfolio/projects/svg");
        svgFileUrl = result.url;
      }
    }

    // Also accept URL strings directly (from dashboard base64 or URLs)
    if (!canvasImageUrl && req.body.canvasImage) canvasImageUrl = req.body.canvasImage;
    if (!svgFileUrl && req.body.svgFile) svgFileUrl = req.body.svgFile;

    const project = await prisma.project.create({
      data: {
        title: title || "Untitled Project",
        body: body || "",
        tag: tag || "",
        category: category || "website",
        duration: duration || "",
        overviewVideoLink: overviewVideoLink || null,
        canvasImage: canvasImageUrl,
        svgFile: svgFileUrl,
        isFavorite: isFavorite === true || isFavorite === "true",
        isPublished: isPublished === undefined ? true : (isPublished === true || isPublished === "true"),
      },
    });

    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, body, tag, category, duration, overviewVideoLink, isFavorite, isPublished } = req.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Project not found" });

    let canvasImageUrl = existing.canvasImage;
    let svgFileUrl = existing.svgFile;

    if (req.files) {
      if (req.files.canvasImage?.[0]) {
        const result = await uploadToCloudinary(req.files.canvasImage[0].buffer, "portfolio/projects/canvas");
        canvasImageUrl = result.url;
      }
      if (req.files.svgFile?.[0]) {
        const result = await uploadToCloudinary(req.files.svgFile[0].buffer, "portfolio/projects/svg");
        svgFileUrl = result.url;
      }
    }

    // Accept URL strings directly
    if (req.body.canvasImage && !req.files?.canvasImage) canvasImageUrl = req.body.canvasImage;
    if (req.body.svgFile && !req.files?.svgFile) svgFileUrl = req.body.svgFile;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(tag !== undefined && { tag }),
        ...(category !== undefined && { category }),
        ...(duration !== undefined && { duration }),
        ...(overviewVideoLink !== undefined && { overviewVideoLink }),
        ...(isFavorite !== undefined && { isFavorite: isFavorite === true || isFavorite === "true" }),
        ...(isPublished !== undefined && { isPublished: isPublished === true || isPublished === "true" }),
        canvasImage: canvasImageUrl,
        svgFile: svgFileUrl,
      },
    });

    res.json({ message: "Project updated", project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

export const toggleProjectFavorite = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { isFavorite: !project.isFavorite },
    });
    res.json({ message: `Project ${updated.isFavorite ? "favorited" : "unfavorited"}`, project: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleProjectPublish = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { isPublished: !project.isPublished },
    });
    res.json({ message: `Project ${updated.isPublished ? "published" : "unpublished"}`, project: updated });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// EXPERIENCE
// ═══════════════════════════════════════════════════════════════════

export const getAdminExperiences = async (req, res, next) => {
  try {
    const experiences = await prisma.experience.findMany({ orderBy: { createdAt: "desc" } });
    res.json(experiences);
  } catch (error) {
    next(error);
  }
};

export const createExperience = async (req, res, next) => {
  try {
    const { position, title, description } = req.body;
    if (!position || !title) return res.status(400).json({ message: "Position and title are required" });

    const experience = await prisma.experience.create({
      data: { position, title, description: description || "" },
    });
    res.status(201).json({ message: "Experience created", experience });
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req, res, next) => {
  try {
    const { position, title, description } = req.body;
    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: {
        ...(position !== undefined && { position }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });
    res.json({ message: "Experience updated", experience });
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req, res, next) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.json({ message: "Experience deleted" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// EDUCATION
// ═══════════════════════════════════════════════════════════════════

export const getAdminEducations = async (req, res, next) => {
  try {
    const educations = await prisma.education.findMany({ orderBy: { createdAt: "desc" } });
    res.json(educations);
  } catch (error) {
    next(error);
  }
};

export const createEducation = async (req, res, next) => {
  try {
    const { title, university, description } = req.body;
    if (!title || !university) return res.status(400).json({ message: "Title and university are required" });

    const education = await prisma.education.create({
      data: { title, university, description: description || "" },
    });
    res.status(201).json({ message: "Education created", education });
  } catch (error) {
    next(error);
  }
};

export const updateEducation = async (req, res, next) => {
  try {
    const { title, university, description } = req.body;
    const education = await prisma.education.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(university !== undefined && { university }),
        ...(description !== undefined && { description }),
      },
    });
    res.json({ message: "Education updated", education });
  } catch (error) {
    next(error);
  }
};

export const deleteEducation = async (req, res, next) => {
  try {
    await prisma.education.delete({ where: { id: req.params.id } });
    res.json({ message: "Education deleted" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════════

export const getAdminCertifications = async (req, res, next) => {
  try {
    const certifications = await prisma.certification.findMany({ orderBy: { createdAt: "desc" } });
    res.json(certifications);
  } catch (error) {
    next(error);
  }
};

export const createCertification = async (req, res, next) => {
  try {
    const { title, institute, description, pdfFile } = req.body;
    if (!title || !institute) return res.status(400).json({ message: "Title and institute are required" });

    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/certifications");
      imageUrl = result.url;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const certification = await prisma.certification.create({
      data: {
        title,
        institute,
        description: description || "",
        image: imageUrl,
        pdfFile: pdfFile || null,
      },
    });
    res.status(201).json({ message: "Certification created", certification });
  } catch (error) {
    next(error);
  }
};

export const updateCertification = async (req, res, next) => {
  try {
    const { title, institute, description, pdfFile } = req.body;

    let imageUrl = undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/certifications");
      imageUrl = result.url;
    } else if (req.body.image !== undefined) {
      imageUrl = req.body.image;
    }

    const certification = await prisma.certification.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(institute !== undefined && { institute }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { image: imageUrl }),
        ...(pdfFile !== undefined && { pdfFile }),
      },
    });
    res.json({ message: "Certification updated", certification });
  } catch (error) {
    next(error);
  }
};

export const deleteCertification = async (req, res, next) => {
  try {
    await prisma.certification.delete({ where: { id: req.params.id } });
    res.json({ message: "Certification deleted" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS / GALLERY
// ═══════════════════════════════════════════════════════════════════

export const getAdminAchievements = async (req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({ orderBy: { createdAt: "desc" } });
    res.json(achievements);
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/achievements");
      imageUrl = result.url;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!imageUrl) return res.status(400).json({ message: "Image is required" });

    const achievement = await prisma.achievement.create({
      data: { image: imageUrl, profileId: "hero" },
    });
    res.status(201).json({ message: "Achievement added", achievement });
  } catch (error) {
    next(error);
  }
};

export const deleteAchievement = async (req, res, next) => {
  try {
    await prisma.achievement.delete({ where: { id: req.params.id } });
    res.json({ message: "Achievement deleted" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// CONTACT MESSAGES
// ═══════════════════════════════════════════════════════════════════

export const getAdminMessages = async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const markMessageRead = async (req, res, next) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ message: "Marked as read", data: message });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// BLOGS
// ═══════════════════════════════════════════════════════════════════

export const getAdminBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

export const getAdminBlog = async (req, res, next) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, tags, isPublished } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let coverImageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/blogs");
      coverImageUrl = result.url;
    } else if (req.body.coverImage) {
      coverImageUrl = req.body.coverImage;
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content: content || "",
        excerpt: excerpt || "",
        coverImage: coverImageUrl,
        tags: tags || "",
        isPublished: isPublished === true || isPublished === "true",
      },
    });
    res.status(201).json({ message: "Blog created", blog });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, tags, isPublished } = req.body;

    let coverImageUrl = undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "portfolio/blogs");
      coverImageUrl = result.url;
    } else if (req.body.coverImage !== undefined) {
      coverImageUrl = req.body.coverImage;
    }

    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(tags !== undefined && { tags }),
        ...(isPublished !== undefined && { isPublished: isPublished === true || isPublished === "true" }),
        ...(coverImageUrl !== undefined && { coverImage: coverImageUrl }),
      },
    });
    res.json({ message: "Blog updated", blog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ message: "Blog deleted" });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

export const getDashboardStats = async (req, res, next) => {
  try {
    const [projectCount, blogCount, unreadMessages, totalMessages] = await Promise.all([
      prisma.project.count(),
      prisma.blog.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.contactMessage.count(),
    ]);

    res.json({
      projectCount,
      blogCount,
      unreadMessages,
      totalMessages,
    });
  } catch (error) {
    next(error);
  }
};
