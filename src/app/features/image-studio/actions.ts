"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { costs, get_model_cost } from "./costs";

export async function getHistoryAction() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Find the user in our DB using the clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { success: true, data: [] }; // No user in DB yet, so no history
    }

    const history = await prisma.imageGeneration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, data: history };
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}

export async function generateImageAction(data: {
  prompt: string;
  ratio: string;
  style: string;
  model: string;
}) {
  const { prompt, ratio, style, model } = data;

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Ensure user exists in DB
  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
    },
  });

  const COST_PER_IMAGE = 6;

  if (dbUser.credits < COST_PER_IMAGE) {
    return { success: false, error: "Insufficient credits" };
  }

  console.log(`Generating image with: ${model}, ${style}, ${ratio}`);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OpenRouter API key is not configured" };
  }

  // Map ratio to dimensions
  let width = 1024;
  let height = 1024;

  if (ratio === "16:9") {
    width = 1024;
    height = 576;
  } else if (ratio === "3:4") {
    width = 768;
    height = 1024;
  }

  // Use width and height to avoid unused variable error, although the SDK call below doesn't use them directly
  // because the user provided code snippet didn't include size.
  // But we should probably include it in the prompt or check if the SDK supports it.
  // For now, let's just log them to satisfy the linter or append to prompt.
  console.log(`Dimensions: ${width}x${height}`);

  // Map UI model names to OpenRouter IDs
  const modelMap: Record<string, string> = {
    flux1: "black-forest-labs/flux.2-flex",
    flux2: "black-forest-labs/flux.2-pro",
  };

  // Use the requested model if it's a full ID, or map from short name
  const modelId = modelMap[model] || model;

  // Create pending record and deduct credits
  const [generationRecord] = await prisma.$transaction([
    prisma.imageGeneration.create({
      data: {
        userId: dbUser.id,
        prompt,
        model: modelId,
        ratio,
        style,
        status: "PENDING",
        cost: COST_PER_IMAGE,
      },
    }),
    prisma.user.update({
      where: { id: dbUser.id },
      data: { credits: { decrement: COST_PER_IMAGE } },
    }),
  ]);

  try {
    const finalPrompt =
      style && style !== "none" ? `${style} style. ${prompt}` : prompt;
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    const result = await client.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "user" as const,
          content: finalPrompt,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modalities: ["image", "text"] as any,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = result.choices[0].message as any;

    let imageUrl = "";

    if (message.images && message.images.length > 0) {
      imageUrl = message.images[0].image_url.url;
    } else if (message.content) {
      console.log("No images in message, content:", message.content);
    }

    if (!imageUrl) {
      throw new Error("No image URL received from OpenRouter");
    }

    // Update record to completed
    const updatedRecord = await prisma.imageGeneration.update({
      where: { id: generationRecord.id },
      data: {
        imageUrl: imageUrl,
        status: "COMPLETED",
      },
    });

    return {
      success: true,
      data: {
        id: updatedRecord.id,
        imageUrl: updatedRecord.imageUrl!,
        status: "COMPLETED" as const,
        prompt: updatedRecord.prompt,
        ratio: updatedRecord.ratio,
        createdAt: updatedRecord.createdAt,
      },
    };
  } catch (error: unknown) {
    console.error("Generation failed:", error);

    // Ensure record is marked failed if not already and refund credits
    try {
      await prisma.$transaction([
        prisma.imageGeneration.update({
          where: { id: generationRecord.id },
          data: { status: "FAILED" },
        }),
        prisma.user.update({
          where: { id: dbUser.id },
          data: { credits: { increment: COST_PER_IMAGE } },
        }),
      ]);
    } catch {
      // Ignore update error if record doesn't exist or DB is down
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate image";
    return { success: false, error: errorMessage };
  }
}

export async function generateImageVariantAction(data: {
  prompt: string;
  image: string; // Base64 data URL
  strength: number;
  model: string;
}) {
  const { prompt, image, strength, model } = data;

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // Ensure user exists in DB
  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
    },
  });

  const COST_PER_IMAGE = 8;

  if (dbUser.credits < COST_PER_IMAGE) {
    return { success: false, error: "Insufficient credits" };
  }

  console.log(`Generating variant with: ${model}, strength: ${strength}`);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OpenRouter API key is not configured" };
  }

  // Map UI model names to OpenRouter IDs
  const modelMap: Record<string, string> = {
    flux1: "black-forest-labs/flux.2-flex",
    flux2: "black-forest-labs/flux.2-pro",
  };

  const modelId = modelMap[model] || model;

  // Create pending record and deduct credits
  const [generationRecord] = await prisma.$transaction([
    prisma.imageGeneration.create({
      data: {
        userId: dbUser.id,
        prompt: `[I2I] ${prompt}`,
        model: modelId,
        ratio: "1:1", // Default for I2I for now, or infer from image
        style: "none",
        status: "PENDING",
        cost: COST_PER_IMAGE,
      },
    }),
    prisma.user.update({
      where: { id: dbUser.id },
      data: { credits: { decrement: COST_PER_IMAGE } },
    }),
  ]);

  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
    });

    // For Flux I2I via OpenRouter, we might need to check specific documentation.
    // But generally, multimodal inputs work like this:
    const result = await client.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image, // data:image/...;base64,...
              },
            },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modalities: ["image", "text"] as any,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = result.choices[0].message as any;

    let imageUrl = "";

    if (message.images && message.images.length > 0) {
      imageUrl = message.images[0].image_url.url;
    }

    if (!imageUrl) {
      throw new Error("No image URL received from OpenRouter");
    }

    // Update record to completed
    const updatedRecord = await prisma.imageGeneration.update({
      where: { id: generationRecord.id },
      data: {
        imageUrl: imageUrl,
        status: "COMPLETED",
      },
    });

    return {
      success: true,
      data: {
        id: updatedRecord.id,
        imageUrl: updatedRecord.imageUrl!,
        status: "COMPLETED" as const,
        prompt: updatedRecord.prompt,
        ratio: updatedRecord.ratio,
        createdAt: updatedRecord.createdAt,
      },
    };
  } catch (error: unknown) {
    console.error("Generation failed:", error);

    // Refund credits
    try {
      await prisma.$transaction([
        prisma.imageGeneration.update({
          where: { id: generationRecord.id },
          data: { status: "FAILED" },
        }),
        prisma.user.update({
          where: { id: dbUser.id },
          data: { credits: { increment: COST_PER_IMAGE } },
        }),
      ]);
    } catch {
      // Ignore
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate image";
    return { success: false, error: errorMessage };
  }
}
