import { PrismaClient } from "@prisma/client";

function getCleanDatabaseUrl() {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;

  // Replace Neon pooled host with direct host for Prisma ORM stability
  url = url.replace("-pooler.c-4.us-east-2.aws.neon.tech", ".c-4.us-east-2.aws.neon.tech");

  // Strip problematic channel_binding parameter
  url = url.replace("&channel_binding=require", "").replace("?channel_binding=require", "?");

  // Ensure connect_timeout=30 parameter is included
  if (!url.includes("connect_timeout")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connect_timeout=30`;
  }

  return url;
}

const cleanUrl = getCleanDatabaseUrl();

export const prisma = cleanUrl
  ? new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl,
        },
      },
    })
  : new PrismaClient();

