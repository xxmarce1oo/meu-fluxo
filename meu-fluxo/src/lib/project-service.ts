// src/lib/project-service.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { kv } from "@vercel/kv";

interface ProjectData {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
}

export async function getUserProjects() {
  // 1. Get the user session directly
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Não autorizado");
  }
  const userId = session.user.email;

  // 2. Fetch all project IDs for the user
  const projectIds = await kv.smembers(`projects:by-user:${userId}`);

  if (projectIds.length === 0) {
    return []; // Return an empty array if no projects exist
  }

  // 3. Fetch the details for each project
  const pipeline = kv.pipeline();
  projectIds.forEach(id => pipeline.hgetall(`project:${id}`));
  const projects = await pipeline.exec<ProjectData[]>();

  return projects;
}