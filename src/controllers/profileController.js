import { prisma } from "../lib/prisma.js";

// GET /profile
export const getProfile = async (req, res, next) => {
  try {
    let profile = await prisma.profile.findUnique({
      where: { id: "hero" },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: "hero",
          name: "Ahmad Jubayer",
          headline: "Creative Designer & Developer",
          aboutMe: "I craft beautiful user experiences and high-performance web applications.",
          websiteCount: 45,
          mobileCount: 45,
          projectCount: 45,
        },
      });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// PUT /profile
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      headline,
      aboutMe,
      profileImage,
      resumeUrl,
      websiteCount,
      mobileCount,
      projectCount,
    } = req.body;

    const profile = await prisma.profile.upsert({
      where: { id: "hero" },
      update: {
        ...(name !== undefined && { name }),
        ...(headline !== undefined && { headline }),
        ...(aboutMe !== undefined && { aboutMe }),
        ...(profileImage !== undefined && { profileImage }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(websiteCount !== undefined && { websiteCount: parseInt(websiteCount) || 0 }),
        ...(mobileCount !== undefined && { mobileCount: parseInt(mobileCount) || 0 }),
        ...(projectCount !== undefined && { projectCount: parseInt(projectCount) || 0 }),
      },
      create: {
        id: "hero",
        name: name || "Ahmad Jubayer",
        headline: headline || "Creative Designer & Developer",
        aboutMe: aboutMe || "I craft beautiful user experiences and high-performance web applications.",
        profileImage: profileImage || null,
        resumeUrl: resumeUrl || null,
        websiteCount: parseInt(websiteCount) || 45,
        mobileCount: parseInt(mobileCount) || 45,
        projectCount: parseInt(projectCount) || 45,
      },
    });

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    next(error);
  }
};
