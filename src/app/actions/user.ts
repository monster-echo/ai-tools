"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkDailyRewardAction() {
  const { userId } = await auth();
  if (!userId) return { success: false };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return { success: false };

    const now = new Date();
    const lastReward = user.lastDailyReward;

    // Check if reward was already claimed today
    const isSameDay =
      lastReward &&
      lastReward.getDate() === now.getDate() &&
      lastReward.getMonth() === now.getMonth() &&
      lastReward.getFullYear() === now.getFullYear();

    if (!isSameDay) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: { increment: 20 },
          lastDailyReward: now,
        },
      });
      revalidatePath("/");
      revalidatePath("/features/image-studio");
      return {
        success: true,
        rewarded: true,
        message: "Daily reward claimed!",
      };
    }

    return { success: true, rewarded: false };
  } catch (error) {
    console.error("Daily reward check failed:", error);
    return { success: false, error: "Failed to check daily reward" };
  }
}

export async function getUserCreditsAction() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Check for daily reward before fetching credits
    await checkDailyRewardAction();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { credits: true },
    });

    return { success: true, credits: user?.credits || 0 };
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    return { success: false, error: "Failed to fetch credits" };
  }
}

export async function addCreditsAction(amount: number) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        credits: { increment: amount },
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        credits: amount,
      },
    });

    revalidatePath("/features/image-studio");
    return { success: true, credits: updatedUser.credits };
  } catch (error) {
    console.error("Failed to add credits:", error);
    return { success: false, error: "Failed to add credits" };
  }
}
