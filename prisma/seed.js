import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const LIVE_URL = "https://ahmadjubayerr.pythonanywhere.com";

const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/media/")) return `${LIVE_URL}${path}`;
  if (path.startsWith("media/")) return `${LIVE_URL}/${path}`;
  return `${LIVE_URL}/media/${path}`;
};

async function main() {
  console.log("🌱 Seeding real portfolio data into Neon database...\n");

  // 1. Clear existing data to avoid duplicates
  await prisma.achievement.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.profile.deleteMany();

  // 2. Profile Singleton
  const profile = await prisma.profile.upsert({
    where: { id: "hero" },
    update: {},
    create: {
      id: "hero",
      name: "Design That Connects. Experiences That Matter.",
      headline: "Creative Designer & Developer",
      aboutMe: "I’m Jubayer Ahmad, a UI/UX & Graphic Designer passionate about blending creativity with usability. I design impactful web and mobile experiences that help businesses grow and users enjoy every interaction.",
      whyHireMe: "I design human-centered digital experiences that feel simple, clear, and easy to use. I’ve been working in the design field since 2023, starting my journey as a graphic designer and now focusing on UI/UX design. This background helps me combine strong visual sense with thoughtful, user-focused thinking. I care deeply about clarity, usability, and details, and I always aim to create interfaces that feel natural, intuitive, and genuinely helpful for real people.",
      expertise: "UI/UX Design, Web Development, Mobile App Design, Brand Identity",
      skills: "Figma, React, Next.js, Node.js, Tailwind CSS, PostgreSQL",
      profileImage: getFullUrl("/media/profile/Mask_group.png"),
      resumeUrl: getFullUrl("/media/resumes/Jubayer_Ahmad-01757976790_2.pdf"),
      visionImage: getFullUrl("/media/vision/ahmadjubayerr-4th_2_no_image.jpg"),
      whyChooseMeHeading: "Why I'm Your Ideal Design Partner",
      whyChooseMeFeatures: [
        {
          title: "Product-First Mindset",
          body: "I design with a deep understanding of user needs, business goals, and long-term product scalability—not just screens.",
          icon: "Lightbulb"
        },
        {
          title: "Clarity Over Complexity",
          body: "I simplify complex flows into intuitive, easy-to-use experiences that users understand without friction.",
          icon: "Smartphone"
        },
        {
          title: "End-to-End Design Ownership",
          body: "From research and information architecture to UI and design systems, I handle the complete design process.",
          icon: "Contact"
        },
        {
          title: "Built for Real-World Use",
          body: "My designs are practical, developer-friendly, and ready to ship—focused on usability, not just aesthetics.",
          icon: "Globe"
        }
      ],
      websiteDesignCount: 30,
      mobileAppDesignCount: 30,
      liveProjectCount: 30,
    },
  });
  console.log(`✅ Seeded Profile: ${profile.name}`);

  // 3. Achievements (Gallery Images)
  const achievements = [
    { image: "/media/achievements/freepik__dont-change-my-face-and-transform-this-uploaded-im__72879.jpeg", slot: 0 },
    { image: "/media/achievements/UIUX_Designer_Professional_Portrait_a3ad51v.png", slot: 1 },
    { image: "/media/achievements/Emoployee_off_the_month_ueapqfj.png", slot: 2 },
    { image: "/media/achievements/2025-11-12_02_38_58.9780600.jpg", slot: 3 },
    { image: "/media/achievements/_Image_1_BArqyg3.png", slot: 4 },
    { image: "/media/achievements/freepik__vibrant-expressive-portrait-of-me-looking-upwards-__10017_Y8OdYS6.jpeg", slot: 5 },
    { image: "/media/achievements/2025-11-12_01_38_30.1380600_1.png", slot: 6 }
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({
      data: {
        image: getFullUrl(ach.image),
        slot: ach.slot,
        profileId: "hero"
      }
    });
  }
  console.log(`✅ Seeded ${achievements.length} gallery achievements`);

  // 4. Experiences
  const experiences = [
    {
      position: "UI/UX Designer",
      title: "Join Venture AI(JVAI) – April 2025 - Present",
      description: "Guiding UI interns, collaborating on app and web design projects, and contributing to UX strategy and design systems."
    },
    {
      position: "Graphic Designer",
      title: "Future IT Center – December 2023 – March 2025",
      description: "Created brand identities, marketing materials, packaging and social media content for startups and small businesses."
    }
  ];

  for (const exp of experiences) {
    await prisma.experience.create({ data: exp });
  }
  console.log(`✅ Seeded ${experiences.length} experience milestones`);

  // 5. Educations
  const educations = [
    {
      title: "Bachelor of Arts (Honors) in Economics",
      university: "National University of Bangladesh",
      description: "Currently pursuing my studies in Economics, learning how economic systems and development work in real life."
    }
  ];

  for (const edu of educations) {
    await prisma.education.create({ data: edu });
  }
  console.log(`✅ Seeded ${educations.length} educational qualifications`);

  // 6. Certifications
  const certifications = [
    {
      title: "Professional UX/UI Design",
      institute: "Creative IT Institute • 2023",
      description: "UX research, wireframing, prototyping, and usability testing.",
      image: getFullUrl("certificate_image/certificate_page-0001.jpg"),
      pdfFile: "https://drive.google.com/file/d/19lTMoFcLyPJFjKQ-sAYR53Ng6OGNgoy4/view?usp=drive_link"
    },
    {
      title: "Professional Graphic Design",
      institute: "Creative IT Institute & Sheikh Kamal IT • 2023",
      description: "Created brand identities, marketing materials, packaging and social media content for startups and small businesses.",
      image: getFullUrl("certificate_image/Graphic_Design_CITcertificate_page-0001.jpg"),
      pdfFile: "https://drive.google.com/file/d/1yX3wtQHYiVhaCHMuzc9TqX1LzgQJZftY/view?usp=sharing"
    }
  ];

  for (const cert of certifications) {
    await prisma.certification.create({ data: cert });
  }
  console.log(`✅ Seeded ${certifications.length} certifications`);

  // 7. Projects
  const projects = [
    {
      title: "Addiction Recovery: Smart Tracking, Smooth Progress",
      tag: "live project, Mobile App design, Case Study",
      category: "case_study",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/Thumb.jpg"),
      svgFile: getFullUrl("/media/projects/svg/Image.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=KxjI9Xa-88U",
      body: "An AI-powered habit coach designed to help users break bad habits through small, consistent behavior changes. This case study showcases the complete UI/UX process from problem definition and user flows to final UI, focusing on empathy, behavioral psychology, and practical AI support."
    },
    {
      title: "Mood-Based Food Recommendations App",
      tag: "live project, Mobile App",
      category: "mobile",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/Thumb_7aZWWWm.png"),
      svgFile: getFullUrl("/media/projects/svg/moodymeal.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=qCBLGLfZUD8",
      body: "MoodyMeal suggests meals based on a user’s mood and available ingredients, making food choices more practical while reducing waste."
    },
    {
      title: "A Social Accountability App for Daily Goal Completion",
      tag: "live project, Mobile App design, Case Study",
      category: "mobile",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/Thumb.png"),
      svgFile: getFullUrl("/media/projects/svg/Tinny_Project.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=GlYfvdxlq0c",
      body: "Tiny Group helps users stay consistent by achieving goals together in small, focused groups with clear daily targets and shared accountability."
    },
    {
      title: "A Human Centered Memory Game App",
      tag: "live project, Mobile App",
      category: "live",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/Thumb_EQctTrR.jpg"),
      svgFile: getFullUrl("/media/projects/svg/Memory_game_Project.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=nrFIL9sEkKs",
      body: "A calm memory-matching experience designed to support cognitive engagement through personal photos and familiar voices, making memory practice feel comforting and meaningful."
    },
    {
      title: "Designing a Two-Sided Laundry Marketplace Experience",
      tag: "live project, Mobile App design, Case Study",
      category: "live",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/Thumb_XmOR3Am.jpg"),
      svgFile: getFullUrl("/media/projects/svg/laundry_project.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=yGOmJD3SZfI",
      body: "A real client UI/UX case study focused on designing flexible service flows, transparent pricing, and clear communication for a two-sided laundry marketplace app in the U.S. market."
    },
    {
      title: "Trading Platform",
      tag: "Live Projects, Case Study, Website Design",
      category: "live",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/abdullah_thumb.jpg"),
      svgFile: getFullUrl("/media/projects/svg/Abdullah_Project_view.jpg"),
      overviewVideoLink: null,
      body: "This intro video highlights how users can access AI-driven market insights, generate compliant trade documents, calculate CIF/FOB pricing, and run due diligence reports—all within a simple, modern interface designed for speed and clarity."
    },
    {
      title: "FuelDeal.ai | AI-Powered Oil & Gas Trading Platform",
      tag: "live project, Mobile App design, Case Study",
      category: "live",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/abdullah_thumb_9aoxQlJ.jpg"),
      svgFile: getFullUrl("/media/projects/svg/Abdullah_Project_view_qpyHhU4.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=ccUZQcMrvuw&list=PLo9hbO0WEZ3XEka-rLmCowyoW10TfNAuq&index=1",
      body: "FuelDeal.ai is an AI-powered platform built for oil and fuel trading professionals. This intro video highlights how users can access AI-driven market insights, generate compliant trade documents, calculate CIF/FOB pricing, and run due diligence reports—all within a simple, modern interface designed for speed and clarity."
    },
    {
      title: "Multi-Sport Live Score App",
      tag: "Live Project, Mobile App",
      category: "live",
      duration: "30 days",
      canvasImage: getFullUrl("/media/projects/canvas/sports_Thumb.jpg"),
      svgFile: getFullUrl("/media/projects/svg/Sports_project_preview.jpg"),
      overviewVideoLink: "https://www.youtube.com/watch?v=x_EQhQUsi5c",
      body: "A UI/UX case study of a live sports app designed to deliver real-time scores and match insights with speed and clarity across multiple sports."
    },
    {
      title: "Supplement Label Design",
      tag: "Graphic Desgn",
      category: "graphics",
      duration: "03 Day's",
      canvasImage: getFullUrl("/media/projects/canvas/614cf38c-55f4-43f2-a7fb-2117cbb58.jpg"),
      svgFile: getFullUrl("/media/projects/svg/Label_Design_PdnJpPz.jpg"),
      overviewVideoLink: null,
      body: "This is my new project of Label Design. Hope you appreciate this. If you looking for Similar or Custom Label Designs for your business, please contact me.​​​​​​​"
    },
    {
      title: "LOGO DESIGN for BOMI EXCHANGE",
      tag: "Graphic Desgn",
      category: "graphics",
      duration: "03 Day's",
      canvasImage: getFullUrl("/media/projects/canvas/LM000.jpg"),
      svgFile: getFullUrl("/media/projects/svg/logo_Design.jpg"),
      overviewVideoLink: null,
      body: "This is \"Bomi Exchange\" Logo by Crypto company for international client.\r\nIf your need this type logo or another design, you can feel free to contact with me."
    }
  ];

  for (const proj of projects) {
    await prisma.project.create({ data: proj });
  }
  console.log(`✅ Seeded ${projects.length} portfolio projects`);

  console.log("\n🎉 Seed complete! All real portfolio data imported successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
