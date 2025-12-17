"use client";
import React from "react";
import type { UserAbility } from "@/features/user/ability";
import { defineAbilityFor } from "@/features/user/ability";
import type { UserDTO } from "@/features/user/schema";
import { isOwner } from "@/utils/permissions";
import { useRequiredContext } from "./use-required-context";

type GuestUser = {
  id: string;
  isGuest: true;
};

type UserContextValue = {
  user?: UserDTO | GuestUser;
  createGuestIfNeeded: () => Promise<void>;
  getAbility: () => UserAbility;
  ownsObject: (obj: {
    userId?: string | null;
    guestId?: string | null;
  }) => boolean;
};

export const UserContext = React.createContext<UserContextValue | null>(null);

export const useUser = () => {
  return useRequiredContext(UserContext, "UserContext");
};

// Public demo mode: UserProvider without auth client initialization
export const UserProvider = ({
  children,
  user,
}: {
  children?: React.ReactNode;
  user?: UserDTO;
}) => {
  const value = React.useMemo<UserContextValue>(() => {
    return {
      user,
      createGuestIfNeeded: async () => {
        // Public demo mode: no-op, no guest creation needed
      },
      getAbility: () => defineAbilityFor(user),
      ownsObject: (resource) => {
        return user ? isOwner(resource, { id: user.id }) : false;
      },
    };
  }, [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
