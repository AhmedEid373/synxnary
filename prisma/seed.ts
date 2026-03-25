import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@synxnary.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@synxnary.com",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@synxnary.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "user@synxnary.com",
      hashedPassword: userPassword,
      role: "USER",
    },
  });
  console.log("Created regular user:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "web-development" },
      update: {},
      create: { name: "Web Development", slug: "web-development" },
    }),
    prisma.category.upsert({
      where: { slug: "programming" },
      update: {},
      create: { name: "Programming", slug: "programming" },
    }),
    prisma.category.upsert({
      where: { slug: "data-science" },
      update: {},
      create: { name: "Data Science", slug: "data-science" },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: { name: "Design", slug: "design" },
    }),
  ]);
  console.log("Created categories:", categories.map((c) => c.name).join(", "));

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { slug: "nextjs-complete-guide" },
    update: {},
    create: {
      title: "Next.js Complete Guide",
      slug: "nextjs-complete-guide",
      description:
        "Learn Next.js from scratch. This comprehensive course covers App Router, Server Components, API Routes, Authentication, and deployment.",
      thumbnail: "https://img.youtube.com/vi/ZVnjOPwW4ZA/hqdefault.jpg",
      price: "FREE",
      published: true,
      categoryId: categories[0].id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "python-for-beginners" },
    update: {},
    create: {
      title: "Python for Beginners",
      slug: "python-for-beginners",
      description:
        "Start your programming journey with Python. Learn variables, functions, loops, and build real projects.",
      thumbnail: "https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg",
      price: "FREE",
      published: true,
      categoryId: categories[1].id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: "react-masterclass" },
    update: {},
    create: {
      title: "React Masterclass",
      slug: "react-masterclass",
      description:
        "Master React with hooks, context, Redux, and advanced patterns. Build production-ready applications.",
      price: "PAID",
      published: true,
      categoryId: categories[0].id,
    },
  });

  console.log("Created courses:", [course1, course2, course3].map((c) => c.title).join(", "));

  // Create lessons for course 1
  const lessons1 = await Promise.all([
    prisma.lesson.upsert({
      where: { courseId_position: { courseId: course1.id, position: 1 } },
      update: {},
      create: {
        title: "Introduction to Next.js",
        description: "What is Next.js and why should you use it?",
        videoUrl: "https://www.youtube.com/watch?v=ZVnjOPwW4ZA",
        embedUrl: "https://www.youtube.com/embed/ZVnjOPwW4ZA",
        videoSource: "YOUTUBE",
        thumbnailUrl: "https://img.youtube.com/vi/ZVnjOPwW4ZA/hqdefault.jpg",
        position: 1,
        duration: "15:30",
        courseId: course1.id,
      },
    }),
    prisma.lesson.upsert({
      where: { courseId_position: { courseId: course1.id, position: 2 } },
      update: {},
      create: {
        title: "Setting Up Your Project",
        description: "Create a new Next.js project and understand the file structure.",
        videoUrl: "https://www.youtube.com/watch?v=pUNSHPyVryU",
        embedUrl: "https://www.youtube.com/embed/pUNSHPyVryU",
        videoSource: "YOUTUBE",
        thumbnailUrl: "https://img.youtube.com/vi/pUNSHPyVryU/hqdefault.jpg",
        position: 2,
        duration: "12:45",
        courseId: course1.id,
      },
    }),
    prisma.lesson.upsert({
      where: { courseId_position: { courseId: course1.id, position: 3 } },
      update: {},
      create: {
        title: "App Router and Layouts",
        description: "Learn about the new App Router, layouts, and nested routing.",
        videoUrl: "https://www.youtube.com/watch?v=DrxiNfbr63s",
        embedUrl: "https://www.youtube.com/embed/DrxiNfbr63s",
        videoSource: "YOUTUBE",
        thumbnailUrl: "https://img.youtube.com/vi/DrxiNfbr63s/hqdefault.jpg",
        position: 3,
        duration: "20:10",
        courseId: course1.id,
      },
    }),
  ]);
  console.log("Created", lessons1.length, "lessons for", course1.title);

  // Create lessons for course 2
  const lessons2 = await Promise.all([
    prisma.lesson.upsert({
      where: { courseId_position: { courseId: course2.id, position: 1 } },
      update: {},
      create: {
        title: "Getting Started with Python",
        description: "Install Python and write your first program.",
        videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        embedUrl: "https://www.youtube.com/embed/kqtD5dpn9C8",
        videoSource: "YOUTUBE",
        thumbnailUrl: "https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg",
        position: 1,
        duration: "18:00",
        courseId: course2.id,
      },
    }),
    prisma.lesson.upsert({
      where: { courseId_position: { courseId: course2.id, position: 2 } },
      update: {},
      create: {
        title: "Variables and Data Types",
        description: "Understanding Python variables, strings, numbers, and booleans.",
        videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
        embedUrl: "https://www.youtube.com/embed/cQT33yu9pY8",
        videoSource: "YOUTUBE",
        thumbnailUrl: "https://img.youtube.com/vi/cQT33yu9pY8/hqdefault.jpg",
        position: 2,
        duration: "22:30",
        courseId: course2.id,
      },
    }),
  ]);
  console.log("Created", lessons2.length, "lessons for", course2.title);

  // Enroll user in course1
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course1.id } },
    update: {},
    create: {
      userId: user.id,
      courseId: course1.id,
    },
  });
  console.log("Enrolled", user.name, "in", course1.title);

  // Mark first lesson as completed
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lessons1[0].id } },
    update: {},
    create: {
      userId: user.id,
      lessonId: lessons1[0].id,
      completed: true,
      completedAt: new Date(),
    },
  });
  console.log("Marked lesson 1 as completed for", user.name);

  console.log("\nSeed completed successfully!");
  console.log("Admin login: admin@synxnary.com / admin123");
  console.log("User login: user@synxnary.com / user123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
