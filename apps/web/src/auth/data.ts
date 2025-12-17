import "server-only";

import { prisma } from "@rallly/database";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createSpaceDTO } from "@/features/space/data";
import { getUser } from "@/features/user/data";
import { getSession } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { isInitialAdmin } from "@/utils/is-initial-admin";

/**
 * Gets the current user if they are logged in, otherwise null.
 * @returns The current user if they are logged in, otherwise null.
 */
// Public demo mode: Safe getCurrentUser that doesn't crash if auth fails
export const getCurrentUser = async () => {
  try {
    const session = await getSession();

    if (!session?.user || session.user.isGuest) {
      return null;
    }

    const user = await getUser(session.user.id);

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    // Public demo mode: Return null if auth fails instead of crashing
    console.warn("getCurrentUser failed (expected in demo mode):", error);
    return null;
  }
};

export const getCurrentUserSpace = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get the most recently selected space via SpaceMember
  const spaceMember = await prisma.spaceMember.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      lastSelectedAt: "desc",
    },
    include: {
      space: {
        select: {
          id: true,
          name: true,
          ownerId: true,
          tier: true,
        },
      },
    },
  });

  if (!spaceMember) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Space not found",
    });
  }

  return {
    user,
    space: createSpaceDTO({
      id: spaceMember.space.id,
      ownerId: spaceMember.space.ownerId,
      name: spaceMember.space.name,
      tier: spaceMember.space.tier,
      role: spaceMember.role,
    }),
  };
};

export const requireAdmin = cache(async () => {
  const user = await requireUser();

  // Public demo mode: return null if no user
  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    if (isInitialAdmin(user.email)) {
      return redirect("/admin-setup");
    }

    notFound();
  }
  
  return user;
});

export const requireUser = cache(async () => {
  const session = await getSession();

  if (!session?.user || session.user.isGuest) {
    return null;
  }

  const user = await getUser(session.user.id);

  if (!user) {
    return null;
  }

  return user;
});

export const requireSpace = cache(async () => {
  const user = await requireUser();

  if (!user) {
    return null;
  }

  const spaceMember = await prisma.spaceMember.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      lastSelectedAt: "desc",
    },
    include: {
      space: {
        select: {
          id: true,
          ownerId: true,
          name: true,
          tier: true,
          image: true,
        },
      },
    },
  });

  if (!spaceMember) {
    return null;
  }

  return createSpaceDTO({
    id: spaceMember.space.id,
    ownerId: spaceMember.space.ownerId,
    name: spaceMember.space.name,
    tier: spaceMember.space.tier,
    role: spaceMember.role,
    image: spaceMember.space.image,
  });
});
